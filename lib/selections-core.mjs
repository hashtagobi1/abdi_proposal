// Turns a Google My Maps export of G's Selections into the data the map uses.
// Shared by the command-line script (scripts/build-selections.mjs) and the
// /admin page (app/api/admin/update/route.ts), so both behave the same.
//
// Steps: download the map as KML -> read each event -> find coordinates for
// each address (OpenStreetMap Nominatim, cached) -> build selections data.

const USER_AGENT = "london-selections-map/0.1 (open-source event map)";

// Rough box around Greater London, used to bias and sanity-check lookups.
const LONDON = { minLng: -0.52, maxLng: 0.34, minLat: 51.28, maxLat: 51.7 };

// ---------- Map links ----------

/** Accepts a full Google My Maps link (any variant) or a bare map id. */
export function parseMapId(input) {
  const s = String(input ?? "").trim();
  const fromUrl = s.match(/[?&]mid=([\w-]+)/);
  if (fromUrl) return fromUrl[1];
  if (/^[\w-]{20,}$/.test(s)) return s;
  return null;
}

export const viewerUrl = (mapId) =>
  `https://www.google.com/maps/d/viewer?mid=${mapId}`;

export async function fetchKml(mapId) {
  const res = await fetch(
    `https://www.google.com/maps/d/kml?mid=${mapId}&forcekml=1`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(
      `Couldn't download that map from Google (status ${res.status}). Check the link, and that the map is shared publicly.`
    );
  }
  const kml = await res.text();
  if (!kml.includes("<kml")) {
    throw new Error(
      "Google didn't return a map. Check the link, and that the map is shared publicly."
    );
  }
  return kml;
}

// ---------- KML parsing ----------

const decode = (s = "") =>
  s
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};

export function parseKml(kml) {
  const title = tag(kml.match(/<Document>[\s\S]*?<\/name>/)?.[0] ?? "", "name");
  const days = [];
  const events = [];
  const folders = kml.match(/<Folder>[\s\S]*?<\/Folder>/g) ?? [];
  folders.forEach((folder, dayIndex) => {
    const day = tag(folder, "name");
    days.push(day);
    const placemarks = folder.match(/<Placemark>[\s\S]*?<\/Placemark>/g) ?? [];
    for (const pm of placemarks) {
      const fields = {};
      for (const [, key, value] of pm.matchAll(
        /<Data name="([^"]+)">\s*<value>([\s\S]*?)<\/value>/g
      )) {
        fields[key] = decode(value);
      }
      const coords = pm.match(/<coordinates>\s*([-\d.]+),([-\d.]+)/);
      events.push({
        name: tag(pm, "name"),
        day,
        dayIndex,
        type: fields.Type ?? "",
        date: fields.Date ?? "",
        time: fields.Time ?? "",
        venue: fields.Venue ?? "",
        address: fields.Address || tag(pm, "address"),
        price: fields.Price ?? "",
        description: fields.Description ?? "",
        link: fields.Link ?? "",
        kmlCoords: coords ? { lng: +coords[1], lat: +coords[2] } : null,
      });
    }
  });
  return { title, days, events };
}

// ---------- Categories ----------
// G's "Type" field is free text, so group it into a few filterable buckets.
// First match wins.
/** @type {Array<[string, RegExp]>} */
export const CATEGORIES = [
  ["Film", /screening|film|cinema/i],
  ["Talks & Words", /talk|panel|poetry|spoken|storytelling|reading/i],
  ["Workshops & Art", /workshop|craft|drawing|art|textile|fashion|market|exhibition/i],
  ["Wellbeing", /restorative|movement|yoga|breath|wellness/i],
  ["Club & DJ", /club|dj|techno|house|sound system|party|vinyl|balearic|residency/i],
  ["Live Music", /music|jazz|jam|soul|funk|listening|band|gig|performance|dance/i],
];
export const categorise = (type) =>
  CATEGORIES.find(([, re]) => re.test(type))?.[0] ?? "Other";

// ---------- Locations ----------
//
// `cache` maps a search text to {lat, lng} (or null when nothing was found).
// `overrides` maps a venue or event name to either
//   {lat, lng, source}  - an exact spot, or
//   {address}           - better address text to search for instead.

const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inLondon = ({ lat, lng }) =>
  lat > LONDON.minLat && lat < LONDON.maxLat && lng > LONDON.minLng && lng < LONDON.maxLng;

let lastRequest = 0;
async function nominatim(q) {
  // Nominatim's usage policy: at most 1 request per second.
  const wait = lastRequest + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    countrycodes: "gb",
    viewbox: `${LONDON.minLng},${LONDON.maxLat},${LONDON.maxLng},${LONDON.minLat}`,
    bounded: "1",
  }).toString();
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Location lookup failed (status ${res.status})`);
  const [hit] = await res.json();
  return hit ? { lat: +hit.lat, lng: +hit.lon } : null;
}

const overrideFor = (ev, overrides) => overrides[ev.name] ?? overrides[ev.venue];

// Most precise search first, then looser ones.
function queriesFor(ev, overrides) {
  const qs = [];
  const fix = overrideFor(ev, overrides);
  if (fix?.address) {
    const a = fix.address.replace(/\s+/g, " ").trim();
    qs.push([a, "manual"]);
    const pc = a.match(POSTCODE)?.[0];
    if (pc) qs.push([pc.toUpperCase(), "manual"]);
    if (!/london/i.test(a)) qs.push([`${a}, London`, "manual"]);
  }
  const addr = ev.address.replace(/\s+/g, " ").trim();
  const pc = (addr.match(POSTCODE) || ev.venue.match(POSTCODE))?.[0];
  if (addr) qs.push([addr, "address"]);
  if (pc) qs.push([pc.toUpperCase(), "postcode"]);
  if (ev.venue && ev.venue !== addr) qs.push([`${ev.venue}, London`, "venue"]);
  if (addr && !/london/i.test(addr)) qs.push([`${addr}, London`, "address"]);
  return qs;
}

/**
 * Where an event goes, using only what is already known:
 *   {loc, by}  - found
 *   {needs}    - a search that hasn't been tried yet
 *   {loc: null} - every search tried, nothing found ("location TBC")
 */
function resolve(ev, cache, overrides) {
  const fix = overrideFor(ev, overrides);
  if (fix && typeof fix.lat === "number") return { loc: fix, by: "manual" };
  if (ev.kmlCoords) return { loc: ev.kmlCoords, by: "map" };
  for (const [q, by] of queriesFor(ev, overrides)) {
    if (!(q in cache)) return { needs: q };
    if (cache[q] && inLondon(cache[q])) return { loc: cache[q], by };
  }
  return { loc: null };
}

/**
 * Looks up untried searches until `deadline` (ms timestamp). Adds results to
 * `cache` as it goes. Returns how many events still need a lookup, so a
 * caller with a time limit can call it again.
 */
export async function lookUpLocations(events, cache, overrides, deadline = Infinity) {
  for (const ev of events) {
    let r = resolve(ev, cache, overrides);
    while (r.needs && Date.now() + 1500 < deadline) {
      cache[r.needs] = await nominatim(r.needs);
      r = resolve(ev, cache, overrides);
    }
  }
  return events.filter((ev) => resolve(ev, cache, overrides).needs).length;
}

// ---------- Final data ----------

const slugify = (name) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "") || "event";

/**
 * Builds the map data once lookups are done. Returns {data, missing}, where
 * `missing` lists events that couldn't be placed (shown as "location TBC").
 */
export function buildSelections({ mapId, title, days, events, cache, overrides }) {
  const missing = [];
  const out = events.map((raw) => {
    const r = resolve(raw, cache, overrides);
    const { kmlCoords, ...ev } = raw; // eslint-disable-line no-unused-vars
    ev.category = categorise(ev.type);
    if (r.loc) {
      ev.lat = +r.loc.lat.toFixed(6);
      ev.lng = +r.loc.lng.toFixed(6);
      ev.geocodedBy = r.by;
    } else {
      missing.push(ev);
    }
    return ev;
  });

  // Events at the same spot (same venue, different nights) would stack on
  // top of each other; nudge them apart slightly so each can be tapped.
  const seen = new Map();
  for (const ev of out.filter((e) => e.lat != null)) {
    const key = `${ev.lat},${ev.lng}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (n > 0) {
      const angle = n * 2.4;
      ev.lat = +(ev.lat + 0.00012 * Math.sin(angle) * Math.ceil(n / 6)).toFixed(6);
      ev.lng = +(ev.lng + 0.0002 * Math.cos(angle) * Math.ceil(n / 6)).toFixed(6);
    }
  }

  // Each event gets a readable URL: /selections/<slug>. Per-event URLs mean
  // every opened event shows up as its own page view in analytics.
  const slugs = new Set();
  out.forEach((ev, i) => {
    ev.id = i;
    const base = slugify(ev.name);
    let slug = base;
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;
    slugs.add(slug);
    ev.slug = slug;
  });

  return {
    data: {
      title,
      source: viewerUrl(mapId),
      generatedAt: new Date().toISOString(),
      days,
      categories: [...CATEGORIES.map(([c]) => c), "Other"],
      events: out,
    },
    missing,
  };
}

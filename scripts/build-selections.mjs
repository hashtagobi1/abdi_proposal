#!/usr/bin/env node
// Builds data/selections.json from a Google My Maps export of G's Selections.
//
//   node scripts/build-selections.mjs [mapId]
//
// 1. Downloads the map as KML (or reads data/source.kml if --offline is passed).
// 2. Reads each event's fields (Type, Date, Time, Venue, Address, Price,
//    Description, Link) and the day layer it sits in.
// 3. Looks up coordinates for each address with OpenStreetMap Nominatim,
//    caching results in data/geocode-cache.json so each address is only
//    looked up once. Manual fixes go in data/geocode-overrides.json.

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAP_ID = "1oXEFzPrZaHoNaEudRtKNpf1kDs0TDf4";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const CACHE_FILE = path.join(DATA, "geocode-cache.json");
const OVERRIDES_FILE = path.join(DATA, "geocode-overrides.json");
const OUT_FILE = path.join(DATA, "selections.json");
const SOURCE_FILE = path.join(DATA, "source.kml");
const USER_AGENT = "london-selections-map/0.1 (open-source event map)";

// Rough box around Greater London, used to bias and sanity-check lookups.
const LONDON = { minLng: -0.52, maxLng: 0.34, minLat: 51.28, maxLat: 51.7 };

const args = process.argv.slice(2);
const offline = args.includes("--offline");
const mapId = args.find((a) => !a.startsWith("--")) ?? DEFAULT_MAP_ID;

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

function parseKml(kml) {
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
const CATEGORIES = [
  ["Film", /screening|film|cinema/i],
  ["Talks & Words", /talk|panel|poetry|spoken|storytelling|reading/i],
  ["Workshops & Art", /workshop|craft|drawing|art|textile|fashion|market|exhibition/i],
  ["Wellbeing", /restorative|movement|yoga|breath|wellness/i],
  ["Club & DJ", /club|dj|techno|house|sound system|party|vinyl|balearic|residency/i],
  ["Live Music", /music|jazz|jam|soul|funk|listening|band|gig|performance|dance/i],
];
const categorise = (type) =>
  CATEGORIES.find(([, re]) => re.test(type))?.[0] ?? "Other";

// ---------- Geocoding ----------

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
  });
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for "${q}"`);
  const [hit] = await res.json();
  return hit ? { lat: +hit.lat, lng: +hit.lon } : null;
}

// Try the most precise query first, then fall back to looser ones.
function queriesFor(ev) {
  const qs = [];
  const addr = ev.address.replace(/\s+/g, " ").trim();
  const pc = (addr.match(POSTCODE) || ev.venue.match(POSTCODE))?.[0];
  if (addr) qs.push([addr, "address"]);
  if (pc) qs.push([pc.toUpperCase(), "postcode"]);
  if (ev.venue && ev.venue !== addr) qs.push([`${ev.venue}, London`, "venue"]);
  if (addr && !/london/i.test(addr)) qs.push([`${addr}, London`, "address"]);
  return qs;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  await fs.mkdir(DATA, { recursive: true });

  let kml;
  if (offline) {
    kml = await fs.readFile(SOURCE_FILE, "utf8");
  } else {
    const res = await fetch(
      `https://www.google.com/maps/d/kml?mid=${mapId}&forcekml=1`
    );
    if (!res.ok) throw new Error(`Could not download map ${mapId}: ${res.status}`);
    kml = await res.text();
    await fs.writeFile(SOURCE_FILE, kml);
  }

  const { title, days, events } = parseKml(kml);
  const cache = await readJson(CACHE_FILE, {});
  const overrides = await readJson(OVERRIDES_FILE, {});
  const missing = [];

  for (const ev of events) {
    ev.category = categorise(ev.type);
    let loc = null;
    let quality = null;

    const override = overrides[ev.name] ?? overrides[ev.venue];
    if (override) {
      loc = { lat: override.lat, lng: override.lng };
      quality = "manual";
    } else if (ev.kmlCoords) {
      loc = ev.kmlCoords;
      quality = "map";
    } else {
      for (const [q, kind] of queriesFor(ev)) {
        if (!(q in cache)) {
          try {
            cache[q] = await nominatim(q);
          } catch (err) {
            console.warn(`  ! ${err.message}`);
            continue; // don't cache failures, retry next run
          }
        }
        if (cache[q] && inLondon(cache[q])) {
          loc = cache[q];
          quality = kind;
          break;
        }
      }
    }

    delete ev.kmlCoords;
    if (loc) {
      ev.lat = +loc.lat.toFixed(6);
      ev.lng = +loc.lng.toFixed(6);
      ev.geocodedBy = quality;
    } else {
      missing.push(ev);
    }
  }

  // Events at the same spot (same venue, different nights) would stack on
  // top of each other; nudge them apart slightly so each can be tapped.
  const seen = new Map();
  for (const ev of events.filter((e) => e.lat != null)) {
    const key = `${ev.lat},${ev.lng}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (n > 0) {
      const angle = n * 2.4;
      ev.lat = +(ev.lat + 0.00012 * Math.sin(angle) * Math.ceil(n / 6)).toFixed(6);
      ev.lng = +(ev.lng + 0.0002 * Math.cos(angle) * Math.ceil(n / 6)).toFixed(6);
    }
  }

  // Each event gets a stable, readable URL slug: /selections/<slug>.
  // Per-event URLs mean every opened event shows up as its own page view.
  const slugs = new Set();
  events.forEach((ev, i) => {
    ev.id = i;
    const base =
      ev.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/, "") || "event";
    let slug = base;
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;
    slugs.add(slug);
    ev.slug = slug;
  });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify(
      {
        title,
        source: `https://www.google.com/maps/d/viewer?mid=${mapId}`,
        generatedAt: new Date().toISOString(),
        days,
        categories: [...CATEGORIES.map(([c]) => c), "Other"],
        events,
      },
      null,
      2
    ) + "\n"
  );

  const placed = events.length - missing.length;
  console.log(`${title}: ${placed}/${events.length} events placed on the map.`);
  if (missing.length) {
    console.log("Not found (add to data/geocode-overrides.json by event or venue name):");
    for (const ev of missing) console.log(`  - ${ev.name} @ ${ev.venue} | ${ev.address}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

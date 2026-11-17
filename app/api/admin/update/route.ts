import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  buildSelections,
  fetchKml,
  lookUpLocations,
  parseKml,
  parseMapId,
} from "@/lib/selections-core.mjs";
import {
  getGeocodeCache,
  getOverrides,
  saveGeocodeCache,
  saveOverrides,
  saveSelections,
} from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Location lookups are limited to one a second, so a new week can take a
// minute or two. Each request does a slice of the work and saves its
// progress; /admin keeps calling until the response says "done".
const TIME_BUDGET_MS = 8000;

const digest = (s: string) => crypto.createHash("sha256").update(s).digest();

function checkPassword(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "The admin password hasn't been set up yet (ADMIN_PASSWORD in Vercel)." },
      { status: 503 }
    );
  }
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!crypto.timingSafeEqual(digest(given), digest(expected))) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  return null;
}

type Body = { map?: string; fixes?: Record<string, string> };

export async function POST(req: Request) {
  const denied = checkPassword(req);
  if (denied) return denied;

  const started = Date.now();
  const body = (await req.json().catch(() => ({}))) as Body;
  const mapId = parseMapId(body.map);
  if (!mapId) {
    return NextResponse.json(
      { error: "That doesn't look like a Google My Maps link." },
      { status: 400 }
    );
  }

  try {
    // Address fixes typed into /admin for venues that couldn't be found.
    const overrides = await getOverrides();
    let overridesChanged = false;
    for (const [venue, text] of Object.entries(body.fixes ?? {})) {
      const address = text.trim();
      const current = overrides[venue];
      if (address) {
        if (!current || !("address" in current) || current.address !== address) {
          overrides[venue] = { address };
          overridesChanged = true;
        }
      } else if (current && "address" in current) {
        delete overrides[venue];
        overridesChanged = true;
      }
    }
    if (overridesChanged) await saveOverrides(overrides);

    const kml = await fetchKml(mapId);
    const { title, days, events } = parseKml(kml);
    if (!events.length) {
      return NextResponse.json(
        { error: "That map has no events on it." },
        { status: 422 }
      );
    }

    const cache = await getGeocodeCache();
    const before = Object.keys(cache).length;
    let remaining: number;
    try {
      remaining = await lookUpLocations(
        events,
        cache,
        overrides,
        started + TIME_BUDGET_MS
      );
    } finally {
      if (Object.keys(cache).length !== before) await saveGeocodeCache(cache);
    }

    if (remaining > 0) {
      return NextResponse.json({ status: "working", title, total: events.length, remaining });
    }

    const { data, missing } = buildSelections({ mapId, title, days, events, cache, overrides });
    await saveSelections(data);

    return NextResponse.json({
      status: "done",
      title,
      total: events.length,
      placed: events.length - missing.length,
      missing: missing.map((e: { name: string; venue: string; address: string; day: string }) => ({
        name: e.name,
        venue: e.venue,
        address: e.address,
        day: e.day,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 502 }
    );
  }
}

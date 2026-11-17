#!/usr/bin/env node
// Builds data/selections.json from a Google My Maps export of G's Selections.
// This is the offline/back-up route; normally the map is updated from /admin.
//
//   node scripts/build-selections.mjs [map link or id] [--offline]
//
// --offline reads data/source.kml instead of downloading. Location lookups
// are cached in data/geocode-cache.json; manual fixes go in
// data/geocode-overrides.json (see lib/selections-core.mjs for the format).

import fs from "node:fs/promises";
import path from "node:path";
import {
  buildSelections,
  fetchKml,
  lookUpLocations,
  parseKml,
  parseMapId,
} from "../lib/selections-core.mjs";

const DEFAULT_MAP_ID = "1oXEFzPrZaHoNaEudRtKNpf1kDs0TDf4";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");
const CACHE_FILE = path.join(DATA, "geocode-cache.json");
const OVERRIDES_FILE = path.join(DATA, "geocode-overrides.json");
const OUT_FILE = path.join(DATA, "selections.json");
const SOURCE_FILE = path.join(DATA, "source.kml");

const args = process.argv.slice(2);
const offline = args.includes("--offline");
const input = args.find((a) => !a.startsWith("--"));
const mapId = input ? parseMapId(input) : DEFAULT_MAP_ID;

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  if (!mapId) throw new Error(`Not a Google My Maps link or id: ${input}`);
  await fs.mkdir(DATA, { recursive: true });

  let kml;
  if (offline) {
    kml = await fs.readFile(SOURCE_FILE, "utf8");
  } else {
    kml = await fetchKml(mapId);
    await fs.writeFile(SOURCE_FILE, kml);
  }

  const { title, days, events } = parseKml(kml);
  const cache = await readJson(CACHE_FILE, {});
  const overrides = await readJson(OVERRIDES_FILE, {});

  await lookUpLocations(events, cache, overrides);
  const { data, missing } = buildSelections({ mapId, title, days, events, cache, overrides });

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
  await fs.writeFile(OUT_FILE, JSON.stringify(data, null, 2) + "\n");

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

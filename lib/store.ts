// Where the live map data is kept.
//
// On Vercel: a private Vercel Blob store (BLOB_READ_WRITE_TOKEN is set by
// Vercel when the store is connected to the project). Locally, without that
// token: plain files in .local-store/. If nothing has been saved yet, the map
// falls back to data/selections.json from the repo.
//
// Freshness: map pages read through the storage CDN (cached up to 60s) and
// keep the result in memory for 30s, so an update from /admin is live within
// about a minute. /admin and updates always read the latest copy.

import { get, put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import bundledSelections from "@/data/selections.json";
import bundledCache from "@/data/geocode-cache.json";
import bundledOverrides from "@/data/geocode-overrides.json";
import type { SelectionsData } from "@/app/selections/data";

const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const LOCAL_DIR = path.join(process.cwd(), ".local-store");

const CDN_SECONDS = 60;
const MEMORY_MS = 30_000;
const memory = new Map<string, { at: number; value: unknown }>();

async function readJson<T>(name: string, fresh: boolean): Promise<T | null> {
  const hit = memory.get(name);
  if (!fresh && hit && Date.now() - hit.at < MEMORY_MS) return hit.value as T;
  const value = await readStored<T>(name, fresh);
  if (value !== null) memory.set(name, { at: Date.now(), value });
  return value;
}

async function readStored<T>(name: string, fresh: boolean): Promise<T | null> {
  try {
    if (blobEnabled()) {
      const res = await get(`selections/${name}`, {
        access: "private",
        useCache: !fresh,
      });
      if (!res || res.statusCode !== 200 || !res.stream) return null;
      return JSON.parse(await new Response(res.stream).text()) as T;
    }
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, name), "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeJson(name: string, value: unknown) {
  memory.set(name, { at: Date.now(), value });
  const body = JSON.stringify(value);
  if (blobEnabled()) {
    await put(`selections/${name}`, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: CDN_SECONDS,
    });
    return;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, name), body);
}

export type GeocodeCache = Record<string, { lat: number; lng: number } | null>;
export type Overrides = Record<
  string,
  { lat: number; lng: number; source?: string } | { address: string }
>;

/** For the map. Pass fresh=true to skip caches (admin). */
export const getSelections = async (fresh = false) =>
  (await readJson<SelectionsData>("current.json", fresh)) ??
  (bundledSelections as SelectionsData);
export const saveSelections = (data: SelectionsData) =>
  writeJson("current.json", data);

export const getGeocodeCache = async () =>
  (await readJson<GeocodeCache>("geocode-cache.json", true)) ??
  (bundledCache as GeocodeCache);
export const saveGeocodeCache = (cache: GeocodeCache) =>
  writeJson("geocode-cache.json", cache);

export const getOverrides = async () =>
  (await readJson<Overrides>("overrides.json", true)) ?? (bundledOverrides as Overrides);
export const saveOverrides = (o: Overrides) => writeJson("overrides.json", o);

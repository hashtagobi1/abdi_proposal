import { getOverrides, getSelections } from "@/lib/store";
import { hasLocation } from "../selections/data";
import AdminPanel from "./AdminPanel";

export const metadata = {
  title: "Update the map · G's Selections",
  robots: { index: false, follow: false },
};

// Always show what's live right now.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [data, overrides] = await Promise.all([getSelections(true), getOverrides()]);

  // One row per venue that couldn't be placed, with any fix already saved.
  const tbc = new Map<string, { venue: string; events: string[]; fix: string }>();
  for (const e of data.events.filter((e) => !hasLocation(e))) {
    const key = e.venue || e.name;
    const o = overrides[key];
    const row = tbc.get(key) ?? {
      venue: key,
      events: [],
      fix: o && "address" in o ? o.address : "",
    };
    row.events.push(`${e.name} (${e.day})`);
    tbc.set(key, row);
  }

  return (
    <AdminPanel
      current={{
        title: data.title,
        source: data.source,
        total: data.events.length,
        placed: data.events.filter(hasLocation).length,
        updatedAt: data.generatedAt ?? null,
      }}
      tbc={Array.from(tbc.values())}
    />
  );
}

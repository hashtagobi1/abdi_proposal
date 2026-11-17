import { notFound } from "next/navigation";
import { findBySlug } from "../data";
import { getSelections } from "@/lib/store";

type Props = { params: { event: string } };

// One URL per event, so each opened event counts as its own page view and
// can be shared directly. The explorer in ../layout.tsx draws the page.
// Rendered on request, like the layout, so new weeks from /admin just work.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const e = findBySlug(await getSelections(), params.event);
  if (!e) return {};
  const description = [e.day, e.time, e.venue].filter(Boolean).join(" · ");
  return {
    title: `${e.name} · G's Selections`,
    description,
    openGraph: { title: e.name, description },
  };
}

export default async function EventPage({ params }: Props) {
  if (!findBySlug(await getSelections(), params.event)) notFound();
  return null;
}

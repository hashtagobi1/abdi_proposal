import { notFound } from "next/navigation";
import { data, findBySlug } from "../data";

type Props = { params: { event: string } };

// One URL per event, so each opened event counts as its own page view and
// can be shared directly. The explorer in ../layout.tsx draws the page.
export function generateStaticParams() {
  return data.events.map((e) => ({ event: e.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: Props) {
  const e = findBySlug(params.event);
  if (!e) return {};
  const description = [e.day, e.time, e.venue].filter(Boolean).join(" · ");
  return {
    title: `${e.name} · G's Selections`,
    description,
    openGraph: { title: e.name, description },
  };
}

export default function EventPage({ params }: Props) {
  if (!findBySlug(params.event)) notFound();
  return null;
}

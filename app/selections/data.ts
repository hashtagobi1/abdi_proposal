import raw from "@/data/selections.json";

export type SelectionEvent = {
  id: number;
  slug: string;
  name: string;
  day: string;
  dayIndex: number;
  type: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  price: string;
  description: string;
  link: string;
  lat?: number;
  lng?: number;
};

export type SelectionsData = {
  title: string;
  source: string;
  days: string[];
  categories: string[];
  events: SelectionEvent[];
};

export const data = raw as SelectionsData;

// Readable on black, and close to the site's Tube-line orange/yellow.
export const CATEGORY_COLORS: Record<string, string> = {
  "Live Music": "#D8592C",
  "Club & DJ": "#EEE97E",
  Film: "#5FA8F5",
  "Talks & Words": "#C58AF0",
  "Workshops & Art": "#4FC99A",
  Wellbeing: "#F27BA6",
  Other: "#A3A3A3",
};

export const colorFor = (category: string) =>
  CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;

export const hasLocation = (e: SelectionEvent) =>
  typeof e.lat === "number" && typeof e.lng === "number";

// "Thursday 12th" -> "Thu 12"
export const shortDay = (day: string) => {
  const [name, num] = day.split(" ");
  return `${name?.slice(0, 3) ?? ""} ${parseInt(num ?? "", 10) || ""}`.trim();
};

export const findBySlug = (slug?: string | null) =>
  slug ? data.events.find((e) => e.slug === slug) : undefined;

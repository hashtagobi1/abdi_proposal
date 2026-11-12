"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import {
  ArrowTopRightOnSquareIcon,
  ChevronUpIcon,
  MapPinIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  SelectionEvent,
  colorFor,
  data,
  findBySlug,
  hasLocation,
  shortDay,
} from "./data";

// The map needs the browser (WebGL), so it is never rendered on the server.
const SelectionsMap = dynamic(() => import("./SelectionsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center text-neutral-500 font-LU_Regular">
      loading the map…
    </div>
  ),
});

const SHEET_PEEK = 76; // px of the mobile sheet visible when collapsed

// "Thursday 12th" matches today if the weekday and date both match.
const isToday = (day: string) => {
  const now = new Date();
  const [name, num] = day.split(" ");
  return (
    now.toLocaleDateString("en-GB", { weekday: "long" }) === name &&
    now.getDate() === parseInt(num ?? "", 10)
  );
};

export default function SelectionsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const slug = pathname?.split("/")[2];
  const selected = findBySlug(slug);

  const [day, setDay] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setIsDesktop(mq.matches);
      setViewportHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Each opened event is also its own URL (/selections/<slug>), so it is
  // counted as a page view. This custom event is a second, explicit count.
  useEffect(() => {
    if (selected) {
      track("Event viewed", {
        event: selected.slug,
        day: selected.day,
        category: selected.category,
      });
    }
  }, [selected]);

  const filtered = useMemo(
    () =>
      data.events.filter(
        (e) =>
          (day === null || e.dayIndex === day) &&
          (category === null || e.category === category)
      ),
    [day, category]
  );
  const unplaced = filtered.filter((e) => !hasLocation(e)).length;
  const categoriesInUse = data.categories.filter((c) =>
    data.events.some((e) => e.category === c)
  );

  const select = (s: string) => router.push(`/selections/${s}`);
  const close = () => router.push("/selections");

  // On mobile, the sheet covers the lower part of the map.
  const bottomPadding = isDesktop
    ? 0
    : selected
    ? Math.round(viewportHeight * 0.5)
    : sheetOpen
    ? Math.round(viewportHeight * 0.55)
    : SHEET_PEEK;

  const list = (
    <EventList
      events={filtered}
      groupByDay={day === null}
      onSelect={(s) => {
        setSheetOpen(false);
        select(s);
      }}
    />
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white md:flex-row">
      {/* Sidebar on desktop; on mobile only the header shows at the top. */}
      <aside className="contents md:flex md:w-[400px] md:shrink-0 md:flex-col md:border-r md:border-neutral-800">
        <header className="shrink-0 border-b border-neutral-800 px-4 pt-2 pb-2 md:pt-4">
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 font-LU_Regular">
            <Link href="/" className="py-1">
              ← summer is ours
            </Link>
            <a
              href={data.source}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 underline"
            >
              G&apos;s original map
            </a>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="shrink-0 whitespace-nowrap font-LU_Heavy text-xl leading-tight text-mainYellow md:text-2xl">
              G&apos;s Selections
            </h1>
            <p className="truncate text-sm text-neutral-300 font-LU_Regular">
              {data.title.replace(/^G's Selections\s*-\s*/i, "")} ·{" "}
              {filtered.length} events
            </p>
          </div>

          <Chips label="Day">
            <Chip active={day === null} onClick={() => setDay(null)}>
              All week
            </Chip>
            {data.days.map((d, i) => (
              <Chip key={d} active={day === i} onClick={() => setDay(i)}>
                {isToday(d) ? "Today" : shortDay(d)}
              </Chip>
            ))}
          </Chips>
          <Chips label="Type">
            <Chip active={category === null} onClick={() => setCategory(null)}>
              Everything
            </Chip>
            {categoriesInUse.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(category === c ? null : c)}
                color={colorFor(c)}
              >
                {c}
              </Chip>
            ))}
          </Chips>
        </header>

        <div className="hidden md:block flex-1 overflow-y-auto">
          {selected ? <EventCard event={selected} onClose={close} /> : list}
        </div>
      </aside>

      <main className="relative flex-1 min-h-0">
        <SelectionsMap
          events={filtered}
          selected={selected}
          onSelect={select}
          bottomPadding={bottomPadding}
        />

        {/* Mobile bottom sheet */}
        <section
          className="md:hidden absolute inset-x-0 bottom-0 z-10 rounded-t-2xl border-t border-neutral-700 bg-black/95 backdrop-blur shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {selected ? (
            <div className="max-h-[50dvh] overflow-y-auto">
              <EventCard event={selected} onClose={close} />
            </div>
          ) : (
            <>
              <button
                onClick={() => setSheetOpen(!sheetOpen)}
                className="flex w-full items-center justify-between px-4"
                style={{ height: SHEET_PEEK }}
                aria-expanded={sheetOpen}
              >
                <span className="text-left">
                  <span className="block font-LU_Heavy text-lg">
                    {sheetOpen ? "Hide list" : `See all ${filtered.length}`}
                  </span>
                  {unplaced > 0 && (
                    <span className="block text-xs text-neutral-400">
                      {unplaced} with location TBC (in the list)
                    </span>
                  )}
                </span>
                <ChevronUpIcon
                  className={`h-7 w-7 text-DT_Yellow transition-transform ${
                    sheetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {sheetOpen && (
                <div className="max-h-[55dvh] overflow-y-auto border-t border-neutral-800">
                  {list}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Chips({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
    >
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-LU_Medium transition-colors ${
        active
          ? "border-DT_Yellow bg-DT_Yellow text-black"
          : "border-neutral-700 text-neutral-200"
      }`}
    >
      {color && (
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-black"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}

function EventList({
  events,
  groupByDay,
  onSelect,
}: {
  events: SelectionEvent[];
  groupByDay: boolean;
  onSelect: (slug: string) => void;
}) {
  if (!events.length) {
    return (
      <p className="p-6 text-center text-neutral-400">
        Nothing matches those filters.
      </p>
    );
  }
  return (
    <ul>
      {events.map((e, i) => (
        <li key={e.slug}>
          {groupByDay && events[i - 1]?.day !== e.day && (
            <h2 className="sticky top-0 z-10 bg-neutral-900 px-4 py-1.5 font-LU_Heavy text-sm uppercase tracking-wider text-DT_Orange">
              {isToday(e.day) ? `Today · ${e.day}` : e.day}
            </h2>
          )}
          <button
            onClick={() => onSelect(e.slug)}
            className="flex w-full gap-3 border-b border-neutral-900 px-4 py-3 text-left active:bg-neutral-900 hover:bg-neutral-900"
          >
            <span
              className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: colorFor(e.category) }}
            />
            <span className="min-w-0">
              <span className="block font-LU_Medium leading-snug">{e.name}</span>
              <span className="block truncate text-sm text-neutral-400">
                {e.time && `${e.time} · `}
                {e.venue}
                {!hasLocation(e) && " · location TBC"}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EventCard({
  event: e,
  onClose,
}: {
  event: SelectionEvent;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const directions = hasLocation(e)
    ? `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${e.venue} ${e.address} London`
      )}`;

  const share = async () => {
    const url = window.location.href;
    track("Event shared", { event: e.slug });
    if (navigator.share) {
      try {
        await navigator.share({ title: e.name, text: `${e.name} — G's Selections`, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-neutral-300">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: colorFor(e.category) }}
          />
          {e.type || e.category}
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          className="-m-2 p-2 text-neutral-300 hover:text-DT_Orange"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>
      <h2 className="mt-1 font-LU_Heavy text-2xl leading-tight text-mainYellow">
        {e.name}
      </h2>
      <dl className="mt-3 space-y-1 text-[15px]">
        <div>
          <dt className="sr-only">When</dt>
          <dd>
            {e.day}
            {e.time && ` · ${e.time}`}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt className="sr-only">Where</dt>
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-DT_Orange" />
          <dd>
            {e.venue}
            {e.address && e.address !== e.venue && (
              <span className="block text-sm text-neutral-400">{e.address}</span>
            )}
            {!hasLocation(e) && (
              <span className="block text-sm text-DT_Yellow">
                Exact location TBC, so it&apos;s not on the map yet.
              </span>
            )}
          </dd>
        </div>
        {e.price && (
          <div>
            <dt className="sr-only">Price</dt>
            <dd className="font-LU_Medium">{e.price}</dd>
          </div>
        )}
      </dl>
      {e.description && (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-neutral-200">
          {e.description}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {e.link && (
          <a
            href={e.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("Ticket link clicked", { event: e.slug })}
            className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-DT_Orange py-3 font-LU_Heavy text-black"
          >
            Tickets &amp; info
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </a>
        )}
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 py-3 font-LU_Medium"
        >
          Directions
        </a>
        <button
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 py-3 font-LU_Medium"
        >
          <ShareIcon className="h-5 w-5" />
          {copied ? "Link copied" : "Share"}
        </button>
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        Picked by G · from G&apos;s Selections
      </p>
    </article>
  );
}

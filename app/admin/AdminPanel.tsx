"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Current = {
  title: string;
  source: string;
  total: number;
  placed: number;
  updatedAt: string | null;
};
type TbcRow = { venue: string; events: string[]; fix: string };
type Missing = { name: string; venue: string; address: string; day: string };

const PASSWORD_KEY = "gs-admin-password";

export default function AdminPanel({
  current,
  tbc,
}: {
  current: Current;
  tbc: TbcRow[];
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [mapLink, setMapLink] = useState(current.source);
  const [fixes, setFixes] = useState<Record<string, string>>(
    Object.fromEntries(tbc.map((r) => [r.venue, r.fix]))
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    title: string;
    total: number;
    placed: number;
    missing: Missing[];
  } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PASSWORD_KEY);
    if (saved) {
      setPassword(saved);
      setSignedIn(true);
    }
  }, []);

  useEffect(() => {
    setFixes(Object.fromEntries(tbc.map((r) => [r.venue, r.fix])));
  }, [tbc]);

  const run = async (withFixes: boolean) => {
    setBusy(true);
    setError("");
    setResult(null);
    setProgress("Downloading the map from Google…");
    try {
      // Keep going until the server has found every location it can.
      for (let round = 0; round < 60; round++) {
        const res = await fetch("/api/admin/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${password}`,
          },
          body: JSON.stringify({ map: mapLink, fixes: withFixes ? fixes : undefined }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          sessionStorage.removeItem(PASSWORD_KEY);
          setSignedIn(false);
          throw new Error("Wrong password. Try again.");
        }
        if (!res.ok) throw new Error(json.error ?? `Update failed (${res.status}).`);
        if (json.status === "done") {
          setResult(json);
          setProgress("");
          router.refresh(); // reload the "location TBC" list below
          return;
        }
        setProgress(
          `Finding locations… ${json.remaining} of ${json.total} events still to look up. Keep this page open.`
        );
      }
      throw new Error("This is taking longer than expected. Press Update again to carry on.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  if (!signedIn) {
    return (
      <Shell>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            sessionStorage.setItem(PASSWORD_KEY, password);
            setSignedIn(true);
          }}
        >
          <label className="block text-sm font-LU_Medium" htmlFor="pw">
            Admin password
          </label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-linestrong bg-page px-3 py-3 text-base"
          />
          {error && <p className="text-sm text-DT_Orange">{error}</p>}
          <button
            type="submit"
            disabled={!password}
            className="w-full rounded-lg bg-DT_Yellow py-3 font-LU_Heavy text-black disabled:opacity-50"
          >
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  const updated = current.updatedAt
    ? new Date(current.updatedAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "never";

  return (
    <Shell>
      <section className="mt-5 rounded-xl border border-line p-4">
        <h2 className="font-LU_Heavy text-lg">Live now</h2>
        <p className="mt-1">{current.title}</p>
        <p className="text-sm text-muted">
          {current.placed} of {current.total} events on the map · updated {updated}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-LU_Heavy text-lg">Update the map</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-fg2">
          <li>
            In Google My Maps, press <b>Share</b> and make sure anyone with the
            link can view it.
          </li>
          <li>Copy the map&apos;s link and paste it here.</li>
          <li>
            Press <b>Update map</b>. A new week takes a minute or two while it
            finds each venue.
          </li>
        </ol>
        <label className="mt-4 block text-sm font-LU_Medium" htmlFor="map">
          Google My Maps link
        </label>
        <input
          id="map"
          type="url"
          inputMode="url"
          value={mapLink}
          onChange={(e) => setMapLink(e.target.value)}
          placeholder="https://www.google.com/maps/d/viewer?mid=…"
          className="mt-1 w-full rounded-lg border border-linestrong bg-page px-3 py-3 text-base"
        />
        <button
          onClick={() => run(false)}
          disabled={busy || !mapLink}
          className="mt-3 w-full rounded-lg bg-DT_Yellow py-3 font-LU_Heavy text-black disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update map"}
        </button>
      </section>

      <Status progress={progress} error={error} result={result} />

      {tbc.length > 0 && (
        <section className="mt-8">
          <h2 className="font-LU_Heavy text-lg">Location TBC</h2>
          <p className="mt-1 text-sm text-fg2">
            These venues couldn&apos;t be found from the map, so they&apos;re only in
            the list. Add a full address or postcode, then save. Fixes are
            remembered for future weeks.
          </p>
          <div className="mt-3 space-y-4">
            {tbc.map((row) => (
              <div key={row.venue}>
                <label
                  className="block font-LU_Medium"
                  htmlFor={`fix-${row.venue}`}
                >
                  {row.venue}
                </label>
                <p className="text-xs text-muted">{row.events.join(" · ")}</p>
                <input
                  id={`fix-${row.venue}`}
                  value={fixes[row.venue] ?? ""}
                  onChange={(e) =>
                    setFixes({ ...fixes, [row.venue]: e.target.value })
                  }
                  placeholder="e.g. 2-6 Example Road, London E8 1AB"
                  className="mt-1 w-full rounded-lg border border-linestrong bg-page px-3 py-2.5 text-base"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => run(true)}
            disabled={busy}
            className="mt-4 w-full rounded-lg border border-linestrong py-3 font-LU_Heavy disabled:opacity-50"
          >
            Save addresses &amp; update
          </button>
        </section>
      )}

      <button
        onClick={() => {
          sessionStorage.removeItem(PASSWORD_KEY);
          setPassword("");
          setSignedIn(false);
        }}
        className="mt-10 text-sm text-muted underline"
      >
        Sign out
      </button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-page px-4 py-6 text-fg">
      <a href="/selections" className="text-xs text-muted underline font-LU_Regular">
        ← back to the map
      </a>
      <h1 className="mt-2 font-LU_Heavy text-2xl text-title">
        G&apos;s Selections · Admin
      </h1>
      {children}
    </main>
  );
}

function Status({
  progress,
  error,
  result,
}: {
  progress: string;
  error: string;
  result: { title: string; total: number; placed: number; missing: Missing[] } | null;
}) {
  if (progress)
    return (
      <p role="status" className="mt-4 rounded-lg bg-raised p-3 text-sm">
        {progress}
      </p>
    );
  if (error)
    return (
      <p role="alert" className="mt-4 rounded-lg border border-DT_Orange p-3 text-sm text-DT_Orange">
        {error}
      </p>
    );
  if (result)
    return (
      <div role="status" className="mt-4 rounded-lg bg-raised p-3 text-sm">
        <p className="font-LU_Medium">
          Done. {result.title}: {result.placed} of {result.total} events are on
          the map. It&apos;ll be live within about a minute.
        </p>
        {result.missing.length > 0 && (
          <p className="mt-1 text-fg2">
            {result.missing.length} still have location TBC. You can fix them
            below.
          </p>
        )}
        <a href="/selections" className="mt-2 inline-block underline">
          View the live map →
        </a>
      </div>
    );
  return null;
}

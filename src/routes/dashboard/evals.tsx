import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/dashboard/evals")({
  head: () => ({
    meta: [{ title: "Evals — LATCH" }],
  }),
  component: EvalsPage,
});

function EvalsPage() {
  const [results, setResults] = useState<Array<{ id: string; name: string; ok: boolean; detail: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/latch/goldens", { method: "POST" });
      const json = (await res.json()) as {
        results?: Array<{ id: string; name: string; ok: boolean; detail: string }>;
        error?: string;
      };
      if (!json.results) throw new Error(json.error ?? "goldens_failed");
      setResults(json.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
  }, []);

  return (
    <SitePage>
      <PageHead
        eyebrow="Evals"
        title={
          <>
            Goldens G1–G4 · <span className="lx-serif">fail-closed</span>
          </>
        }
        sub="Mutation and force-fail live here. No fake greens."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24 }}>
        <button className="lx-pill" disabled={busy} onClick={() => void run()}>
          Re-run goldens
        </button>
        <Link to="/dashboard" className="lx-pill-ghost" style={{ marginLeft: 12 }}>
          Console
        </Link>
        {error ? <p className="lx-body" style={{ color: "#b42318", marginTop: 16 }}>{error}</p> : null}
        {results ? (
          <ul className="lx-body" style={{ marginTop: 24 }}>
            {results.map((r) => (
              <li key={r.id}>
                {r.ok ? "PASS" : "FAIL"} {r.id} {r.name} — {r.detail}
              </li>
            ))}
          </ul>
        ) : (
          <p className="lx-small" style={{ marginTop: 24 }}>Running…</p>
        )}
      </section>
    </SitePage>
  );
}

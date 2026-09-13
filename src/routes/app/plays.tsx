import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/plays")({
  head: () => ({ meta: [{ title: "Plays — Latch" }] }),
  component: PlaysPage,
});

type PlayRun = {
  id: string;
  state: string;
  draftReason?: string;
  greenCount: number;
  assertTotal: number;
  steps: Array<{ name: string; status: string; externalId: string | null; ms: number; error?: string }>;
  evidence: { accountName: string; arrAtRiskUsd: number; signalSummary: string };
};

function PlaysPage() {
  const [play, setPlay] = useState<PlayRun | null>(null);
  const [history, setHistory] = useState<PlayRun[]>([]);
  const [busy, setBusy] = useState(false);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/latch/plays", { credentials: "include" });
    const json = await res.json();
    if (json.ok) setHistory(json.plays || []);
  }, []);

  const run = useCallback(
    async (injectFail: string | null) => {
      setBusy(true);
      try {
        const res = await fetch("/api/latch/run", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ injectFail, forceNew: true }),
        });
        const json = await res.json();
        if (!json.ok || !json.play) throw new Error(json.error || "Run failed");
        setPlay(json.play);
        toast.success(json.play.state === "LATCHED" ? "Play latched" : "Play finished");
        await loadHistory();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [loadHistory],
  );

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <AppShell title="Plays" subtitle="Every save attempt with step proof — or a clean rollback.">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(null)}
          className="rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Running…" : "Run save play"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("slack_alert")}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          Force Slack fail
        </button>
      </div>

      {play ? (
        <div className="rounded-2xl border border-black/8 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">{play.id}</p>
              <h2 className="mt-1 text-lg font-semibold">{play.evidence.accountName}</h2>
              <p className="text-sm text-black/55">{play.evidence.signalSummary}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{play.state}</p>
              <p className="text-xs text-black/45">
                {play.greenCount}/{play.assertTotal} asserts · ${play.evidence.arrAtRiskUsd.toLocaleString()} ARR
              </p>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-black/6">
            {play.steps.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-black/45">{s.externalId || s.error || "—"}</p>
                </div>
                <span className="capitalize text-black/60">
                  {s.status} · {s.ms}ms
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 px-5 py-10 text-center text-sm text-black/50">
          Run a play to see live steps and proof IDs.
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-black/8 bg-white">
        <div className="border-b border-black/6 px-5 py-4">
          <h2 className="text-base font-semibold">Recent plays</h2>
        </div>
        {history.length === 0 ? (
          <p className="px-5 py-6 text-sm text-black/50">No plays on this instance yet.</p>
        ) : (
          <ul className="divide-y divide-black/6">
            {history.slice(0, 12).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{p.evidence?.accountName || p.id}</p>
                  <p className="truncate text-xs text-black/45">{p.id}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-black/10 px-2.5 py-1 text-xs font-medium"
                  onClick={() => setPlay(p)}
                >
                  {p.state}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

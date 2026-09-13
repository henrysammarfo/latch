import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/tour")({
  head: () => ({
    meta: [
      { title: "Tour — Latch" },
      {
        name: "description",
        content: "Click-by-click walkthrough of the Latch save-play flow inside your workspace.",
      },
    ],
  }),
  component: TourPage,
});

type StepId = "overview" | "agents" | "connections" | "run" | "fail" | "evals" | "done";

type Step = {
  id: StepId;
  title: string;
  click: string;
  why: string;
  to?: "/app" | "/app/agents" | "/app/connections" | "/app/plays" | "/app/evals";
  action?: "run" | "fail";
};

const STEPS: Step[] = [
  {
    id: "overview",
    title: "Open your workspace",
    click: "You’re on Overview — see agents, connections, and play counts.",
    why: "This is the home board for your tenant.",
    to: "/app",
  },
  {
    id: "agents",
    title: "Create or open an agent",
    click: "Go to Agents → create one (or open Churn watch) → Save if you edit.",
    why: "Agents own the churn motion for this workspace.",
    to: "/app/agents",
  },
  {
    id: "connections",
    title: "Check tool connections",
    click: "Open Connections — Slack, Google, Stripe should show Configured.",
    why: "Save plays only go live when connectors are ready.",
    to: "/app/connections",
  },
  {
    id: "run",
    title: "Run a save play",
    click: "Click Run save play below (or on Plays). Wait for LATCHED + step proofs.",
    why: "Core flow: Slack → Sheets → Calendar → Gmail draft, greens only with proof.",
    to: "/app/plays",
    action: "run",
  },
  {
    id: "fail",
    title: "Force a Slack fail",
    click: "Click Force Slack fail. Expect UNLATCHED + compensate — not a fake green.",
    why: "Reliability is the product. Fail closed, then roll back.",
    to: "/app/plays",
    action: "fail",
  },
  {
    id: "evals",
    title: "Re-run goldens",
    click: "Open Evals → Re-run goldens. G1–G4 should PASS.",
    why: "Production-proven suite: latch, compensate, idempotent replay, mutation block.",
    to: "/app/evals",
  },
  {
    id: "done",
    title: "You’re live",
    click: "That’s the full core loop. Keep agents active; flip live mode when ready.",
    why: "Draft-only Gmail. No silent greens. Residual risk documented — never “unhackable.”",
  },
];

const STORAGE_KEY = "latch.tour.done";

function TourPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<StepId>("overview");
  const [busy, setBusy] = useState(false);
  const [lastPlay, setLastPlay] = useState<{ id: string; state: string; greenCount: number; assertTotal: number } | null>(
    null,
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  function mark(id: StepId) {
    setDone((prev) => {
      const next = { ...prev, [id]: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const progress = useMemo(() => STEPS.filter((s) => done[s.id]).length, [done]);
  const found = STEPS.find((s) => s.id === active);
  const current: Step = found ?? {
    id: "overview",
    title: "Open your workspace",
    click: "You’re on Overview — see agents, connections, and play counts.",
    why: "This is the home board for your tenant.",
    to: "/app",
  };

  async function runPlay(injectFail: string | null) {
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
      setLastPlay({
        id: json.play.id,
        state: json.play.state,
        greenCount: json.play.greenCount,
        assertTotal: json.play.assertTotal,
      });
      toast.success(json.play.state === "LATCHED" ? "Play latched" : "Play finished — check compensation");
      mark(injectFail ? "fail" : "run");
      if (!injectFail) setActive("fail");
      else setActive("evals");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Click-through tour"
      subtitle="Do each step in order. Buttons open the real pages — or run the play right here."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white px-5 py-4">
        <div>
          <p className="text-sm font-medium">
            {progress}/{STEPS.length} steps done
          </p>
          <p className="text-xs text-black/50">Click a step, then hit the action. Nothing is fake.</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-black/8">
          <div
            className="h-full rounded-full bg-[oklch(0.45_0.12_145)] transition-all"
            style={{ width: `${(progress / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const isDone = Boolean(done[s.id]);
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    isActive ? "border-[oklch(0.45_0.12_145)] bg-[oklch(0.97_0.02_145)]" : "border-black/8 bg-white hover:border-black/20"
                  }`}
                >
                  <span className="mt-0.5">
                    {isDone ? (
                      <Check size={16} className="text-[oklch(0.45_0.12_145)]" />
                    ) : (
                      <Circle size={16} className="text-black/30" />
                    )}
                  </span>
                  <span>
                    <span className="block text-[11px] uppercase tracking-wide text-black/40">Step {i + 1}</span>
                    <span className="font-medium">{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-black/8 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">What to click</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{current.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-black/70">{current.click}</p>
          <p className="mt-2 text-sm text-black/50">{current.why}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {current.to ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white"
                onClick={() => {
                  mark(current.id);
                  void navigate({ to: current.to! });
                }}
              >
                Open {current.to.replace("/app", "App") || "page"}
                <ChevronRight size={16} />
              </button>
            ) : null}

            {current.action === "run" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runPlay(null)}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {busy ? "Running…" : "Run save play now"}
              </button>
            ) : null}

            {current.action === "fail" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runPlay("slack_alert")}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {busy ? "Running…" : "Force Slack fail now"}
              </button>
            ) : null}

            <button
              type="button"
                onClick={() => {
                  mark(current.id);
                  const idx = STEPS.findIndex((s) => s.id === current.id);
                  const next = idx >= 0 ? STEPS[idx + 1] : undefined;
                  if (next) setActive(next.id);
                }}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium"
            >
              Mark done → next
            </button>
          </div>

          {lastPlay ? (
            <div className="mt-6 rounded-xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm">
              Last play: <span className="font-mono text-xs">{lastPlay.id}</span> ·{" "}
              <strong>{lastPlay.state}</strong> · {lastPlay.greenCount}/{lastPlay.assertTotal} asserts
              <div className="mt-2">
                <Link to="/app/plays" className="font-medium text-[oklch(0.35_0.06_145)]">
                  View on Plays →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

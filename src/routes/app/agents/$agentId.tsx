import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/agents/$agentId")({
  head: () => ({ meta: [{ title: "Agent — Latch" }] }),
  component: AgentDetailPage,
});

type Agent = {
  id: string;
  name: string;
  purpose: string;
  status: "draft" | "active" | "paused";
  triggers: string[];
};

function AgentDetailPage() {
  const { agentId } = Route.useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [busy, setBusy] = useState(false);
  const [runBusy, setRunBusy] = useState(false);
  const [lastPlay, setLastPlay] = useState<{
    id: string;
    state: string;
    greenCount: number;
    assertTotal: number;
  } | null>(null);

  async function load() {
    const res = await fetch(`/api/workspace/agents/${agentId}`, { credentials: "include" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Not found");
    setAgent(json.agent);
  }

  useEffect(() => {
    void load().catch((e) => toast.error(String(e)));
  }, [agentId]);

  async function save(patch: Partial<Agent>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/workspace/agents/${agentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Update failed");
      setAgent(json.agent);
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runSavePlay(injectFail: string | null = null) {
    setRunBusy(true);
    try {
      const res = await fetch("/api/latch/run", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ injectFail, forceNew: true, agentId }),
      });
      const json = await res.json();
      if (!json.ok || !json.play) throw new Error(json.error || "Run failed");
      setLastPlay({
        id: json.play.id,
        state: json.play.state,
        greenCount: json.play.greenCount,
        assertTotal: json.play.assertTotal,
      });
      toast.success(json.play.state === "LATCHED" ? "Save play latched" : "Play finished");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setRunBusy(false);
    }
  }

  if (!agent) {
    return (
      <AppShell title="Agent" subtitle="Loading…">
        <div className="h-32 animate-pulse rounded-2xl bg-black/5" />
      </AppShell>
    );
  }

  return (
    <AppShell title={agent.name} subtitle={agent.purpose}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={runBusy || agent.status === "paused"}
          onClick={() => void runSavePlay(null)}
          className="rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {runBusy ? "Running…" : "Run save play"}
        </button>
        <button
          type="button"
          disabled={runBusy}
          onClick={() => void runSavePlay("slack_alert")}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          Force Slack fail
        </button>
        <Link
          to="/app/plays"
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium"
        >
          Open Plays
        </Link>
        <Link
          to="/app/tour"
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium"
        >
          Tour
        </Link>
      </div>

      {lastPlay ? (
        <div className="mb-4 rounded-2xl border border-black/8 bg-white px-5 py-4 text-sm">
          Last run <span className="font-mono text-xs">{lastPlay.id}</span> →{" "}
          <strong>{lastPlay.state}</strong> · {lastPlay.greenCount}/{lastPlay.assertTotal} asserts
        </div>
      ) : null}

      <div className="grid max-w-2xl gap-4 rounded-2xl border border-black/8 bg-white p-5">
        <label className="grid gap-1 text-sm">
          Name
          <input
            className="rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-black/30"
            value={agent.name}
            onChange={(e) => setAgent({ ...agent, name: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Purpose
          <textarea
            className="min-h-24 rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-black/30"
            value={agent.purpose}
            onChange={(e) => setAgent({ ...agent, purpose: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Status
          <select
            className="rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-black/30"
            value={agent.status}
            onChange={(e) => setAgent({ ...agent, status: e.target.value as Agent["status"] })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <p className="text-sm text-black/55">Triggers: {agent.triggers.join(", ") || "—"}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save({ name: agent.name, purpose: agent.purpose, status: agent.status })}
          className="w-fit rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </AppShell>
  );
}

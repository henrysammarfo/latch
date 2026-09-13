import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Overview — Latch" }] }),
  component: AppHome,
});

type Agent = {
  id: string;
  name: string;
  purpose: string;
  status: string;
  triggers: string[];
};

type Connector = { name: string; configured: boolean; liveReady: boolean; detail: string };

function AppHome() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [health, setHealth] = useState<{ mode?: string; connectors?: Connector[] } | null>(null);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    void fetch("/api/workspace/agents", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => j.ok && setAgents(j.agents || []));
    void fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setHealth(j));
    void fetch("/api/latch/plays")
      .then((r) => r.json())
      .then((j) => j.ok && setPlayCount((j.plays || []).length));
  }, []);

  const ready = (health?.connectors || []).filter((c) => c.configured).length;
  const total = (health?.connectors || []).length;

  return (
    <AppShell title="Overview" subtitle="Agents, tools, and save plays for this workspace.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Agents" value={String(agents.length)} hint="Create one per churn motion" />
        <Stat title="Connections" value={total ? `${ready}/${total}` : "…"} hint="Slack · Google · Stripe · LLM" />
        <Stat title="Plays stored" value={String(playCount)} hint="This instance" />
        <Stat title="Runtime" value={health?.mode || "…"} hint="Fail-closed by default" />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-black/8 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-black/6 px-5 py-4">
          <h2 className="text-base font-semibold">Agents</h2>
          <Link to="/app/agents" className="text-sm font-medium text-[oklch(0.35_0.06_145)]">
            Manage →
          </Link>
        </div>
        {agents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-black/55">No agents yet. Create one to start watching churn signals.</p>
        ) : (
          <ul className="divide-y divide-black/6">
            {agents.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="font-medium">{a.name}</p>
                  <p className="truncate text-sm text-black/55">{a.purpose}</p>
                </div>
                <span className="shrink-0 rounded-md bg-black/5 px-2 py-1 text-xs capitalize">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <QuickLink to="/app/connections" title="Connect tools" body="Slack, Google Sheet, Calendar, Gmail drafts, Stripe." />
        <QuickLink to="/app/plays" title="Run a save play" body="See every step and the proof IDs — or the rollback." />
        <QuickLink to="/app/settings" title="Profile & email" body="Verify email later. Not required to explore." />
      </section>
    </AppShell>
  );
}

function Stat({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-black/45">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-black/50">{hint}</p>
    </div>
  );
}

function QuickLink({
  to,
  title,
  body,
}: {
  to: "/app/connections" | "/app/plays" | "/app/settings";
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="rounded-2xl border border-black/8 bg-white p-5 transition hover:border-black/20">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-black/55">{body}</p>
    </Link>
  );
}

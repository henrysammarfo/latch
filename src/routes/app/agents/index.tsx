import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/agents/")({
  head: () => ({ meta: [{ title: "Agents — Latch" }] }),
  component: AgentsPage,
});

type Agent = {
  id: string;
  name: string;
  purpose: string;
  status: string;
  triggers: string[];
  updatedAt: string;
};

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/workspace/agents", { credentials: "include" });
    const json = await res.json();
    if (json.ok) setAgents(json.agents || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/workspace/agents", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, purpose }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Create failed");
      toast.success("Agent created");
      setName("");
      setPurpose("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Agents" subtitle="Each agent watches signals and runs a save play for your workspace.">
      <form
        onSubmit={createAgent}
        className="mb-6 grid gap-3 rounded-2xl border border-black/8 bg-white p-5 md:grid-cols-[1fr_1.4fr_auto]"
      >
        <input
          required
          placeholder="Agent name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
        <input
          required
          placeholder="What should it do?"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Create agent"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/8 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/8 bg-black/[0.02] text-xs uppercase tracking-wide text-black/45">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-b border-black/5">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-black/60">{a.purpose}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/app/agents/$agentId"
                    params={{ agentId: a.id }}
                    className="font-medium text-[oklch(0.35_0.06_145)]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {agents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/45">
                  No agents yet. Create one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

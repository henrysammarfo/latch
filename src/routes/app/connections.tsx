import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/connections")({
  head: () => ({ meta: [{ title: "Connections — Latch" }] }),
  component: ConnectionsPage,
});

type Connector = { name: string; configured: boolean; liveReady: boolean; detail: string };

function ConnectionsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    void fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setConnectors(j.connectors || []));
  }, []);

  return (
    <AppShell
      title="Connections"
      subtitle="Tools this workspace can move — and prove. Google OAuth here is for Sheets/Gmail/Calendar, not for login."
    >
      <div className="grid gap-3">
        {connectors.map((c) => (
          <div
            key={c.name}
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-black/8 bg-white p-5"
          >
            <div className="min-w-0">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-sm text-black/55">{c.detail}</p>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                c.configured ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              {c.configured ? (c.liveReady ? "Live" : "Configured") : "Needs setup"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-black/8 bg-white p-5">
        <p className="font-semibold">Google operator link</p>
        <p className="mt-1 text-sm text-black/55">
          Connect Gmail drafts, Sheets ledger, and Calendar holds. This is not account sign-in.
        </p>
        <a
          href="/api/oauth/google/start"
          className="mt-3 inline-flex rounded-xl bg-[oklch(0.28_0.05_145)] px-4 py-2 text-sm font-medium text-white"
        >
          Connect Google
        </a>
        <p className="mt-3 text-sm text-black/50">
          Still need the Spreadsheet ID? Follow{" "}
          <a className="underline" href="/docs">
            the in-app docs
          </a>{" "}
          and the operator steps in <span className="font-mono text-xs">docs/GOOGLE_SHEET_SETUP.md</span>. Reply with
          only the ID from <span className="font-mono text-xs">/d/&lt;THIS&gt;/edit</span>.
        </p>
      </div>
    </AppShell>
  );
}

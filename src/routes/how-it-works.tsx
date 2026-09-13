import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";
import { APPS } from "@/lib/latch-data";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Latch works — workspace, agents, save plays" },
      {
        name: "description",
        content:
          "Sign up with email, create agents in your workspace, and run save plays that alert Slack, write a sheet, book a hold, and leave a Gmail draft — with proof on every step.",
      },
    ],
  }),
  component: HowItWorks,
});

const FLOW = [
  {
    title: "1. Sign up",
    body: "Create a workspace with email and password. No Google login. Verify your email later in Settings if you want.",
  },
  {
    title: "2. Add agents",
    body: "Each agent watches for churn signals you care about — cancel language, failed payments, quiet accounts.",
  },
  {
    title: "3. Connect tools",
    body: "Link Slack, Google (Sheet + Calendar + Gmail drafts), and Stripe to the workspace. Tool login is separate from your Latch login.",
  },
  {
    title: "4. Run a save play",
    body: "Latch posts to Slack, writes the risk row, books a calendar hold, and leaves a Gmail draft. It never sends the customer email for you.",
  },
  {
    title: "5. Keep the proof",
    body: "Every step stores a real ID. If a step fails, Latch stops and rolls back what it can. The board stays honest.",
  },
];

function HowItWorks() {
  return (
    <SitePage>
      <PageHead
        eyebrow="How it works"
        title={
          <>
            Simple path from signup to a <span className="lx-serif">working agent</span>.
          </>
        }
        sub="Latch is multi-tenant: each team gets a workspace, creates agents, and runs save plays with clear proof — not a demo console."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 32 }}>
        <div className="lx-grid-2" style={{ gap: 28, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 12 }}>
            {FLOW.map((step) => (
              <div key={step.title} className="lx-card" style={{ padding: 18 }}>
                <h2 className="lx-h3">{step.title}</h2>
                <p className="lx-small" style={{ marginTop: 8 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="lx-h3">What “good” looks like</h2>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {[
                "Missing proof ID → the play goes red. No fake greens.",
                "Partial write → Latch records a failure row and stops downstream steps.",
                "Customer email stays in Drafts until a human sends it.",
                "You can force a Slack failure to prove rollback works.",
              ].map((g) => (
                <div key={g} className="lx-card" style={{ padding: 16, display: "flex", gap: 10 }}>
                  <CheckCircle2 size={18} strokeWidth={1.7} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p className="lx-small">{g}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lx-section lx-shell" style={{ paddingTop: 8 }}>
        <p className="lx-eyebrow">Tools</p>
        <h2 className="lx-h2" style={{ marginTop: 12 }}>
          Built around tools you already use.
        </h2>
        <div className="lx-card" style={{ marginTop: 24, padding: 0, overflow: "hidden" }}>
          <table className="lx-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {APPS.map((a) => (
                <tr key={a.name}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.role}</td>
                  <td>
                    <span className={a.status === "connected" ? "lx-badge lx-badge-green" : "lx-badge"}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link to="/register" className="lx-pill">
            Create workspace <ArrowUpRight size={16} />
          </Link>
          <Link to="/app" className="lx-pill-ghost">
            Open app
          </Link>
        </div>
      </section>
    </SitePage>
  );
}

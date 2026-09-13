import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Latch docs — signup, agents, connections, proof" },
      {
        name: "description",
        content:
          "Plain docs for Latch: create a workspace with email, add agents, connect tools, run save plays, and read the proof IDs.",
      },
    ],
  }),
  component: Docs,
});

const TOC = [
  { id: "signup", label: "Signup" },
  { id: "agents", label: "Agents" },
  { id: "connections", label: "Connections" },
  { id: "plays", label: "Save plays" },
  { id: "proof", label: "Proof rules" },
];

function Docs() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Docs"
        title={
          <>
            Short docs. <span className="lx-serif">Plain words.</span>
          </>
        }
        sub="Latch is a multi-tenant app: your workspace, your agents, your tool connections. Login is email + password only."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40 }}>
          <aside>
            <p className="lx-eyebrow">On this page</p>
            <div style={{ marginTop: 12 }}>
              {TOC.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="lx-footer-link">
                  {t.label}
                </a>
              ))}
            </div>
          </aside>

          <div style={{ display: "grid", gap: 34 }}>
            <div id="signup">
              <h2 className="lx-h3">Signup</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Go to <Link to="/register">/register</Link>, enter name, workspace name, email, and
                password (8+ characters). You land in the app immediately. Email verification is
                optional and lives under Settings — generate a token and paste it when ready. There
                is no Google login for Latch accounts.
              </p>
            </div>

            <div id="agents">
              <h2 className="lx-h3">Agents</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                In <Link to="/app/agents">Agents</Link>, create one agent per churn motion (for
                example “Cancel language watch”). Set status to draft, active, or paused. Agents
                belong to your workspace.
              </p>
            </div>

            <div id="connections">
              <h2 className="lx-h3">Connections</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Connections are workspace tools: Slack, Google Sheet / Calendar / Gmail drafts, and
                Stripe. Google OAuth here is for those APIs — not for signing into Latch. Health is
                visible on <Link to="/app/connections">Connections</Link> and{" "}
                <code className="lx-mono">/api/health</code>.
              </p>
            </div>

            <div id="plays">
              <h2 className="lx-h3">Save plays</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Open <Link to="/app/plays">Plays</Link> and run a save play. Latch alerts Slack,
                writes the risk ledger, books a calendar hold, and leaves a Gmail draft. Use “Force
                Slack fail” to see fail-closed rollback.
              </p>
            </div>

            <div id="proof">
              <h2 className="lx-h3">Proof rules</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                A play is green only when required steps return real IDs (or explicit dry-run marks).
                Missing IDs turn the play red. Customer email is draft-only. Evals on{" "}
                <Link to="/app/evals">/app/evals</Link> re-run the golden suite including forced
                failure paths.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/register" className="lx-pill">
                Create workspace <ArrowUpRight size={16} />
              </Link>
              <Link to="/reliability" className="lx-pill-ghost">
                Reliability brief
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

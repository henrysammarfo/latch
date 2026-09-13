import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";
import { APPS } from "@/lib/latch-data";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Latch works — signal, save play, eval board" },
      {
        name: "description",
        content:
          "Latch turns a churn signal into a Slack alert, a risk ledger row and a calendar hold, then asserts every side effect before reporting green.",
      },
      { property: "og:title", content: "How Latch works — signal, save play, eval board" },
      {
        property: "og:description",
        content: "The full architecture: triggers, orchestrator, side-effect asserts and compensating writes.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const GRAPH = `Trigger A: Gmail        (cancel language · champion gone)
Trigger B: Stripe test  (past_due · canceled · unpaid)
        |
        v
   RiskParser        LLM classify · deterministic asserts
        |
        v
   SavePlay orchestrator
     1. Slack #cs alert      -> store message_ts
     2. Risk ledger row      -> status OPEN_SAVE
     3. Calendar save-hold   -> "Save call - {account}"
     4. Gmail draft only     -> never sends
        |
        v
   EvalRunner
     assert slack.message_ts
     assert sheets.updatedRange | hubspot.recordId
     assert calendar.eventId
     assert no silent customer send
        |
        v
   Board: GREEN n/n  |  RED UNLATCHED + compensating notes`;

const GUARANTEES = [
  "Any missing ID turns the whole play red — no partial credit.",
  "A partial write leaves a FAILED_* compensating row in the ledger.",
  "Customer-facing email stays in drafts until a human sends it.",
  "Every step records latency, retries and the provider ID it received.",
  "Failure injection is a first-class mode, not a manual experiment.",
];

function HowItWorks() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Architecture"
        title={<>From one risk signal to a <span className="lx-serif">provable</span> save play.</>}
        sub="Latch is an orchestrator with an evaluator bolted to its side. Every step must hand back an identifier from the real app, or the run closes red."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 40 }}>
        <div className="lx-grid-2" style={{ gap: 40, alignItems: "start" }}>
          <div>
            <h2 className="lx-h3">The typed graph</h2>
            <pre className="lx-code" style={{ marginTop: 16 }}>{GRAPH}</pre>
          </div>
          <div>
            <h2 className="lx-h3">What the design guarantees</h2>
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {GUARANTEES.map((g) => (
                <div className="lx-card" key={g} style={{ padding: 18, display: "flex", gap: 12 }}>
                  <CheckCircle2 size={18} strokeWidth={1.7} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p className="lx-small" style={{ color: "var(--lx-text)" }}>{g}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lx-section lx-shell" style={{ paddingTop: 0 }}>
        <p className="lx-eyebrow">Connected surface</p>
        <h2 className="lx-h2" style={{ marginTop: 14 }}>Five apps in the spine, two on deck.</h2>
        <div className="lx-card" style={{ marginTop: 28, padding: 0, overflow: "hidden" }}>
          <table className="lx-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Role in the play</th>
                <th>Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {APPS.map((a) => (
                <tr key={a.name}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.role}</td>
                  <td className="lx-mono">{a.scope}</td>
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
          <Link to="/reliability" className="lx-pill">
            See the reliability brief <ArrowUpRight size={16} />
          </Link>
          <Link to="/dashboard" className="lx-pill-ghost">Open the console</Link>
        </div>
      </section>
    </SitePage>
  );
}

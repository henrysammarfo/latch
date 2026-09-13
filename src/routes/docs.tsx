import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Latch docs — triggers, asserts and the eval contract" },
      {
        name: "description",
        content:
          "Set up the Gmail and Stripe triggers, connect Slack, Sheets and Calendar, and learn the assert contract every Latch play must satisfy.",
      },
      { property: "og:title", content: "Latch docs" },
      {
        property: "og:description",
        content: "Quickstart, trigger setup, assert contract and failure-injection reference.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Docs,
});

const SETUP = `# 1. connect the spine
latch connect gmail slack sheets calendar stripe

# 2. point Stripe test mode at the public endpoint
https://<your-app>/api/public/stripe-webhook

# 3. run the golden suite before trusting a board
latch eval --suite golden --fail-on-mismatch`;

const ASSERT = `type PlayResult = {
  state: "LATCHED" | "UNLATCHED";
  asserts: {
    "slack.message_ts": string | null;
    "sheets.updatedRange": string | null;
    "calendar.eventId": string | null;
    "no_silent_send": true;
  };
  compensating: string[]; // e.g. ["FAILED_NOTIFY"]
};

// LATCHED requires every assert to be non-null.
// Anything else is UNLATCHED — there is no partial state.`;

const TOC = [
  { id: "quickstart", label: "Quickstart" },
  { id: "triggers", label: "Triggers" },
  { id: "asserts", label: "Assert contract" },
  { id: "injection", label: "Failure injection" },
  { id: "privacy", label: "Data and deletion" },
];

function Docs() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Docs"
        title={<>Everything a run must <span className="lx-serif">prove</span> before it greens.</>}
        sub="Latch has a small surface on purpose: two triggers, four side effects, one assert contract."
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
            <div id="quickstart">
              <h2 className="lx-h3">Quickstart</h2>
              <pre className="lx-code" style={{ marginTop: 14 }}>{SETUP}</pre>
            </div>

            <div id="triggers">
              <h2 className="lx-h3">Triggers</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Trigger A watches a Gmail label for cancellation language, downgrade
                requests and champion-departure signals. Trigger B accepts signed
                Stripe test events — <span className="lx-mono">invoice.payment_failed</span>,{" "}
                <span className="lx-mono">customer.subscription.deleted</span> and{" "}
                <span className="lx-mono">past_due</span> transitions. Both funnel into
                the same parser so a play looks identical whichever path fired it.
              </p>
            </div>

            <div id="asserts">
              <h2 className="lx-h3">Assert contract</h2>
              <pre className="lx-code" style={{ marginTop: 14 }}>{ASSERT}</pre>
            </div>

            <div id="injection">
              <h2 className="lx-h3">Failure injection</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Injection fixtures live beside the golden suite. Each one names the app,
                the failure mode and the board it must produce. A fixture that expects RED
                and observes GREEN fails the suite — that is the check that keeps the
                evaluator honest.
              </p>
            </div>

            <div id="privacy">
              <h2 className="lx-h3">Data and deletion</h2>
              <p className="lx-small" style={{ marginTop: 10 }}>
                Latch stores account identifiers, risk reasons and the provider IDs it
                received. Deleting an account removes the ledger rows, cached signals and
                stored IDs; only anonymised eval counters survive, and the deletion test
                fixture asserts it.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/dashboard" className="lx-pill">
                Open the console <ArrowUpRight size={16} />
              </Link>
              <Link to="/reliability" className="lx-pill-ghost">Reliability brief</Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

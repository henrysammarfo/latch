import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Latch plans — churn-save latching for lean CS teams" },
      {
        name: "description",
        content:
          "Three plans for teams that need proof, not promises: Solo CSM, Team and Audit. Every plan includes side-effect asserts and the eval board.",
      },
      { property: "og:title", content: "Latch plans" },
      {
        property: "og:description",
        content: "Pricing for fail-closed churn-save latching, from a single CSM to an audited CS org.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Plans,
});

const PLANS = [
  {
    name: "Solo CSM",
    price: "$49",
    per: "per month",
    blurb: "One owner, one risk ledger, all four asserts.",
    features: [
      "Gmail + Stripe triggers",
      "Slack, Sheets and Calendar side effects",
      "Eval board with provider IDs",
      "50 latched plays / month",
    ],
    cta: "Start latching",
    featured: false,
  },
  {
    name: "Team",
    price: "$249",
    per: "per month",
    blurb: "Round-robin owners, shared board, force-fail on demand.",
    features: [
      "Everything in Solo CSM",
      "Unlimited plays and owners",
      "Failure injection console",
      "HubSpot risk records",
      "Slack alerting per segment",
    ],
    cta: "Start a trial",
    featured: true,
  },
  {
    name: "Audit",
    price: "Talk to us",
    per: "annual",
    blurb: "For teams who must show the trail to a customer or a board.",
    features: [
      "Everything in Team",
      "Exportable audit trail per account",
      "Custom golden job suite",
      "Deletion test evidence pack",
      "Private deployment region",
    ],
    cta: "Book a call",
    featured: false,
  },
];

function Plans() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Plans"
        title={<>Pay for the <span className="lx-serif">proof</span>, not the prompt.</>}
        sub="Every plan runs the same fail-closed engine. What changes is how many accounts you latch and how much of the trail you can export."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 40 }}>
        <div className="lx-grid-3">
          {PLANS.map((p) => (
            <div
              className="lx-card"
              key={p.name}
              style={
                p.featured
                  ? { background: "var(--lx-text)", color: "var(--lx-bg)", borderColor: "transparent" }
                  : undefined
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="lx-h3">{p.name}</h2>
                {p.featured ? <span className="lx-badge">Most latched</span> : null}
              </div>
              <p style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.06em", marginTop: 18 }}>
                {p.price}
              </p>
              <p className="lx-small" style={{ color: p.featured ? "var(--lx-faint)" : undefined }}>
                {p.per}
              </p>
              <p className="lx-small" style={{ marginTop: 14, color: p.featured ? "var(--lx-surface-2)" : undefined }}>
                {p.blurb}
              </p>
              <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, letterSpacing: "-0.02em" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/contact"
                className={p.featured ? "lx-pill-ghost" : "lx-pill"}
                style={{ marginTop: 26 }}
              >
                {p.cta} <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="lx-card lx-card-soft" style={{ marginTop: 32 }}>
          <h2 className="lx-h3">What no plan will ever do</h2>
          <p className="lx-small" style={{ marginTop: 10, maxWidth: 620 }}>
            Send a customer-facing email on your behalf without a human pressing
            send, or report a green board when an app returned nothing. Those two
            limits are the product.
          </p>
        </div>
      </section>
    </SitePage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Latch pricing — workspaces for customer teams" },
      {
        name: "description",
        content:
          "Simple plans for teams that want churn-save agents with proof. Start free, grow when your workspace needs more seats and plays.",
      },
    ],
  }),
  component: Plans,
});

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    per: "to explore",
    blurb: "One workspace, email signup, dry-run plays with proof.",
    features: [
      "Email + password signup (verify later)",
      "Create agents in your workspace",
      "Dry-run save plays + eval board",
      "Slack / Google / Stripe connections when ready",
    ],
    cta: "Start free",
    to: "/register" as const,
    featured: false,
  },
  {
    name: "Team",
    price: "$249",
    per: "per month",
    blurb: "For CS teams running live save plays across accounts.",
    features: [
      "Everything in Starter",
      "Live mode with real tool IDs",
      "More seats and agent capacity",
      "Shared play history for the workspace",
    ],
    cta: "Create workspace",
    to: "/register" as const,
    featured: true,
  },
  {
    name: "Audit",
    price: "Talk to us",
    per: "annual",
    blurb: "For teams that need exportable trails and custom evals.",
    features: [
      "Everything in Team",
      "Exportable audit trail",
      "Custom golden jobs",
      "Deletion evidence pack",
    ],
    cta: "Contact",
    to: "/contact" as const,
    featured: false,
  },
];

function Plans() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Pricing"
        title={
          <>
            Pay for the <span className="lx-serif">workspace</span>, not the buzzwords.
          </>
        }
        sub="Every plan uses the same fail-closed engine. What changes is how many people and plays you run."
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
                {p.featured ? <span className="lx-badge">Popular</span> : null}
              </div>
              <p style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.06em", marginTop: 18 }}>{p.price}</p>
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
                to={p.to}
                className={p.featured ? "lx-pill-ghost" : "lx-pill"}
                style={{ marginTop: 26 }}
              >
                {p.cta} <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="lx-card lx-card-soft" style={{ marginTop: 32 }}>
          <h2 className="lx-h3">What no plan will do</h2>
          <p className="lx-small" style={{ marginTop: 10, maxWidth: 620 }}>
            Send a customer email without a human pressing send, or show green when a tool returned
            nothing. Those limits are the product.
          </p>
        </div>
      </section>
    </SitePage>
  );
}

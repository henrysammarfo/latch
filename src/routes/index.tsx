import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarCheck2, CircleSlash2, FileSpreadsheet, Fingerprint, MessageSquareDot, ShieldCheck, Siren, Timer } from "lucide-react";
import heroImage from "@/assets/latch-hero.jpg";
import { CurvedLines } from "@/components/latch/CurvedLines";
import { Marquee } from "@/components/latch/Marquee";
import { SitePage } from "@/components/latch/SiteChrome";
import { GOLDEN, PLAYS, TICKER, TRUSTED, passRate } from "@/lib/latch-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Latch — Fail-closed churn-save for B2B SaaS" },
      {
        name: "description",
        content:
          "Latch runs a churn-save play across Slack, your CRM and calendar, then proves every app moved with real IDs. No proof, no green.",
      },
      { property: "og:title", content: "Latch — Fail-closed churn-save for B2B SaaS" },
      {
        property: "og:description",
        content:
          "One risk signal in, three verified side effects out. Latch only greens when Slack, the risk ledger and the calendar all returned an ID.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PIPELINE = [
  { icon: Siren, title: "Signal", body: "Cancel language in Gmail, or a Stripe past_due / cancel webhook.", tag: "trigger" },
  { icon: MessageSquareDot, title: "Alert", body: "Slack #cs gets the account, the reason and the thread link.", tag: "slack.message_ts" },
  { icon: FileSpreadsheet, title: "Ledger", body: "Risk row opens with status OPEN_SAVE and the owning CSM.", tag: "sheets.updatedRange" },
  { icon: CalendarCheck2, title: "Hold", body: "Save call blocked on the owner's calendar inside the risk window.", tag: "calendar.eventId" },
];

function Landing() {
  const latched = PLAYS.filter((p) => p.state === "LATCHED").length;

  return (
    <SitePage>
      <section
        className="lx-hero"
        style={{ ["--lx-hero-image" as string]: `url(${heroImage})` }}
      >
        <CurvedLines />
        <Marquee items={TICKER} />
        <h1 className="lx-h1 lx-hero-title">
          Churn saves that <span className="lx-serif">prove</span>
          <span className="lx-reg">®</span> themselves.
        </h1>
        <p className="lx-body lx-hero-sub">
          When an account looks ready to leave, Latch runs the save play across
          Slack, your risk ledger and the calendar — and only turns green when
          every app hands back a real ID.
        </p>
        <div className="lx-cta-row">
          <Link to="/dashboard" className="lx-btn-primary">
            See a live latch
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/contact" className="lx-btn-book">
            <span className="lx-avatar" style={{ background: "var(--lx-text)", display: "grid", placeItems: "center", color: "var(--lx-bg)", fontWeight: 600, fontSize: 15 }}>
              H
            </span>
            <span style={{ textAlign: "left" }}>
              <span className="lx-btn-book-title" style={{ display: "block" }}>
                Chat for 15 minutes
              </span>
              <span className="lx-btn-book-sub">
                <span className="lx-dot" /> Pick a slot
              </span>
            </span>
          </Link>
        </div>
        <div className="lx-hero-blur" />
      </section>

      <section className="lx-shell" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <p className="lx-small" style={{ maxWidth: 163, fontWeight: 500 }}>
            Moves the tools your CS team already lives in
          </p>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Marquee
              items={TRUSTED}
              wide
              render={(item) => <span className="lx-logo-word">{item}</span>}
            />
          </div>
        </div>
      </section>

      <section className="lx-section lx-shell">
        <p className="lx-eyebrow">The save play</p>
        <h2 className="lx-h2" style={{ maxWidth: 640, marginTop: 16 }}>
          One signal in. Three <span className="lx-serif">verified</span> side
          effects out.
        </h2>
        <div className="lx-grid-4" style={{ marginTop: 40 }}>
          {PIPELINE.map((step, i) => (
            <div className="lx-card" key={step.title}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <step.icon size={20} strokeWidth={1.6} />
                <span className="lx-kv">0{i + 1}</span>
              </div>
              <h3 className="lx-h3" style={{ marginTop: 20 }}>{step.title}</h3>
              <p className="lx-small" style={{ marginTop: 8 }}>{step.body}</p>
              <p className="lx-mono" style={{ marginTop: 16, color: "var(--lx-faint)" }}>
                {step.tag}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lx-section lx-shell">
        <div className="lx-grid-2" style={{ alignItems: "center", gap: 48 }}>
          <div>
            <p className="lx-eyebrow">Fail-closed by default</p>
            <h2 className="lx-h2" style={{ marginTop: 16 }}>
              A missing ID is a <span className="lx-serif">red</span> board, not a
              rounded-up win.
            </h2>
            <p className="lx-body" style={{ marginTop: 18 }}>
              Most agents report what they intended to do. Latch reports what the
              apps actually returned. Kill the Slack token mid-run and the board
              flips to UNLATCHED, writes a FAILED_NOTIFY row and stops the rest of
              the play.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              <Link to="/reliability" className="lx-pill">
                Reliability brief <ArrowUpRight size={16} />
              </Link>
              <Link to="/how-it-works" className="lx-pill-ghost">Read the architecture</Link>
            </div>
          </div>
          <div className="lx-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="lx-badge lx-badge-red">
                <CircleSlash2 size={13} /> UNLATCHED
              </span>
              <span className="lx-kv">play_7bd004 · Halcyon Retail</span>
            </div>
            <pre className="lx-code" style={{ marginTop: 18 }}>{`assert stripe.event.id      evt_1PxT9k   PASS
assert slack.message_ts     —            FAIL  invalid_auth (3 retries)
assert sheets.updatedRange  Risk!A41:H41 PASS  FAILED_NOTIFY
assert calendar.eventId     —            SKIP  halted: fail-closed
assert no_silent_send       —            SKIP

board: 2/5 → RED`}</pre>
          </div>
        </div>
      </section>

      <section className="lx-section lx-shell">
        <div className="lx-grid-3">
          {[
            { icon: ShieldCheck, k: `${passRate()}%`, v: `Golden jobs matching expected outcome (${GOLDEN.length} fixtures)` },
            { icon: Fingerprint, k: `${latched}/${PLAYS.length}`, v: "Plays latched today, each with side-effect IDs on record" },
            { icon: Timer, k: "1.6s", v: "Median signal-to-latch across Slack, ledger and calendar" },
          ].map((s) => (
            <div className="lx-card lx-card-soft" key={s.k}>
              <s.icon size={20} strokeWidth={1.6} />
              <p className="lx-stat-num" style={{ marginTop: 16 }}>{s.k}</p>
              <p className="lx-small" style={{ marginTop: 6 }}>{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lx-shell" style={{ paddingBottom: 96 }}>
        <div
          className="lx-card"
          style={{ padding: 56, textAlign: "center", background: "var(--lx-surface)", borderColor: "transparent" }}
        >
          <h2 className="lx-h2" style={{ maxWidth: 560, margin: "0 auto" }}>
            Latch the save. Keep the <span className="lx-serif">proof</span>.
          </h2>
          <p className="lx-body" style={{ maxWidth: 480, margin: "16px auto 0" }}>
            Human stays on every customer-facing send. Latch handles the internal
            work and the audit trail.
          </p>
          <div className="lx-cta-row" style={{ marginTop: 28 }}>
            <Link to="/dashboard" className="lx-btn-primary">
              Open the console <ArrowUpRight size={18} />
            </Link>
            <Link to="/plans" className="lx-pill-ghost" style={{ height: 56, padding: "0 26px" }}>
              Compare plans
            </Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

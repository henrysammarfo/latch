import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bot, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import heroImage from "@/assets/latch-hero.jpg";
import { CurvedLines } from "@/components/latch/CurvedLines";
import { Marquee } from "@/components/latch/Marquee";
import { SitePage } from "@/components/latch/SiteChrome";
import { TICKER, TRUSTED } from "@/lib/latch-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Latch — Churn-save agents for customer teams" },
      {
        name: "description",
        content:
          "Create a workspace, add agents, and let Latch run save plays across Slack, Sheets, Calendar, and Gmail drafts — with proof on every step.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: Sparkles,
    title: "Create a workspace",
    body: "Sign up with email. Invite comes later. You can verify your email in Settings when you are ready.",
  },
  {
    icon: Bot,
    title: "Add agents",
    body: "Each agent watches for churn signals you care about — cancel language, failed payments, quiet accounts.",
  },
  {
    icon: Workflow,
    title: "Run a save play",
    body: "Latch alerts Slack, writes the risk ledger, books a hold, and leaves a Gmail draft. No silent customer sends.",
  },
  {
    icon: ShieldCheck,
    title: "Keep the proof",
    body: "Every step stores a real ID. If something fails, Latch stops and rolls back what it can. The board stays honest.",
  },
];

function Landing() {
  return (
    <SitePage>
      <section className="lx-hero" style={{ ["--lx-hero-image" as string]: `url(${heroImage})` }}>
        <CurvedLines />
        <Marquee items={TICKER} />
        <h1 className="lx-h1 lx-hero-title">
          Churn-save agents your whole <span className="lx-serif">team</span> can run.
        </h1>
        <p className="lx-body lx-hero-sub">
          Latch is a workspace for customer teams. Create agents that catch risk early, take the
          next steps in your tools, and show clear proof — without making you fight a demo login.
        </p>
        <div className="lx-cta-row">
          <Link to="/register" className="lx-btn-primary">
            Start free
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/how-it-works" className="lx-btn-book">
            <span style={{ textAlign: "left" }}>
              <span className="lx-btn-book-title" style={{ display: "block" }}>
                See how it works
              </span>
              <span className="lx-btn-book-sub">Plain steps. No jargon wall.</span>
            </span>
          </Link>
        </div>
        <div className="lx-hero-blur" />
      </section>

      <section className="lx-shell" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <p className="lx-small" style={{ maxWidth: 180, fontWeight: 500 }}>
            Works with the tools you already use
          </p>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Marquee items={TRUSTED} wide render={(item) => <span className="lx-logo-word">{item}</span>} />
          </div>
        </div>
      </section>

      <section className="lx-section lx-shell">
        <p className="lx-eyebrow">Simple path</p>
        <h2 className="lx-h2" style={{ maxWidth: 640, marginTop: 16 }}>
          From signup to a live agent in four clear moves.
        </h2>
        <div className="lx-grid-4" style={{ marginTop: 40 }}>
          {STEPS.map((step, i) => (
            <div className="lx-card" key={step.title}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <step.icon size={20} strokeWidth={1.6} />
                <span className="lx-kv">0{i + 1}</span>
              </div>
              <h3 className="lx-h3" style={{ marginTop: 20 }}>
                {step.title}
              </h3>
              <p className="lx-small" style={{ marginTop: 8 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lx-section lx-shell">
        <div className="lx-grid-2" style={{ alignItems: "center", gap: 48 }}>
          <div>
            <p className="lx-eyebrow">Built for teams</p>
            <h2 className="lx-h2" style={{ marginTop: 16 }}>
              Your workspace. Your agents. Your proof.
            </h2>
            <p className="lx-body" style={{ marginTop: 16 }}>
              Judges and operators get a real product path: email signup, a clean dashboard, and
              agents you can create without waiting on OAuth for your login. Tool connections
              (Slack, Google, Stripe) stay on the workspace — separate from how you sign in.
            </p>
            <div className="lx-cta-row" style={{ marginTop: 28 }}>
              <Link to="/register" className="lx-btn-primary">
                Create workspace
                <ArrowUpRight size={18} />
              </Link>
              <Link to="/login" className="lx-btn-secondary">
                Sign in
              </Link>
            </div>
          </div>
          <div className="lx-card" style={{ padding: 28 }}>
            <p className="lx-small" style={{ fontWeight: 600 }}>
              What you get in the app
            </p>
            <ul className="lx-body" style={{ marginTop: 14, paddingLeft: 18, display: "grid", gap: 10 }}>
              <li>Overview of agents and connection health</li>
              <li>Agent list with create / open / pause</li>
              <li>Play runner with step-by-step IDs</li>
              <li>Evals board for golden checks</li>
              <li>Settings with “verify email later”</li>
            </ul>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

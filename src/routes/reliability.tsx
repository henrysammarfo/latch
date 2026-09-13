import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Bug, RefreshCcw, Trash2 } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";
import { GOLDEN, passRate } from "@/lib/latch-data";

export const Route = createFileRoute("/reliability")({
  head: () => ({
    meta: [
      { title: "Reliability — golden jobs, force-fail, deletion" },
      {
        name: "description",
        content:
          "How Latch stays honest: golden fixtures with expected outcomes, forced failures that must go red, retries, and a deletion check.",
      },
    ],
  }),
  component: Reliability,
});

const SECTIONS = [
  {
    icon: BadgeCheck,
    title: "Golden jobs",
    body: "Each fixture says what should happen — green or red. A run passes only when the board matches that expectation.",
  },
  {
    icon: Bug,
    title: "Force-fail",
    body: "We break Slack (and other paths) on purpose. If a broken run still shows green, the suite fails.",
  },
  {
    icon: RefreshCcw,
    title: "Retries + rollback",
    body: "Steps retry with backoff. When retries run out, Latch stops and records compensating notes instead of silent partial state.",
  },
  {
    icon: Trash2,
    title: "Deletion check",
    body: "A fixture asks to delete account data, then checks that risk rows and stored IDs are gone. We do not claim “unhackable.”",
  },
];

function Reliability() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Reliability"
        title={
          <>
            Green means the tools <span className="lx-serif">moved</span>. Nothing else counts.
          </>
        }
        sub="Latch is checked like a payments flow: expected outcomes, forced failures, and no success without proof IDs."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 40 }}>
        <div className="lx-grid-4">
          {[
            { k: `${passRate()}%`, v: "Suite match rate" },
            { k: `${GOLDEN.length}`, v: "Golden fixtures" },
            { k: "4", v: "Proof IDs per play" },
            { k: "0", v: "Silent customer sends" },
          ].map((s) => (
            <div className="lx-card lx-card-soft" key={s.v}>
              <p className="lx-stat-num">{s.k}</p>
              <p className="lx-small" style={{ marginTop: 6 }}>
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <div className="lx-card" style={{ marginTop: 32, padding: 0, overflow: "hidden" }}>
          <table className="lx-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Fixture</th>
                <th>Asserts</th>
                <th>Expected</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {GOLDEN.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td className="lx-mono">{g.fixture}</td>
                  <td className="lx-mono">
                    {g.passed}/{g.asserts}
                  </td>
                  <td>
                    <span className={g.expected === "GREEN" ? "lx-badge lx-badge-green" : "lx-badge lx-badge-red"}>
                      {g.expected}
                    </span>
                  </td>
                  <td>
                    <span className={g.result === g.expected ? "lx-badge lx-badge-green" : "lx-badge lx-badge-red"}>
                      {g.result === g.expected ? "match" : "mismatch"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lx-grid-2" style={{ marginTop: 32 }}>
          {SECTIONS.map((s) => (
            <div className="lx-card" key={s.title}>
              <s.icon size={20} strokeWidth={1.6} />
              <h2 className="lx-h3" style={{ marginTop: 18 }}>
                {s.title}
              </h2>
              <p className="lx-small" style={{ marginTop: 8 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link to="/app/evals" className="lx-pill">
            Open evals <ArrowUpRight size={16} />
          </Link>
          <Link to="/docs" className="lx-pill-ghost">
            Read docs
          </Link>
        </div>
      </section>
    </SitePage>
  );
}

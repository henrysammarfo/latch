import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Bug, RefreshCcw, Trash2 } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";
import { GOLDEN, passRate } from "@/lib/latch-data";

export const Route = createFileRoute("/reliability")({
  head: () => ({
    meta: [
      { title: "Reliability brief — golden jobs, force-fail, deletion test" },
      {
        name: "description",
        content:
          "How Latch proves itself: golden job fixtures with expected outcomes, injected failures that must go red, a retry policy and a deletion test.",
      },
      { property: "og:title", content: "Latch reliability brief" },
      {
        property: "og:description",
        content: "Golden job table, force-fail runs, retry policy and data deletion evidence.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reliability,
});

const SECTIONS = [
  {
    icon: BadgeCheck,
    title: "Golden jobs",
    body: "Every fixture declares its expected outcome — GREEN or RED. A run passes only when the observed board matches the declaration, so a suite of all-greens cannot hide a broken assert.",
  },
  {
    icon: Bug,
    title: "Force-fail",
    body: "Injection fixtures revoke the Slack token, rate-limit Sheets and collide the calendar window. The suite fails if any injected break still reports a green board.",
  },
  {
    icon: RefreshCcw,
    title: "Retries and compensation",
    body: "Idempotent steps retry three times with exponential backoff and a per-play idempotency key. A step that exhausts retries halts the play and writes a FAILED_* row instead of leaving silent partial state.",
  },
  {
    icon: Trash2,
    title: "Deletion test",
    body: "A fixture requests account deletion, then asserts the risk rows, cached signals and stored provider IDs are gone. Retained: only the anonymised eval counters.",
  },
];

function Reliability() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Reliability brief"
        title={<>Green means the apps <span className="lx-serif">moved</span>. Nothing else counts.</>}
        sub="Latch is evaluated the way a payments system is evaluated: declared expectations, injected failures, and no path where a run can claim success without provider IDs."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 40 }}>
        <div className="lx-grid-4">
          {[
            { k: `${passRate()}%`, v: "Suite match rate" },
            { k: `${GOLDEN.length}`, v: "Golden fixtures" },
            { k: "4", v: "Asserted side-effect IDs per play" },
            { k: "0", v: "Silent customer sends, by construction" },
          ].map((s) => (
            <div className="lx-card lx-card-soft" key={s.v}>
              <p className="lx-stat-num">{s.k}</p>
              <p className="lx-small" style={{ marginTop: 6 }}>{s.v}</p>
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
                  <td className="lx-mono">{g.passed}/{g.asserts}</td>
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
              <h2 className="lx-h3" style={{ marginTop: 18 }}>{s.title}</h2>
              <p className="lx-small" style={{ marginTop: 8 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link to="/dashboard/evals" className="lx-pill">
            Run the eval board <ArrowUpRight size={16} />
          </Link>
          <Link to="/docs" className="lx-pill-ghost">Read the docs</Link>
        </div>
      </section>
    </SitePage>
  );
}

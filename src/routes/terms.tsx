import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms — LATCH" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Terms"
        title={
          <>
            Terms of <span className="lx-serif">use</span>.
          </>
        }
        sub="Operator terms for the LATCH demo and production console. Not legal advice."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24, maxWidth: 720 }}>
        <p className="lx-body">
          By using LATCH you agree that save plays may post to Slack, write Sheet rows, create
          Calendar holds, and create Gmail drafts under credentials you supply. Gmail is
          draft-only unless you manually send.
        </p>
        <h2 className="lx-h3" style={{ marginTop: 28 }}>
          Fail-closed behavior
        </h2>
        <p className="lx-body" style={{ marginTop: 12 }}>
          LATCH is designed to fail closed: a failed step compensates prior side effects where
          possible and marks the play UNLATCHED. Residual risk remains (token theft, mis-scoped
          OAuth, provider outages). We do not claim the system is unhackable.
        </p>
        <h2 className="lx-h3" style={{ marginTop: 28 }}>
          Your responsibilities
        </h2>
        <ul className="lx-body" style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Keep API keys and OAuth tokens out of chat logs and public repos</li>
          <li>Use test / sandbox provider modes until you intentionally go live</li>
          <li>Review drafts before sending customer email</li>
        </ul>
        <p className="lx-body" style={{ marginTop: 24 }}>
          Privacy: <Link to="/privacy">/privacy</Link> · Contact:{" "}
          <Link to="/contact">/contact</Link>
        </p>
      </section>
    </SitePage>
  );
}

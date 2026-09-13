import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy — LATCH" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Privacy"
        title={
          <>
            How LATCH handles <span className="lx-serif">your data</span>.
          </>
        }
        sub="Plain-language notice for OAuth consent and operators. Not legal advice."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24, maxWidth: 720 }}>
        <p className="lx-body">
          LATCH is a churn-save orchestration console. When you connect Google, we request
          only the scopes needed to draft Gmail messages (never auto-send), append rows to a
          Sheet you choose, and create Calendar holds you can delete.
        </p>
        <h2 className="lx-h3" style={{ marginTop: 28 }}>
          What we access
        </h2>
        <ul className="lx-body" style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Gmail: create drafts / read metadata required for draft context</li>
          <li>Google Sheets: read/write the LATCH risk ledger spreadsheet you authorize</li>
          <li>Google Calendar: create and delete hold events for save plays</li>
        </ul>
        <h2 className="lx-h3" style={{ marginTop: 28 }}>
          What we store
        </h2>
        <p className="lx-body" style={{ marginTop: 12 }}>
          OAuth client credentials and refresh tokens are stored as encrypted environment
          variables on the hosting provider (Vercel). Play traces may include account names,
          ARR-at-risk figures, and provider object IDs (Slack ts, Sheet range, Calendar event
          id, Gmail draft id). We do not sell this data.
        </p>
        <h2 className="lx-h3" style={{ marginTop: 28 }}>
          Deletion / revoke
        </h2>
        <p className="lx-body" style={{ marginTop: 12 }}>
          Revoke LATCH anytime at{" "}
          <a className="lx-navlink" href="https://myaccount.google.com/permissions">
            Google Account → Third-party access
          </a>
          . Ask the operator to delete env tokens and ledger rows for a full wipe.
        </p>
        <p className="lx-body" style={{ marginTop: 12 }}>
          Contact:{" "}
          <a className="lx-navlink" href="mailto:jasonneil4040@gmail.com">
            jasonneil4040@gmail.com
          </a>{" "}
          · <Link to="/contact">/contact</Link>
        </p>
      </section>
    </SitePage>
  );
}

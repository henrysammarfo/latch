import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Latch" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Contact"
        title={
          <>
            Talk to the <span className="lx-serif">builder</span>.
          </>
        }
        sub="Judges and design partners: reach Henry for a live walkthrough of a workspace, agents, and save plays."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24 }}>
        <p className="lx-body">
          GitHub:{" "}
          <a href="https://github.com/henrysammarfo" className="lx-navlink">
            @henrysammarfo
          </a>
        </p>
        <p className="lx-body" style={{ marginTop: 12 }}>
          App: <Link to="/app">/app</Link> · Signup: <Link to="/register">/register</Link>
        </p>
      </section>
    </SitePage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — LATCH" }],
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
        sub="Design partners and hackathon judges: reach Henry for a live poke of the dry-run board or credentialed demo workspace."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24 }}>
        <p className="lx-body">
          GitHub:{" "}
          <a href="https://github.com/henrysammarfo" className="lx-navlink">
            @henrysammarfo
          </a>
        </p>
        <p className="lx-body" style={{ marginTop: 12 }}>
          Console: <Link to="/dashboard">/dashboard</Link>
        </p>
      </section>
    </SitePage>
  );
}

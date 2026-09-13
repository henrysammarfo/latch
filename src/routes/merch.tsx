import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage, PageHead } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [{ title: "Merch — LATCH" }],
  }),
  component: MerchPage,
});

function MerchPage() {
  return (
    <SitePage>
      <PageHead
        eyebrow="Merch"
        title={
          <>
            Stickers later. <span className="lx-serif">Proof</span> now.
          </>
        }
        sub="No storefront in the hackathon build. The product is the fail-closed save play."
      />
      <section className="lx-section lx-shell" style={{ paddingTop: 24 }}>
        <Link to="/app" className="lx-pill">
          Open app
        </Link>
      </section>
    </SitePage>
  );
}

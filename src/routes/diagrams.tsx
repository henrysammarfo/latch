import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";

export const Route = createFileRoute("/diagrams")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Diagrams — Latch" },
      {
        name: "description",
        content:
          "Latch architecture diagrams as Excalidraw scenes, generated from Mermaid via @excalidraw/mermaid-to-excalidraw.",
      },
    ],
  }),
  component: DiagramsPage,
});

type CatalogItem = {
  id: string;
  title: string;
  description: string;
  mermaid: string;
  excalidraw: string;
};

function DiagramsPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [active, setActive] = useState("save-play");
  const [mermaidSource, setMermaidSource] = useState("");

  useEffect(() => {
    void fetch("/diagrams/catalog.json")
      .then((r) => r.json())
      .then((j: CatalogItem[]) => {
        setCatalog(j);
        if (j[0]) setActive(j[0].id);
      })
      .catch(() => setCatalog([]));
  }, []);

  const current = catalog.find((c) => c.id === active) || catalog[0];

  useEffect(() => {
    if (!current) return;
    void fetch(`/diagrams/${current.id}.mmd`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("missing"))))
      .then((text) => setMermaidSource(text))
      .catch(() => setMermaidSource(current.mermaid || ""));
  }, [current]);

  const viewerSrc = useMemo(() => {
    if (!current) return "";
    const scene = `/diagrams/${current.excalidraw}`;
    const mermaid = `/diagrams/${current.id}.mmd`;
    return `/diagrams/viewer.html?scene=${encodeURIComponent(scene)}&mermaid=${encodeURIComponent(mermaid)}`;
  }, [current]);

  return (
    <SitePage>
      <PageHead
        eyebrow="Diagrams"
        title={
          <>
            Architecture as <span className="lx-serif">Excalidraw</span>.
          </>
        }
        sub="Committed .excalidraw scenes plus live Mermaid → Excalidraw conversion using the official Excalidraw libraries (CDN iframe — kept out of the server bundle)."
      />

      <section className="lx-section lx-shell" style={{ paddingTop: 24 }}>
        <div className="mb-4 flex flex-wrap gap-2">
          {catalog.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${
                active === c.id ? "bg-[oklch(0.28_0.05_145)] text-white" : "border border-black/10 bg-white"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        {current ? (
          <>
            <p className="mb-4 max-w-2xl text-sm text-black/60">{current.description}</p>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#07140F]">
              {viewerSrc ? (
                <iframe
                  title={`${current.title} Excalidraw diagram`}
                  src={viewerSrc}
                  className="h-[620px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
            <details className="mt-4 rounded-2xl border border-black/8 bg-white p-4">
              <summary className="cursor-pointer text-sm font-medium">Mermaid source</summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-black/70">
                {mermaidSource || current.mermaid}
              </pre>
            </details>
            <p className="mt-3 text-xs text-black/45">
              Scene file:{" "}
              <a className="underline" href={`/diagrams/${current.excalidraw}`} download>
                {current.excalidraw}
              </a>
              {" · "}
              open in{" "}
              <a className="underline" href="https://excalidraw.com" target="_blank" rel="noreferrer">
                excalidraw.com
              </a>
            </p>
          </>
        ) : (
          <div className="h-40 animate-pulse rounded-2xl bg-black/5" />
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            className="rounded-2xl border border-black/8 bg-white p-4 text-sm hover:border-black/20"
            href="https://github.com/excalidraw/excalidraw"
            target="_blank"
            rel="noreferrer"
          >
            <p className="font-medium">excalidraw/excalidraw</p>
            <p className="mt-1 text-black/55">Interactive whiteboard used by the viewer iframe.</p>
          </a>
          <a
            className="rounded-2xl border border-black/8 bg-white p-4 text-sm hover:border-black/20"
            href="https://github.com/excalidraw/mermaid-to-excalidraw"
            target="_blank"
            rel="noreferrer"
          >
            <p className="font-medium">mermaid-to-excalidraw</p>
            <p className="mt-1 text-black/55">Live Mermaid → Excalidraw conversion in the browser.</p>
          </a>
          <Link to="/docs" className="rounded-2xl border border-black/8 bg-white p-4 text-sm hover:border-black/20">
            <p className="font-medium">Latch docs</p>
            <p className="mt-1 text-black/55">Setup, connectors, and fail-closed doctrine.</p>
          </Link>
        </div>
      </section>
    </SitePage>
  );
}

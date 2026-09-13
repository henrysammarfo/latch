import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Bug, Trash2 } from "lucide-react";
import { PageHead, SitePage } from "@/components/latch/SiteChrome";
import { GOLDEN, passRate } from "@/lib/latch-data";

export const Route = createFileRoute("/reliability")({
  head: () => ({
    meta: [
      { title: "Reliability brief — golden jobs, force-fail, deletion test" },
      {
        name: "description",
        content:
          "How Latch proves itself: golden job fixtures with expected outcomes, injected failures that must go red, retries, and a deletion test.",
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
  component: Reliability;
});

function Reliability() {
  return <div />;
}

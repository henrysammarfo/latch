import { createFileRoute } from "@tanstack/react-router";

import { loadEnv } from "../../../server/env/loadEnv";
import { getPlay, listPlays } from "../../../server/store/plays";

export const Route = createFileRoute("/api/latch/plays")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        loadEnv({ force: true });
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (id) {
          const play = getPlay(id);
          if (!play) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
          return Response.json({ ok: true, play });
        }
        return Response.json({ ok: true, plays: listPlays() });
      },
    },
  },
});

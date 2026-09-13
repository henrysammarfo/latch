import { createFileRoute } from "@tanstack/react-router";

import type { StepName } from "../../../server/domain/types";
import { getRuntimeConfig, loadEnv } from "../../../server/env/loadEnv";
import { runSavePlay } from "../../../server/saga/orchestrator";

export const Route = createFileRoute("/api/latch/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        loadEnv({ force: true });
        const rt = getRuntimeConfig();
        const body = (await request.json().catch(() => ({}))) as {
          injectFail?: StepName | null;
          forceNew?: boolean;
          pokeToken?: string;
        };
        if (rt.pokeToken && body.pokeToken !== rt.pokeToken) {
          return Response.json({ ok: false, error: "unauthorized_poke" }, { status: 401 });
        }
        try {
          const play = await runSavePlay({
            injectFail: body.injectFail ?? null,
            forceNew: body.forceNew ?? true,
          });
          return Response.json({ ok: true, play });
        } catch (err) {
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : String(err) },
            { status: 500 },
          );
        }
      },
    },
  },
});

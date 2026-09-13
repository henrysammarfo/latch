import { createFileRoute } from "@tanstack/react-router";

import { loadEnv } from "../../../server/env/loadEnv";
import { runGoldens } from "../../../server/eval/runner";

export const Route = createFileRoute("/api/latch/goldens")({
  server: {
    handlers: {
      POST: async () => {
        loadEnv({ force: true });
        try {
          const results = await runGoldens();
          return Response.json({ ok: results.every((r) => r.ok), results });
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

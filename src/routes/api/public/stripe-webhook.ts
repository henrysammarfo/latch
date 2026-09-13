import { createFileRoute } from "@tanstack/react-router";

import { evidenceFromStripeEvent, verifyStripeWebhook } from "../../../server/connectors/stripe";
import { loadEnv } from "../../../server/env/loadEnv";
import { runSavePlay } from "../../../server/saga/orchestrator";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        loadEnv({ force: true });
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return Response.json({ ok: false, error: "missing_signature" }, { status: 401 });
        }
        const payload = await request.text();
        try {
          const event = verifyStripeWebhook(payload, signature);
          const evidence = evidenceFromStripeEvent(event);
          const play = await runSavePlay({ evidence, forceNew: false });
          return Response.json({ ok: true, playId: play.id, state: play.state });
        } catch (err) {
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : String(err) },
            { status: 400 },
          );
        }
      },
    },
  },
});

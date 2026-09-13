import { createFileRoute } from "@tanstack/react-router";

import { getRuntimeConfig, loadEnv } from "../../server/env/loadEnv";
import { connectorStatus } from "../../server/store/plays";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        loadEnv({ force: true });
        const rt = getRuntimeConfig();
        const status = connectorStatus();
        return Response.json({
          ok: true,
          service: "latch",
          mode: rt.mode,
          killSwitch: rt.killSwitch,
          connectors: status.connectors,
        });
      },
    },
  },
});

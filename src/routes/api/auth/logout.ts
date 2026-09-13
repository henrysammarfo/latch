import { createFileRoute } from "@tanstack/react-router";
import { clearSession, jsonOk } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        const res = jsonOk({ loggedOut: true });
        clearSession(res);
        return res;
      },
    },
  },
});

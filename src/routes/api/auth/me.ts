import { createFileRoute } from "@tanstack/react-router";
import { listAgents, publicUser } from "../../../server/tenancy/store";
import { jsonErr, jsonOk, sessionFromRequest } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        return jsonOk({
          user: publicUser(session.user),
          workspace: session.workspace,
          agents: listAgents(session.workspace.id),
        });
      },
    },
  },
});

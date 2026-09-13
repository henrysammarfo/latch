import { createFileRoute } from "@tanstack/react-router";
import { getAgent, updateAgent } from "../../../../server/tenancy/store";
import { jsonErr, jsonOk, sessionFromRequest } from "../../../../server/tenancy/session";

export const Route = createFileRoute("/api/workspace/agents/$agentId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        const agent = getAgent(session.workspace.id, params.agentId);
        if (!agent) return jsonErr("Agent not found.", 404);
        return jsonOk({ agent });
      },
      PATCH: async ({ request, params }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        try {
          const body = (await request.json()) as {
            name?: string;
            purpose?: string;
            status?: "draft" | "active" | "paused";
            triggers?: string[];
          };
          const agent = updateAgent(session.workspace.id, params.agentId, body);
          return jsonOk({ agent });
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e));
        }
      },
    },
  },
});

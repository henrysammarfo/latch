import { createFileRoute } from "@tanstack/react-router";
import { createAgent, listAgents, snapshotForUser } from "../../../server/tenancy/store";
import { attachSession, jsonErr, jsonOk, sessionFromRequest } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/workspace/agents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        return jsonOk({ agents: listAgents(session.workspace.id) });
      },
      POST: async ({ request }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        try {
          const body = (await request.json()) as {
            name?: string;
            purpose?: string;
            triggers?: string[];
          };
          const agent = await createAgent(session.workspace.id, {
            name: body.name || "",
            purpose: body.purpose || "",
            ...(body.triggers ? { triggers: body.triggers } : {}),
          });
          const res = jsonOk({ agent });
          const snap = snapshotForUser(session.user.id);
          if (snap) await attachSession(res, session.user, session.workspace, snap);
          return res;
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e));
        }
      },
    },
  },
});

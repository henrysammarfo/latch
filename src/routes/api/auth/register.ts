import { createFileRoute } from "@tanstack/react-router";
import { registerUser, publicUser } from "../../../server/tenancy/store";
import { attachSession, jsonErr, jsonOk } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
            name?: string;
            workspaceName?: string;
          };
          const { user, workspace, agent, snap } = await registerUser({
            email: body.email || "",
            password: body.password || "",
            name: body.name || "",
            ...(body.workspaceName ? { workspaceName: body.workspaceName } : {}),
          });
          const res = jsonOk({
            user: publicUser(user),
            workspace,
            agent,
          });
          await attachSession(res, user, workspace, snap);
          return res;
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e), 400);
        }
      },
    },
  },
});

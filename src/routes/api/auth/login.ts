import { createFileRoute } from "@tanstack/react-router";
import { loginUser, publicUser } from "../../../server/tenancy/store";
import { attachSession, jsonErr, jsonOk } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string; password?: string };
          const { user, workspace, snap } = await loginUser(body.email || "", body.password || "");
          const res = jsonOk({ user: publicUser(user), workspace });
          await attachSession(res, user, workspace, snap);
          return res;
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e), 401);
        }
      },
    },
  },
});

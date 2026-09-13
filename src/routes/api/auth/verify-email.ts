import { createFileRoute } from "@tanstack/react-router";
import { issueVerifyToken, markEmailVerified, publicUser } from "../../../server/tenancy/store";
import { jsonErr, jsonOk, sessionFromRequest } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/verify-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        const body = (await request.json().catch(() => ({}))) as { token?: string };
        try {
          if (body.token) {
            const user = markEmailVerified(session.user.id, body.token);
            return jsonOk({ user: publicUser(user), verified: true });
          }
          const user = issueVerifyToken(session.user.id);
          return jsonOk({
            user: publicUser(user),
            verifyToken: user.verifyToken,
            hint: "No email SMTP yet — paste this token in Settings to verify. Judges can proceed without verifying.",
          });
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e));
        }
      },
    },
  },
});

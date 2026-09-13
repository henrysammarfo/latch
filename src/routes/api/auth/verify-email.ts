import { createFileRoute } from "@tanstack/react-router";
import { issueVerifyToken, markEmailVerified, publicUser, snapshotForUser } from "../../../server/tenancy/store";
import { attachSession, jsonErr, jsonOk, sessionFromRequest } from "../../../server/tenancy/session";

export const Route = createFileRoute("/api/auth/verify-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await sessionFromRequest(request);
        if (!session) return jsonErr("Not signed in.", 401);
        const body = (await request.json().catch(() => ({}))) as { token?: string };
        try {
          if (body.token) {
            const user = await markEmailVerified(session.user.id, body.token);
            const res = jsonOk({ user: publicUser(user), verified: true });
            const snap = snapshotForUser(user.id);
            if (snap) await attachSession(res, user, session.workspace, snap);
            return res;
          }
          const user = await issueVerifyToken(session.user.id);
          const res = jsonOk({
            user: publicUser(user),
            verifyToken: user.verifyToken,
            hint: "No email SMTP yet — paste this token in Settings to verify. Judges can proceed without verifying.",
          });
          const snap = snapshotForUser(user.id);
          if (snap) await attachSession(res, user, session.workspace, snap);
          return res;
        } catch (e) {
          return jsonErr(e instanceof Error ? e.message : String(e));
        }
      },
    },
  },
});

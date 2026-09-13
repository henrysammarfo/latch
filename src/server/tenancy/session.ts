import { getCookie, setCookie, deleteCookie } from "./cookies";
import {
  createSessionToken,
  getUser,
  getWorkspace,
  publicUser,
  readSessionToken,
  type User,
  type Workspace,
} from "./store";

export const SESSION_COOKIE = "latch_session";

export async function sessionFromRequest(request: Request) {
  const token = getCookie(request, SESSION_COOKIE);
  const session = await readSessionToken(token);
  if (!session) return null;
  const user = getUser(session.userId);
  const workspace = getWorkspace(session.workspaceId);
  if (!user || !workspace) return null;
  return { user, workspace, token };
}

export async function attachSession(response: Response, user: User, workspace: Workspace) {
  const token = await createSessionToken(user.id, workspace.id);
  const secure = process.env['VERCEL'] === "1" || process.env['NODE_ENV'] === "production";
  setCookie(response, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 14,
  });
  return token;
}

export function clearSession(response: Response) {
  deleteCookie(response, SESSION_COOKIE);
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return Response.json({ ok: true, ...((data as object) || {}) }, init);
}

export function jsonErr(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export { publicUser };

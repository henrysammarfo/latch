import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { loadTenantSnapshotByEmail, persistTenantSnapshot } from "./persist";
import type { Agent, TenantSnapshot, User, Workspace } from "./types";

export type { Agent, TenantSnapshot, User, Workspace };

type Db = {
  users: User[];
  workspaces: Workspace[];
  agents: Agent[];
};

const g = globalThis as unknown as { __latchDb?: Db };

function emptyDb(): Db {
  return { users: [], workspaces: [], agents: [] };
}

function load(): Db {
  if (!g.__latchDb) g.__latchDb = emptyDb();
  return g.__latchDb;
}

function id(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

function scryptHash(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `sha256$${salt}$${hash}`;
}

export function hashPassword(password: string) {
  return scryptHash(password);
}

export function verifyPassword(password: string, stored: string) {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "sha256" || !salt || !hash) return false;
  const next = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(next));
  } catch {
    return false;
  }
}

function sessionSecret() {
  const s =
    process.env["SESSION_SECRET"] ||
    process.env["LATCH_SESSION_SECRET"] ||
    "latch-dev-session-secret-change-me";
  return new TextEncoder().encode(s);
}

export function snapshotForUser(userId: string): TenantSnapshot | null {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const workspace = db.workspaces.find((w) => w.id === user.workspaceId);
  if (!workspace) return null;
  const agents = db.agents.filter((a) => a.workspaceId === workspace.id);
  return { user, workspace, agents };
}

export function hydrateSnapshot(snap: TenantSnapshot): void {
  const db = load();
  const existing = db.users.find((u) => u.id === snap.user.id);
  // Prefer keeping a real password hash if cookie snap blanked it
  const mergedUser: User = {
    ...snap.user,
    passwordHash:
      snap.user.passwordHash && snap.user.passwordHash.length > 0
        ? snap.user.passwordHash
        : existing?.passwordHash || "",
  };

  const ui = db.users.findIndex((u) => u.id === snap.user.id);
  if (ui >= 0) db.users[ui] = mergedUser;
  else db.users.push(mergedUser);

  for (let i = db.users.length - 1; i >= 0; i--) {
    const u = db.users[i]!;
    if (u.email === snap.user.email && u.id !== snap.user.id) db.users.splice(i, 1);
  }

  const wi = db.workspaces.findIndex((w) => w.id === snap.workspace.id);
  if (wi >= 0) db.workspaces[wi] = snap.workspace;
  else db.workspaces.push(snap.workspace);

  db.agents = db.agents.filter((a) => a.workspaceId !== snap.workspace.id);
  db.agents.push(...snap.agents);
}

async function persistUser(userId: string): Promise<void> {
  const snap = snapshotForUser(userId);
  if (!snap) return;
  await persistTenantSnapshot(snap);
}

/** Cookie-safe snap: never put password hashes in the JWT. */
function sessionSnap(snap: TenantSnapshot): TenantSnapshot {
  return {
    user: {
      ...snap.user,
      passwordHash: "",
    },
    workspace: snap.workspace,
    agents: snap.agents,
  };
}

export async function createSessionToken(userId: string, workspaceId: string, snap?: TenantSnapshot) {
  const raw = snap || snapshotForUser(userId) || null;
  return new SignJWT({
    uid: userId,
    wid: workspaceId,
    snap: raw ? sessionSnap(raw) : null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(sessionSecret());
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const uid = String(payload["uid"] || "");
    const wid = String(payload["wid"] || "");
    if (!uid || !wid) return null;
    const snap = payload["snap"] as TenantSnapshot | undefined;
    if (snap?.user?.id && snap?.workspace?.id) {
      hydrateSnapshot(snap);
    }
    return { userId: uid, workspaceId: wid, snap };
  } catch {
    return null;
  }
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  workspaceName?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");

  const db = load();
  if (db.users.some((u) => u.email === email)) {
    throw new Error("An account with that email already exists.");
  }
  const fromSheet = await loadTenantSnapshotByEmail(email);
  if (fromSheet) {
    hydrateSnapshot(fromSheet);
    throw new Error("An account with that email already exists.");
  }

  const userId = id("usr");
  const workspaceId = id("ws");
  const slug =
    (input.workspaceName || `${input.name || email.split("@")[0]} workspace`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "workspace";

  const workspace: Workspace = {
    id: workspaceId,
    name: input.workspaceName?.trim() || `${input.name.trim() || "My"} workspace`,
    slug: `${slug}-${workspaceId.slice(-4)}`,
    ownerUserId: userId,
    createdAt: new Date().toISOString(),
  };

  const user: User = {
    id: userId,
    email,
    name: input.name.trim() || email.split("@")[0] || "User",
    passwordHash: hashPassword(input.password),
    emailVerified: false,
    verifyToken: randomBytes(24).toString("hex"),
    workspaceId,
    createdAt: new Date().toISOString(),
  };

  const starter: Agent = {
    id: id("agt"),
    workspaceId,
    name: "Churn watch",
    purpose: "Watch cancel signals and run a save play with proof.",
    status: "active",
    triggers: ["gmail.cancel_language", "stripe.payment_failed"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const snap: TenantSnapshot = { user, workspace, agents: [starter] };
  hydrateSnapshot(snap);
  await persistTenantSnapshot(snap);
  return { user, workspace, agent: starter, snap };
}

export async function loginUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  let user = load().users.find((u) => u.email === email) || null;

  if (!user) {
    const fromSheet = await loadTenantSnapshotByEmail(email);
    if (fromSheet) {
      hydrateSnapshot(fromSheet);
      user = fromSheet.user;
    }
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Email or password is wrong.");
  }
  const workspace = load().workspaces.find((w) => w.id === user!.workspaceId);
  if (!workspace) throw new Error("Workspace missing.");
  const snap = snapshotForUser(user.id);
  return { user, workspace, snap: snap! };
}

export function getUser(userId: string) {
  return load().users.find((u) => u.id === userId) || null;
}

export function getWorkspace(workspaceId: string) {
  return load().workspaces.find((w) => w.id === workspaceId) || null;
}

export function listAgents(workspaceId: string) {
  return load()
    .agents.filter((a) => a.workspaceId === workspaceId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getAgent(workspaceId: string, agentId: string) {
  return load().agents.find((a) => a.workspaceId === workspaceId && a.id === agentId) || null;
}

export async function createAgent(
  workspaceId: string,
  input: { name: string; purpose: string; triggers?: string[] },
) {
  const db = load();
  const agent: Agent = {
    id: id("agt"),
    workspaceId,
    name: input.name.trim() || "Untitled agent",
    purpose: input.purpose.trim() || "Save at-risk accounts with proof.",
    status: "draft",
    triggers: input.triggers?.length ? input.triggers : ["gmail.cancel_language"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.agents.push(agent);
  const owner = db.workspaces.find((w) => w.id === workspaceId)?.ownerUserId;
  if (owner) await persistUser(owner);
  return agent;
}

export async function updateAgent(
  workspaceId: string,
  agentId: string,
  patch: Partial<Pick<Agent, "name" | "purpose" | "status" | "triggers">>,
) {
  const db = load();
  const agent = db.agents.find((a) => a.workspaceId === workspaceId && a.id === agentId);
  if (!agent) throw new Error("Agent not found.");
  Object.assign(agent, patch, { updatedAt: new Date().toISOString() });
  const owner = db.workspaces.find((w) => w.id === workspaceId)?.ownerUserId;
  if (owner) await persistUser(owner);
  return agent;
}

export async function markEmailVerified(userId: string, token: string) {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  if (!user.verifyToken || user.verifyToken !== token) throw new Error("Invalid verify token.");
  user.emailVerified = true;
  user.verifyToken = null;
  await persistUser(userId);
  return user;
}

export async function issueVerifyToken(userId: string) {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.verifyToken = randomBytes(24).toString("hex");
  await persistUser(userId);
  return user;
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    workspaceId: user.workspaceId,
    createdAt: user.createdAt,
  };
}

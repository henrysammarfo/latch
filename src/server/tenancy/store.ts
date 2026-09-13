import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SignJWT, jwtVerify } from "jose";

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  verifyToken: string | null;
  workspaceId: string;
  createdAt: string;
};

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  status: "draft" | "active" | "paused";
  triggers: string[];
  createdAt: string;
  updatedAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  createdAt: string;
};

type Db = {
  users: User[];
  workspaces: Workspace[];
  agents: Agent[];
};

const g = globalThis as unknown as { __latchDb?: Db; __latchDbPath?: string };

function emptyDb(): Db {
  return { users: [], workspaces: [], agents: [] };
}

function dbPath() {
  if (process.env['LATCH_DB_PATH']) return process.env['LATCH_DB_PATH'];
  // Vercel: /tmp is writable per instance; local: .data/
  if (process.env['VERCEL'] === "1") return join("/tmp", "latch-tenants.json");
  return join(process.cwd(), ".data", "tenants.json");
}

function load(): Db {
  if (g.__latchDb) return g.__latchDb;
  const path = dbPath();
  try {
    if (existsSync(path)) {
      g.__latchDb = JSON.parse(readFileSync(path, "utf8")) as Db;
      return g.__latchDb;
    }
  } catch {
    /* fall through */
  }
  g.__latchDb = emptyDb();
  return g.__latchDb;
}

function save(db: Db) {
  g.__latchDb = db;
  try {
    const path = dbPath();
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, JSON.stringify(db, null, 2));
  } catch {
    /* Vercel read-only FS — memory only for this instance */
  }
}

function id(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

function scryptHash(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  // Prefer scrypt when available via node crypto sync helper
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
  const s = process.env['SESSION_SECRET'] || process.env['LATCH_SESSION_SECRET'] || "latch-dev-session-secret-change-me";
  return new TextEncoder().encode(s);
}

export async function createSessionToken(userId: string, workspaceId: string) {
  return new SignJWT({ uid: userId, wid: workspaceId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(sessionSecret());
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const uid = String(payload['uid'] || "");
    const wid = String(payload['wid'] || "");
    if (!uid || !wid) return null;
    return { userId: uid, workspaceId: wid };
  } catch {
    return null;
  }
}

export function registerUser(input: { email: string; password: string; name: string; workspaceName?: string }) {
  const db = load();
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (db.users.some((u) => u.email === email)) throw new Error("An account with that email already exists.");

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

  db.workspaces.push(workspace);
  db.users.push(user);
  db.agents.push(starter);
  save(db);
  return { user, workspace, agent: starter };
}

export function loginUser(emailRaw: string, password: string) {
  const db = load();
  const email = emailRaw.trim().toLowerCase();
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Email or password is wrong.");
  }
  const workspace = db.workspaces.find((w) => w.id === user.workspaceId);
  if (!workspace) throw new Error("Workspace missing.");
  return { user, workspace };
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

export function createAgent(
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
  save(db);
  return agent;
}

export function updateAgent(
  workspaceId: string,
  agentId: string,
  patch: Partial<Pick<Agent, "name" | "purpose" | "status" | "triggers">>,
) {
  const db = load();
  const agent = db.agents.find((a) => a.workspaceId === workspaceId && a.id === agentId);
  if (!agent) throw new Error("Agent not found.");
  Object.assign(agent, patch, { updatedAt: new Date().toISOString() });
  save(db);
  return agent;
}

export function markEmailVerified(userId: string, token: string) {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  if (!user.verifyToken || user.verifyToken !== token) throw new Error("Invalid verify token.");
  user.emailVerified = true;
  user.verifyToken = null;
  save(db);
  return user;
}

export function issueVerifyToken(userId: string) {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.verifyToken = randomBytes(24).toString("hex");
  save(db);
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

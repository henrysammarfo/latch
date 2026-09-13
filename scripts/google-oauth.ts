#!/usr/bin/env npx tsx
/**
 * Google OAuth helper for LATCH.
 * 1) npm run oauth:google          → prints auth URL
 * 2) Open URL, approve, copy full redirect URL (even if localhost fails)
 * 3) npm run oauth:google -- --code='...'   OR  --url='http://127.0.0.1:3000/...?code=...'
 * Writes GOOGLE_REFRESH_TOKEN into .env only. Never prints full tokens.
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { google } from "googleapis";
import { loadEnv, getEnv } from "../src/server/env/loadEnv.js";

const REDIRECT = "http://127.0.0.1:3000/api/oauth/google/callback";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
];

function client() {
  loadEnv({ force: true, override: true });
  const id = getEnv("GOOGLE_CLIENT_ID");
  const secret = getEnv("GOOGLE_CLIENT_SECRET");
  if (!id || !secret) throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env");
  return new google.auth.OAuth2(id, secret, REDIRECT);
}

function upsertEnv(key: string, value: string) {
  const path = ".env";
  const raw = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = raw.split(/\r?\n/);
  let seen = false;
  const out = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      seen = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!seen) out.push(`${key}=${value}`);
  writeFileSync(path, out.filter((l, i) => !(i === out.length - 1 && l === "")).join("\n") + "\n");
}

function extractCode(arg: string): string {
  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    const u = new URL(arg);
    const code = u.searchParams.get("code");
    if (!code) throw new Error("No code= in URL");
    return code;
  }
  return arg;
}

async function exchange(code: string) {
  const oauth = client();
  const { tokens } = await oauth.getToken(code);
  if (!tokens.refresh_token) {
    console.log(
      JSON.stringify({
        ok: false,
        message:
          "No refresh_token returned. Revoke LATCH access at https://myaccount.google.com/permissions then re-run with prompt=consent.",
      }),
    );
    process.exit(1);
  }
  upsertEnv("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
  oauth.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth });
  const me = await oauth2.userinfo.get();
  console.log(
    JSON.stringify({
      ok: true,
      email: me.data.email ?? null,
      refresh_token_len: tokens.refresh_token.length,
      refresh_token_prefix: `${tokens.refresh_token.slice(0, 6)}…`,
    }),
  );
}

async function printUrl() {
  const oauth = client();
  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  console.log(JSON.stringify({ ok: true, redirect: REDIRECT, authUrl: url }));
}

async function listenOnce() {
  const oauth = client();
  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  console.log(JSON.stringify({ ok: true, mode: "listen", authUrl: url, hint: "Open authUrl; this process waits on :3000" }));
  await new Promise<void>((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        if (!req.url?.startsWith("/api/oauth/google/callback")) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        const u = new URL(req.url, REDIRECT);
        const code = u.searchParams.get("code");
        const err = u.searchParams.get("error");
        if (err) throw new Error(`oauth_error:${err}`);
        if (!code) throw new Error("missing_code");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><body><h1>LATCH Google OAuth OK</h1><p>You can close this tab.</p></body></html>");
        server.close();
        await exchange(code);
        resolve();
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
        server.close();
        reject(e);
      }
    });
    server.listen(3000, "127.0.0.1");
  });
}

async function main() {
  const args = process.argv.slice(2);
  const codeIdx = args.findIndex((a) => a === "--code" || a.startsWith("--code="));
  const urlIdx = args.findIndex((a) => a === "--url" || a.startsWith("--url="));
  const listen = args.includes("--listen");

  if (listen) {
    await listenOnce();
    return;
  }
  if (codeIdx >= 0) {
    const raw = args[codeIdx].includes("=")
      ? args[codeIdx].split("=").slice(1).join("=")
      : args[codeIdx + 1];
    await exchange(extractCode(raw));
    return;
  }
  if (urlIdx >= 0) {
    const raw = args[urlIdx].includes("=")
      ? args[urlIdx].split("=").slice(1).join("=")
      : args[urlIdx + 1];
    await exchange(extractCode(raw));
    return;
  }
  await printUrl();
}

main().catch((err) => {
  console.log(JSON.stringify({ ok: false, message: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});

import { createFileRoute } from "@tanstack/react-router";

import { getEnv, loadEnv, requireEnv } from "../../../../server/env/loadEnv";

function publicOrigin(request: Request): string {
  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = xfHost || request.headers.get("host") || new URL(request.url).host;
  const xfProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    xfProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

function redirectUri(request: Request): string {
  loadEnv({ force: true });
  const configured = getEnv("GOOGLE_REDIRECT_URI");
  if (configured) return configured;
  return `${publicOrigin(request)}/api/oauth/google/callback`;
}

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"/><title>LATCH Google OAuth</title>
    <style>body{font-family:ui-sans-serif,system-ui;background:#0b1f17;color:#e8f5ef;padding:2rem;max-width:42rem;margin:auto;line-height:1.45}
    code{background:#143528;padding:.15rem .35rem;border-radius:4px;word-break:break-all}a{color:#7dffa3}</style></head>
    <body>${body}</body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

async function exchangeCode(code: string, redirect: string) {
  const body = new URLSearchParams({
    code,
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
    redirect_uri: redirect,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok) {
    throw new Error(`token_exchange:${json.error ?? res.status} ${json.error_description ?? ""}`.trim());
  }
  return json;
}

async function upsertVercelEnv(key: string, value: string): Promise<{ ok: boolean; detail: string }> {
  const vercelToken = getEnv("VERCEL_TOKEN") || getEnv("VERCEL_API_TOKEN");
  const projectId = getEnv("VERCEL_PROJECT_ID");
  const teamId = getEnv("VERCEL_TEAM_ID");
  if (!vercelToken || !projectId) {
    return { ok: false, detail: "skipped (no VERCEL_TOKEN/PROJECT_ID on runtime)" };
  }
  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}&upsert=true` : "?upsert=true";
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview", "development"],
    }),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, detail: `vercel ${res.status}: ${text.slice(0, 160)}` };
  return { ok: true, detail: "GOOGLE_REFRESH_TOKEN upserted on Vercel" };
}

export const Route = createFileRoute("/api/oauth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          loadEnv({ force: true });
          const url = new URL(request.url);
          const err = url.searchParams.get("error");
          if (err) {
            return html(
              `<h1>OAuth blocked</h1><p><code>${err}</code></p>
               <p>Unverified app? Click Advanced → Go to LATCH. Or stay under the 100-user cap.</p>
               <p><a href="/api/oauth/google/start">Retry</a></p>`,
              400,
            );
          }
          const code = url.searchParams.get("code");
          if (!code) return html("<h1>Missing code</h1><p><a href=\"/api/oauth/google/start\">Start again</a></p>", 400);

          const redirect = redirectUri(request);
          const tokens = await exchangeCode(code, redirect);
          if (!tokens.refresh_token) {
            return html(
              `<h1>No refresh token</h1>
               <p>Revoke LATCH at <a href="https://myaccount.google.com/permissions">Google permissions</a>, then retry.</p>
               <p><a href="/api/oauth/google/start">/api/oauth/google/start</a></p>`,
              400,
            );
          }

          const vercelWrite = await upsertVercelEnv("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);

          // Also mirror into response header-free status for operator.
          return html(`
            <h1>LATCH Google connected</h1>
            <p>Refresh token saved path: <code>${vercelWrite.ok ? "vercel env" : "manual"}</code></p>
            <p>${vercelWrite.detail}</p>
            <p>If manual: reply in Cursor chat with <code>key rotated</code> after you paste the token into Vercel env (do not paste the token in chat).</p>
            <p>Next: create the Sheet and send the spreadsheet id.</p>
            <p><a href="/api/health">/api/health</a> · <a href="/dashboard">/dashboard</a></p>
          `);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return html(
            `<h1>OAuth callback failed</h1><p><code>${msg}</code></p>
             <p><a href="/api/oauth/google/start">Retry start</a></p>`,
            500,
          );
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { google } from "googleapis";

import { getEnv, loadEnv, requireEnv } from "../../../../server/env/loadEnv";

function publicOrigin(request: Request): string {
  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = xfHost || request.headers.get("host") || new URL(request.url).host;
  const xfProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = xfProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

function redirectUri(request: Request): string {
  loadEnv({ force: true });
  // Explicit env wins (set on Vercel to custom domain callback).
  const configured = getEnv("GOOGLE_REDIRECT_URI");
  if (configured) return configured;
  return `${publicOrigin(request)}/api/oauth/google/callback`;
}

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"/><title>LATCH Google OAuth</title>
    <style>body{font-family:ui-sans-serif,system-ui;background:#0b1f17;color:#e8f5ef;padding:2rem;max-width:42rem;margin:auto;line-height:1.45}
    code{background:#143528;padding:.15rem .35rem;border-radius:4px}a{color:#7dffa3}</style></head>
    <body>${body}</body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/oauth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        loadEnv({ force: true });
        const url = new URL(request.url);
        const err = url.searchParams.get("error");
        if (err) {
          return html(
            `<h1>OAuth blocked</h1><p><code>${err}</code></p>
             <p>If this is <code>access_denied</code>, publish the app or add the account as a Test user.</p>`,
            400,
          );
        }
        const code = url.searchParams.get("code");
        if (!code) return html("<h1>Missing code</h1>", 400);

        const client = new google.auth.OAuth2(
          requireEnv("GOOGLE_CLIENT_ID"),
          requireEnv("GOOGLE_CLIENT_SECRET"),
          redirectUri(request),
        );
        const { tokens } = await client.getToken(code);
        if (!tokens.refresh_token) {
          return html(
            `<h1>No refresh token</h1>
             <p>Revoke LATCH at <a href="https://myaccount.google.com/permissions">Google permissions</a>, then retry <a href="/api/oauth/google/start">/api/oauth/google/start</a>.</p>`,
            400,
          );
        }

        client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: "v2", auth: client });
        const me = await oauth2.userinfo.get();
        const email = me.data.email ?? "unknown";

        // Persist into Vercel project env when bootstrap token is present (owner deploy path).
        const vercelToken = getEnv("VERCEL_TOKEN") || getEnv("VERCEL_API_TOKEN");
        const projectId = getEnv("VERCEL_PROJECT_ID");
        const teamId = getEnv("VERCEL_TEAM_ID");
        let vercelWrite: { ok: boolean; detail: string } = {
          ok: false,
          detail: "skipped (no VERCEL_TOKEN/PROJECT_ID on runtime)",
        };
        if (vercelToken && projectId) {
          try {
            const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
            // upsert env for production + preview
            for (const target of ["production", "preview"] as const) {
              const body = {
                key: "GOOGLE_REFRESH_TOKEN",
                value: tokens.refresh_token,
                type: "encrypted",
                target: [target],
              };
              const res = await fetch(
                `https://api.vercel.com/v10/projects/${projectId}/env${qs}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${vercelToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(body),
                },
              );
              const text = await res.text();
              if (!res.ok && !text.includes("EXISTING") && res.status !== 409) {
                // try patch existing
                const listRes = await fetch(
                  `https://api.vercel.com/v9/projects/${projectId}/env${qs}`,
                  { headers: { Authorization: `Bearer ${vercelToken}` } },
                );
                const list = (await listRes.json()) as {
                  envs?: Array<{ id: string; key: string }>;
                };
                const existing = list.envs?.find((e) => e.key === "GOOGLE_REFRESH_TOKEN");
                if (existing) {
                  const patch = await fetch(
                    `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}${qs}`,
                    {
                      method: "PATCH",
                      headers: {
                        Authorization: `Bearer ${vercelToken}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        value: tokens.refresh_token,
                        type: "encrypted",
                        target: ["production", "preview"],
                      }),
                    },
                  );
                  if (!patch.ok) {
                    vercelWrite = {
                      ok: false,
                      detail: `vercel env write failed: ${patch.status}`,
                    };
                    break;
                  }
                  vercelWrite = { ok: true, detail: "updated existing GOOGLE_REFRESH_TOKEN" };
                } else {
                  vercelWrite = {
                    ok: false,
                    detail: `vercel env create failed: ${res.status} ${text.slice(0, 120)}`,
                  };
                  break;
                }
              } else {
                vercelWrite = { ok: true, detail: `wrote GOOGLE_REFRESH_TOKEN (${target})` };
              }
            }
          } catch (e) {
            vercelWrite = {
              ok: false,
              detail: e instanceof Error ? e.message : String(e),
            };
          }
        }

        return html(`
          <h1>LATCH Google connected</h1>
          <p>Account: <code>${email}</code></p>
          <p>Refresh token received (len ${tokens.refresh_token.length}). Not shown here.</p>
          <p>Vercel env: <code>${vercelWrite.ok ? "ok" : "pending"}</code> — ${vercelWrite.detail}</p>
          <p>Next: set <code>GOOGLE_SHEETS_SPREADSHEET_ID</code>, then poke <a href="/dashboard">/dashboard</a>.</p>
          <p><a href="/api/health">/api/health</a></p>
        `);
      },
    },
  },
});

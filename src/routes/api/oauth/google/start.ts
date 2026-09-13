import { createFileRoute } from "@tanstack/react-router";

import { getEnv, loadEnv, requireEnv } from "../../../../server/env/loadEnv";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

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

export const Route = createFileRoute("/api/oauth/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        loadEnv({ force: true });
        const params = new URLSearchParams({
          client_id: requireEnv("GOOGLE_CLIENT_ID"),
          redirect_uri: redirectUri(request),
          response_type: "code",
          scope: SCOPES,
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        });
        return Response.redirect(
          `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
          302,
        );
      },
    },
  },
});

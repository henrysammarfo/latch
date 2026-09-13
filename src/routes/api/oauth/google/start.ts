import { createFileRoute } from "@tanstack/react-router";
import { google } from "googleapis";

import { getEnv, loadEnv, requireEnv } from "../../../../server/env/loadEnv";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
];

function publicOrigin(request: Request): string {
  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = xfHost || request.headers.get("host") || new URL(request.url).host;
  const xfProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = xfProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
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
        const client = new google.auth.OAuth2(
          requireEnv("GOOGLE_CLIENT_ID"),
          requireEnv("GOOGLE_CLIENT_SECRET"),
          redirectUri(request),
        );
        const authUrl = client.generateAuthUrl({
          access_type: "offline",
          prompt: "consent",
          scope: SCOPES,
        });
        return Response.redirect(authUrl, 302);
      },
    },
  },
});

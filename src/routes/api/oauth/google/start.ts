import { createFileRoute } from "@tanstack/react-router";
import { google } from "googleapis";

import { getEnv, loadEnv, requireEnv } from "../../../../server/env/loadEnv";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
];

function redirectUri(request: Request): string {
  loadEnv({ force: true });
  const configured = getEnv("GOOGLE_REDIRECT_URI");
  if (configured) return configured;
  const url = new URL(request.url);
  return `${url.origin}/api/oauth/google/callback`;
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

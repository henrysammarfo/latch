import { google } from "googleapis";

import type { ConnectorResult } from "../domain/types";
import { getEnv, getRuntimeConfig, requireEnv } from "../env/loadEnv";

function oauthClient() {
  const client = new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
  );
  client.setCredentials({ refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN") });
  return client;
}

export async function upsertSheetsRow(input: {
  playId: string;
  accountName: string;
  arrAtRiskUsd: number;
  status: string;
}): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: `dry_run: would upsert sheet ${input.playId}` };
  }
  const spreadsheetId = requireEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const sheets = google.sheets({ version: "v4", auth: oauthClient() });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Risk!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        input.playId,
        input.accountName,
        String(input.arrAtRiskUsd),
        input.status,
        new Date().toISOString(),
      ]],
    },
  });
  const updatedRange = res.data.updates?.updatedRange ?? null;
  if (!updatedRange) {
    return { ok: false, externalId: null, dryRun: false, detail: "sheets_missing_updatedRange" };
  }
  return { ok: true, externalId: updatedRange, dryRun: false, detail: "sheet row upserted" };
}

export async function compensateSheets(updatedRange: string | null, playId: string): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would mark sheet FAILED_SAVE" };
  }
  const spreadsheetId = requireEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const sheets = google.sheets({ version: "v4", auth: oauthClient() });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Risk!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[playId, "compensate", "0", `FAILED_SAVE:${updatedRange ?? "none"}`, new Date().toISOString()]],
    },
  });
  const range = res.data.updates?.updatedRange ?? null;
  return {
    ok: Boolean(range),
    externalId: range,
    dryRun: false,
    detail: range ? "sheet compensated" : "sheets_compensate_failed",
  };
}

export async function createCalendarHold(input: {
  playId: string;
  accountName: string;
}): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would create calendar hold" };
  }
  const calendar = google.calendar({ version: "v3", auth: oauthClient() });
  const calendarId = getEnv("GOOGLE_CALENDAR_ID", "primary");
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `LATCH save call — ${input.accountName}`,
      description: `Play ${input.playId}. CSM hold.`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });
  const id = res.data.id ?? null;
  if (!id) return { ok: false, externalId: null, dryRun: false, detail: "calendar_missing_id" };
  return { ok: true, externalId: id, dryRun: false, detail: "calendar hold created" };
}

export async function compensateCalendar(eventId: string | null): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would delete calendar hold" };
  }
  if (!eventId) return { ok: true, externalId: null, dryRun: false, detail: "no calendar event" };
  const calendar = google.calendar({ version: "v3", auth: oauthClient() });
  await calendar.events.delete({
    calendarId: getEnv("GOOGLE_CALENDAR_ID", "primary"),
    eventId,
  });
  return { ok: true, externalId: eventId, dryRun: false, detail: "calendar hold deleted" };
}

export async function createGmailDraft(input: {
  playId: string;
  accountName: string;
  reason: string;
}): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would create Gmail DRAFT only" };
  }
  const gmail = google.gmail({ version: "v1", auth: oauthClient() });
  const subject = `Save outreach draft — ${input.accountName}`;
  const body = [
    "CSM draft only — LATCH never auto-sends.",
    "",
    `Play: ${input.playId}`,
    `Account: ${input.accountName}`,
    `Risk: ${input.reason}`,
  ].join("\n");
  const raw = Buffer.from(
    `To: csm@example.com\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`,
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });
  const id = res.data.id ?? null;
  if (!id) return { ok: false, externalId: null, dryRun: false, detail: "gmail_draft_missing_id" };
  return { ok: true, externalId: id, dryRun: false, detail: "gmail draft created (not sent)" };
}

export async function compensateGmail(draftId: string | null): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would trash gmail draft" };
  }
  if (!draftId) return { ok: true, externalId: null, dryRun: false, detail: "no gmail draft" };
  const gmail = google.gmail({ version: "v1", auth: oauthClient() });
  await gmail.users.drafts.delete({ userId: "me", id: draftId });
  return { ok: true, externalId: draftId, dryRun: false, detail: "gmail draft trashed" };
}

export function googleConfigured(): boolean {
  return Boolean(
    getEnv("GOOGLE_CLIENT_ID") &&
      getEnv("GOOGLE_CLIENT_SECRET") &&
      getEnv("GOOGLE_REFRESH_TOKEN") &&
      getEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
  );
}

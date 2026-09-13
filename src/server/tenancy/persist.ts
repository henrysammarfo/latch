import { google } from "googleapis";
import { getEnv } from "../env/loadEnv";
import type { TenantSnapshot } from "./types";

export type { TenantSnapshot };

function oauthClient() {
  const id = getEnv("GOOGLE_CLIENT_ID");
  const secret = getEnv("GOOGLE_CLIENT_SECRET");
  const refresh = getEnv("GOOGLE_REFRESH_TOKEN");
  if (!id || !secret || !refresh) return null;
  const client = new google.auth.OAuth2(id, secret);
  client.setCredentials({ refresh_token: refresh });
  return client;
}

function spreadsheetId() {
  return getEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
}

const TAB = "Tenants";

async function ensureTenantsTab(sheets: ReturnType<typeof google.sheets>, sid: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid });
  const exists = (meta.data.sheets || []).some((s) => s.properties?.title === TAB);
  if (exists) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    requestBody: {
      requests: [{ addSheet: { properties: { title: TAB } } }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: `${TAB}!A1:B1`,
    valueInputOption: "RAW",
    requestBody: { values: [["email", "snapshot_json"]] },
  });
}

/** Persist one tenant snapshot keyed by email. Best-effort — never throws to callers. */
export async function persistTenantSnapshot(snapshot: TenantSnapshot): Promise<boolean> {
  try {
    const auth = oauthClient();
    const sid = spreadsheetId();
    if (!auth || !sid) return false;
    const sheets = google.sheets({ version: "v4", auth });
    await ensureTenantsTab(sheets, sid);
    const email = snapshot.user.email.toLowerCase();
    const json = JSON.stringify(snapshot);
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: `${TAB}!A:B`,
    });
    const rows = existing.data.values || [];
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i]?.[0] || "").toString().toLowerCase() === email) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid,
        range: `${TAB}!A${rowIndex}:B${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values: [[email, json]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sid,
        range: `${TAB}!A:B`,
        valueInputOption: "RAW",
        requestBody: { values: [[email, json]] },
      });
    }
    return true;
  } catch (e) {
    console.error("[tenancy.persist] failed", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function loadTenantSnapshotByEmail(emailRaw: string): Promise<TenantSnapshot | null> {
  try {
    const auth = oauthClient();
    const sid = spreadsheetId();
    if (!auth || !sid) return null;
    const sheets = google.sheets({ version: "v4", auth });
    await ensureTenantsTab(sheets, sid);
    const email = emailRaw.trim().toLowerCase();
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: `${TAB}!A:B`,
    });
    const rows = existing.data.values || [];
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = (rows[i]?.[0] || "").toString().toLowerCase();
      if (rowEmail !== email) continue;
      const raw = (rows[i]?.[1] || "").toString();
      if (!raw) return null;
      return JSON.parse(raw) as TenantSnapshot;
    }
    return null;
  } catch (e) {
    console.error("[tenancy.load] failed", e instanceof Error ? e.message : e);
    return null;
  }
}

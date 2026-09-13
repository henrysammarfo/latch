import type { ConnectorHealth, PlayRun } from "../domain/types";
import { firstEnv, getEnv, getRuntimeConfig, loadEnv } from "../env/loadEnv";

const g = globalThis as unknown as { __latchPlays?: Map<string, PlayRun> };

function store(): Map<string, PlayRun> {
  if (!g.__latchPlays) g.__latchPlays = new Map();
  return g.__latchPlays;
}

export function savePlay(run: PlayRun): PlayRun {
  store().set(run.id, run);
  store().set(`idem:${run.policy.idempotencyKey}`, run);
  return run;
}

export function getPlay(id: string): PlayRun | undefined {
  return store().get(id);
}

export function getPlayByIdempotency(key: string): PlayRun | undefined {
  return store().get(`idem:${key}`);
}

export function listPlays(): PlayRun[] {
  const seen = new Set<string>();
  const out: PlayRun[] = [];
  for (const [k, v] of store()) {
    if (k.startsWith("idem:")) continue;
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    out.push(v);
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function connectorStatus(): {
  mode: string;
  killSwitch: boolean;
  connectors: ConnectorHealth[];
} {
  loadEnv();
  const rt = getRuntimeConfig();
  const slack = Boolean(getEnv("SLACK_BOT_TOKEN") && getEnv("SLACK_CS_CHANNEL_ID"));
  const google = Boolean(
    getEnv("GOOGLE_CLIENT_ID") &&
      getEnv("GOOGLE_CLIENT_SECRET") &&
      getEnv("GOOGLE_REFRESH_TOKEN") &&
      getEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
  );
  const stripe = Boolean(getEnv("STRIPE_SECRET_KEY") && getEnv("STRIPE_WEBHOOK_SECRET"));
  const llm = Boolean(firstEnv("AGENTROUTER_API_KEY", "AGENT_ROUTER_API_KEY"));
  return {
    mode: rt.mode,
    killSwitch: rt.killSwitch,
    connectors: [
      {
        name: "Slack",
        configured: slack,
        liveReady: slack && rt.mode === "live",
        detail: slack ? "token+channel present" : "Set SLACK_BOT_TOKEN + SLACK_CS_CHANNEL_ID",
      },
      {
        name: "Google (Gmail/Sheets/Calendar)",
        configured: google,
        liveReady: google && rt.mode === "live",
        detail: google ? "oauth+sheet present" : "Complete Google OAuth runbook",
      },
      {
        name: "Stripe",
        configured: stripe,
        liveReady: stripe && rt.mode === "live",
        detail: stripe ? "secret+webhook present" : "Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET",
      },
      {
        name: "AgentRouter LLM",
        configured: llm,
        liveReady: llm,
        detail: llm ? "key present (Tor required on Cursor Cloud)" : "Set AGENTROUTER_API_KEY",
      },
    ],
  };
}


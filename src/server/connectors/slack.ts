import type { ConnectorResult } from "../domain/types";
import { getEnv, getRuntimeConfig, requireEnv } from "../env/loadEnv";

export async function postSlackAlert(input: {
  playId: string;
  accountName: string;
  arrAtRiskUsd: number;
  reason: string;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return {
      ok: true,
      externalId: null,
      dryRun: true,
      detail: `dry_run: would post CS alert for ${input.accountName}`,
    };
  }
  const token = requireEnv("SLACK_BOT_TOKEN");
  const channel = requireEnv("SLACK_CS_CHANNEL_ID");
  const text = [
    `*LATCH save play* \`${input.playId}\``,
    `Account: *${input.accountName}*`,
    `ARR at risk: $${input.arrAtRiskUsd}`,
    `Reason: ${input.reason}`,
    `Idempotency: \`${input.idempotencyKey.slice(0, 12)}…\``,
  ].join("\n");
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text, unfurl_links: false }),
  });
  const json = (await res.json()) as { ok: boolean; ts?: string; error?: string };
  if (!json.ok || !json.ts) {
    return { ok: false, externalId: null, dryRun: false, detail: `slack_error:${json.error ?? res.status}` };
  }
  return { ok: true, externalId: json.ts, dryRun: false, detail: "slack message posted" };
}

export async function compensateSlack(messageTs: string | null): Promise<ConnectorResult> {
  const rt = getRuntimeConfig();
  if (rt.mode === "dry_run") {
    return { ok: true, externalId: null, dryRun: true, detail: "dry_run: would mark Slack UNLATCHED" };
  }
  if (!messageTs) return { ok: true, externalId: null, dryRun: false, detail: "no slack ts" };
  const token = requireEnv("SLACK_BOT_TOKEN");
  const channel = requireEnv("SLACK_CS_CHANNEL_ID");
  const res = await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      ts: messageTs,
      text: `LATCH *UNLATCHED* — compensated (ts ${messageTs})`,
    }),
  });
  const json = (await res.json()) as { ok: boolean; error?: string };
  if (!json.ok) {
    return { ok: false, externalId: messageTs, dryRun: false, detail: `slack_compensate_error:${json.error}` };
  }
  return { ok: true, externalId: messageTs, dryRun: false, detail: "slack compensated" };
}

export function slackConfigured(): boolean {
  return Boolean(getEnv("SLACK_BOT_TOKEN") && getEnv("SLACK_CS_CHANNEL_ID"));
}

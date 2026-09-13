import { createHash, randomUUID } from "node:crypto";

import type { EvidencePack, PolicyDecision, TriggerKind } from "../domain/types";
import { getEnv, getRuntimeConfig } from "../env/loadEnv";
import { draftRiskReason } from "../llm/agentRouter";

export function idempotencyKeyFor(triggerId: string): string {
  return createHash("sha256").update(triggerId).digest("hex");
}

export function compileEvidence(input: {
  triggerId: string;
  triggerKind: TriggerKind;
  accountName: string;
  accountId?: string;
  arrAtRiskUsd: number;
  signalSummary: string;
  rawRef?: string;
}): EvidencePack {
  if (!input.triggerId.trim()) throw new Error("LATCH_RISK_INVALID: triggerId");
  if (!input.accountName.trim()) throw new Error("LATCH_RISK_INVALID: accountName");
  if (!(input.arrAtRiskUsd >= 0)) throw new Error("LATCH_RISK_INVALID: arrAtRiskUsd");
  const evidence: EvidencePack = {
    triggerId: input.triggerId,
    triggerKind: input.triggerKind,
    accountName: input.accountName,
    accountId:
      input.accountId ??
      `acct_${createHash("sha1").update(input.accountName).digest("hex").slice(0, 10)}`,
    arrAtRiskUsd: Math.round(input.arrAtRiskUsd),
    signalSummary: input.signalSummary,
    receivedAt: new Date().toISOString(),
  };
  if (input.rawRef) evidence.rawRef = input.rawRef;
  return evidence;
}

export function decidePolicy(evidence: EvidencePack): PolicyDecision {
  const rt = getRuntimeConfig();
  const key = idempotencyKeyFor(evidence.triggerId);
  if (rt.killSwitch) {
    return {
      allow: false,
      mode: rt.mode,
      reason: "Kill switch enabled (LATCH_KILL_SWITCH=true)",
      idempotencyKey: key,
      requiresHuman: true,
    };
  }
  const requiresHuman = evidence.arrAtRiskUsd > rt.maxArrAuto;
  return {
    allow: true,
    mode: rt.mode,
    reason: requiresHuman
      ? `ARR ${evidence.arrAtRiskUsd} exceeds auto max ${rt.maxArrAuto} — human gate`
      : "Within auto policy",
    idempotencyKey: key,
    requiresHuman,
  };
}

export async function compileRisk(evidence: EvidencePack): Promise<{
  evidence: EvidencePack;
  policy: PolicyDecision;
  draftReason: string;
}> {
  const policy = decidePolicy(evidence);
  const deterministic = `${evidence.accountName}: ${evidence.signalSummary} (ARR at risk $${evidence.arrAtRiskUsd}).`;
  if (!policy.allow) return { evidence, policy, draftReason: policy.reason };
  if (getEnv("LATCH_LLM_DRAFT", "false") !== "true") {
    return { evidence, policy, draftReason: deterministic };
  }
  const drafted = await draftRiskReason({
    accountName: evidence.accountName,
    arrAtRiskUsd: evidence.arrAtRiskUsd,
    signalSummary: evidence.signalSummary,
  });
  return { evidence, policy, draftReason: drafted };
}

export function newPlayId(): string {
  return `play_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function fixtureCancelEvidence(): EvidencePack {
  return compileEvidence({
    triggerId: "fixture_gmail_cancel_champion_gone",
    triggerKind: "fixture",
    accountName: "Northwind Labs",
    arrAtRiskUsd: 2400,
    signalSummary: "Cancellation language in renewal thread — champion left",
    rawRef: "fixtures/gmail/cancel_champion_gone.eml",
  });
}


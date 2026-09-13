export type LatchState = "RUNNING" | "LATCHED" | "UNLATCHED";
export type TriggerKind = "gmail" | "stripe" | "fixture" | "manual";
export type RunMode = "dry_run" | "live";

export type EvidencePack = {
  triggerId: string;
  triggerKind: TriggerKind;
  accountName: string;
  accountId: string;
  arrAtRiskUsd: number;
  signalSummary: string;
  rawRef?: string;
  receivedAt: string;
};

export type PolicyDecision = {
  allow: boolean;
  mode: RunMode;
  reason: string;
  idempotencyKey: string;
  requiresHuman: boolean;
};

export type StepName =
  | "slack_alert"
  | "sheets_upsert"
  | "calendar_hold"
  | "gmail_draft"
  | "compensate_slack"
  | "compensate_sheets"
  | "compensate_calendar"
  | "compensate_gmail";

export type StepTrace = {
  name: StepName;
  status: "ok" | "failed" | "skipped" | "compensated";
  externalId: string | null;
  dryRun: boolean;
  ms: number;
  error?: string;
  at: string;
};

export type AssertResult = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PlayRun = {
  id: string;
  evidence: EvidencePack;
  policy: PolicyDecision;
  state: LatchState;
  draftReason: string;
  steps: StepTrace[];
  assertResults: AssertResult[];
  greenCount: number;
  assertTotal: number;
  createdAt: string;
  updatedAt: string;
  notes: string[];
  injectFail?: StepName | null;
};

export type ConnectorResult = {
  ok: boolean;
  externalId: string | null;
  dryRun: boolean;
  detail: string;
};

export type ConnectorHealth = {
  name: string;
  configured: boolean;
  liveReady: boolean;
  detail: string;
};

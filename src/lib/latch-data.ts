/**
 * Demo dataset for the LATCH console. Static fixtures so the demo is
 * deterministic — no backend calls, no fabricated live IDs beyond these.
 */

export type StepStatus = "pass" | "fail" | "skipped";

export type PlayStep = {
  app: string;
  action: string;
  assert: string;
  id: string | null;
  status: StepStatus;
  ms: number;
};

export type SavePlay = {
  id: string;
  account: string;
  plan: string;
  mrr: number;
  trigger: "gmail" | "stripe";
  reason: string;
  state: "LATCHED" | "UNLATCHED" | "RUNNING";
  createdAt: string;
  owner: string;
  steps: PlayStep[];
  notes: string[];
};

export const PLAYS: SavePlay[] = [
  {
    id: "play_8fa21c",
    account: "Northwind Labs",
    plan: "Scale",
    mrr: 2400,
    trigger: "gmail",
    reason: "Cancellation language in renewal thread — champion left",
    state: "LATCHED",
    createdAt: "2026-09-13T15:41:00Z",
    owner: "CSM · Henry",
    steps: [
      { app: "Gmail", action: "risk mail parsed", assert: "message.id", id: "18f2c9ab41", status: "pass", ms: 412 },
      { app: "Slack", action: "#cs alert posted", assert: "slack.message_ts", id: "1757783102.418", status: "pass", ms: 268 },
      { app: "Sheets", action: "risk row OPEN_SAVE", assert: "sheets.updatedRange", id: "Risk!A42:H42", status: "pass", ms: 331 },
      { app: "Calendar", action: "save-call hold", assert: "calendar.eventId", id: "e7t3k9pl1m", status: "pass", ms: 297 },
      { app: "Gmail", action: "save draft (no send)", assert: "no silent customer send", id: "draft_9a1f", status: "pass", ms: 190 },
    ],
    notes: ["Outbound left in DRAFTS — CSM owns the send."],
  },
  {
    id: "play_7bd004",
    account: "Halcyon Retail",
    plan: "Growth",
    mrr: 990,
    trigger: "stripe",
    reason: "invoice.payment_failed → subscription past_due (2nd cycle)",
    state: "UNLATCHED",
    createdAt: "2026-09-13T15:12:00Z",
    owner: "CSM · Ama",
    steps: [
      { app: "Stripe", action: "webhook verified", assert: "event.id", id: "evt_1PxT9k", status: "pass", ms: 121 },
      { app: "Slack", action: "#cs alert posted", assert: "slack.message_ts", id: null, status: "fail", ms: 1804 },
      { app: "Sheets", action: "compensating row", assert: "sheets.updatedRange", id: "Risk!A41:H41", status: "pass", ms: 355 },
      { app: "Calendar", action: "save-call hold", assert: "calendar.eventId", id: null, status: "skipped", ms: 0 },
      { app: "Gmail", action: "save draft (no send)", assert: "no silent customer send", id: null, status: "skipped", ms: 0 },
    ],
    notes: [
      "Slack token revoked → invalid_auth after 3 retries.",
      "Wrote FAILED_NOTIFY compensating row; downstream steps halted (fail-closed).",
    ],
  },
  {
    id: "play_6c9e77",
    account: "Terrace Analytics",
    plan: "Scale",
    mrr: 3100,
    trigger: "gmail",
    reason: "Downgrade request + usage drop 62% WoW",
    state: "LATCHED",
    createdAt: "2026-09-13T14:03:00Z",
    owner: "CSM · Henry",
    steps: [
      { app: "Gmail", action: "risk mail parsed", assert: "message.id", id: "18f2b71c09", status: "pass", ms: 388 },
      { app: "Slack", action: "#cs alert posted", assert: "slack.message_ts", id: "1757776981.902", status: "pass", ms: 240 },
      { app: "Sheets", action: "risk row OPEN_SAVE", assert: "sheets.updatedRange", id: "Risk!A40:H40", status: "pass", ms: 318 },
      { app: "Calendar", action: "save-call hold", assert: "calendar.eventId", id: "c2m8vv0qra", status: "pass", ms: 262 },
      { app: "Gmail", action: "save draft (no send)", assert: "no silent customer send", id: "draft_71bc", status: "pass", ms: 176 },
    ],
    notes: [],
  },
  {
    id: "play_5a1b20",
    account: "Fernwood Health",
    plan: "Growth",
    mrr: 1450,
    trigger: "stripe",
    reason: "customer.subscription.deleted (cancel at period end)",
    state: "LATCHED",
    createdAt: "2026-09-13T11:47:00Z",
    owner: "CSM · Ama",
    steps: [
      { app: "Stripe", action: "webhook verified", assert: "event.id", id: "evt_1PxQ2b", status: "pass", ms: 108 },
      { app: "Slack", action: "#cs alert posted", assert: "slack.message_ts", id: "1757761642.117", status: "pass", ms: 231 },
      { app: "Sheets", action: "risk row OPEN_SAVE", assert: "sheets.updatedRange", id: "Risk!A39:H39", status: "pass", ms: 304 },
      { app: "Calendar", action: "save-call hold", assert: "calendar.eventId", id: "k91zpq44dn", status: "pass", ms: 288 },
      { app: "Gmail", action: "save draft (no send)", assert: "no silent customer send", id: "draft_5512", status: "pass", ms: 168 },
    ],
    notes: [],
  },
];

export type GoldenJob = {
  id: string;
  name: string;
  fixture: string;
  asserts: number;
  passed: number;
  expected: "GREEN" | "RED";
  result: "GREEN" | "RED";
};

export const GOLDEN: GoldenJob[] = [
  { id: "g01", name: "Cancel email → full latch", fixture: "gmail/cancel_champion_gone.eml", asserts: 5, passed: 5, expected: "GREEN", result: "GREEN" },
  { id: "g02", name: "Stripe past_due → full latch", fixture: "stripe/invoice_payment_failed.json", asserts: 5, passed: 5, expected: "GREEN", result: "GREEN" },
  { id: "g03", name: "Slack token revoked → UNLATCHED", fixture: "inject/slack_invalid_auth.json", asserts: 5, passed: 2, expected: "RED", result: "RED" },
  { id: "g04", name: "Sheets 429 → retry then pass", fixture: "inject/sheets_rate_limit.json", asserts: 5, passed: 5, expected: "GREEN", result: "GREEN" },
  { id: "g05", name: "Calendar conflict → hold rescheduled", fixture: "calendar/conflict_window.json", asserts: 5, passed: 5, expected: "GREEN", result: "GREEN" },
  { id: "g06", name: "Ambiguous mail → no side effects", fixture: "gmail/pricing_question.eml", asserts: 3, passed: 3, expected: "GREEN", result: "GREEN" },
  { id: "g07", name: "Draft-only guard (never sends)", fixture: "guard/outbound_send_attempt.json", asserts: 4, passed: 4, expected: "GREEN", result: "GREEN" },
  { id: "g08", name: "Deletion test → account purged", fixture: "privacy/delete_account.json", asserts: 4, passed: 4, expected: "GREEN", result: "GREEN" },
];

export const APPS = [
  { name: "Gmail", role: "Risk signal in · save draft out (never sends)", scope: "gmail.readonly · gmail.compose", status: "connected" as const },
  { name: "Slack", role: "#cs alert · stores message_ts as proof", scope: "chat:write · channels:read", status: "connected" as const },
  { name: "Google Sheets", role: "Risk ledger · OPEN_SAVE / FAILED_* rows", scope: "spreadsheets", status: "connected" as const },
  { name: "Google Calendar", role: "Save-call hold on the owner's calendar", scope: "calendar.events", status: "connected" as const },
  { name: "Stripe (test)", role: "Second trigger path · signed webhooks", scope: "webhook endpoint", status: "connected" as const },
  { name: "HubSpot", role: "Risk record instead of Sheets ledger", scope: "crm.objects.write", status: "planned" as const },
  { name: "Intercom", role: "Conversation-level churn signal", scope: "read_conversations", status: "planned" as const },
];

export const TICKER = [
  "Fail-closed",
  "Side-effect asserts",
  "Golden jobs",
  "Churn-save",
  "Audit trail",
  "Force-fail",
];

export const TRUSTED = ["Slack", "Stripe", "Gmail", "Sheets", "Calendar", "HubSpot", "Intercom", "Linear"];

export const NAV = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/plans", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/diagrams", label: "Diagrams" },
] as const;

export function passRate() {
  const green = GOLDEN.filter((g) => g.result === g.expected).length;
  return Math.round((green / GOLDEN.length) * 100);
}

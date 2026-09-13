import type { EvidencePack, PlayRun, StepName, StepTrace } from "../domain/types";
import {
  compensateCalendar,
  compensateGmail,
  compensateSheets,
  createCalendarHold,
  createGmailDraft,
  upsertSheetsRow,
} from "../connectors/google";
import { compensateSlack, postSlackAlert } from "../connectors/slack";
import { getRuntimeConfig } from "../env/loadEnv";
import {
  compileRisk,
  fixtureCancelEvidence,
  newPlayId,
} from "../risk/compiler";
import { getPlayByIdempotency, savePlay } from "../store/plays";
import { evaluatePlay } from "../eval/runner";

function iso(): string {
  return new Date().toISOString();
}

function step(
  name: StepName,
  status: StepTrace["status"],
  externalId: string | null,
  dryRun: boolean,
  ms: number,
  error?: string,
): StepTrace {
  const trace: StepTrace = { name, status, externalId, dryRun, ms, at: iso() };
  if (error) trace.error = error;
  return trace;
}

async function compensate(
  play: PlayRun,
  ids: {
    slackTs: string | null;
    sheetRange: string | null;
    calId: string | null;
    draftId: string | null;
  },
): Promise<void> {
  let t = Date.now();
  const s = await compensateSlack(ids.slackTs);
  play.steps.push(step("compensate_slack", s.ok ? "compensated" : "failed", s.externalId, s.dryRun, Date.now() - t, s.ok ? undefined : s.detail));

  t = Date.now();
  const sh = await compensateSheets(ids.sheetRange, play.id);
  play.steps.push(step("compensate_sheets", sh.ok ? "compensated" : "failed", sh.externalId, sh.dryRun, Date.now() - t, sh.ok ? undefined : sh.detail));

  t = Date.now();
  const c = await compensateCalendar(ids.calId);
  play.steps.push(step("compensate_calendar", c.ok ? "compensated" : "failed", c.externalId, c.dryRun, Date.now() - t, c.ok ? undefined : c.detail));

  t = Date.now();
  const g = await compensateGmail(ids.draftId);
  play.steps.push(step("compensate_gmail", g.ok ? "compensated" : "failed", g.externalId, g.dryRun, Date.now() - t, g.ok ? undefined : g.detail));
}

export async function runSavePlay(input?: {
  evidence?: EvidencePack;
  injectFail?: StepName | null;
  forceNew?: boolean;
}): Promise<PlayRun> {
  const evidence = input?.evidence ?? fixtureCancelEvidence();
  const { policy, draftReason } = await compileRisk(evidence);

  if (!input?.forceNew) {
    const existing = getPlayByIdempotency(policy.idempotencyKey);
    if (existing && existing.state !== "RUNNING") {
      existing.notes.push("idempotent replay — returning prior play");
      existing.updatedAt = iso();
      return savePlay(existing);
    }
  }

  const play: PlayRun = {
    id: newPlayId(),
    evidence,
    policy,
    state: "RUNNING",
    draftReason,
    steps: [],
    assertResults: [],
    greenCount: 0,
    assertTotal: 0,
    createdAt: iso(),
    updatedAt: iso(),
    notes: [],
    injectFail: input?.injectFail ?? null,
  };
  savePlay(play);

  if (!policy.allow) {
    play.state = "UNLATCHED";
    play.notes.push(policy.reason);
    play.updatedAt = iso();
    return savePlay(evaluatePlay(play));
  }

  const ids = {
    slackTs: null as string | null,
    sheetRange: null as string | null,
    calId: null as string | null,
    draftId: null as string | null,
  };

  // Slack
  {
    const t0 = Date.now();
    if (play.injectFail === "slack_alert") {
      play.steps.push(step("slack_alert", "failed", null, false, Date.now() - t0, "injected_fail"));
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Injected Slack failure — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    const r = await postSlackAlert({
      playId: play.id,
      accountName: evidence.accountName,
      arrAtRiskUsd: evidence.arrAtRiskUsd,
      reason: draftReason,
      idempotencyKey: policy.idempotencyKey,
    });
    play.steps.push(step("slack_alert", r.ok ? "ok" : "failed", r.externalId, r.dryRun, Date.now() - t0, r.ok ? undefined : r.detail));
    if (!r.ok) {
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Slack failed — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    ids.slackTs = r.externalId;
  }

  // Sheets
  {
    const t0 = Date.now();
    if (play.injectFail === "sheets_upsert") {
      play.steps.push(step("sheets_upsert", "failed", null, false, Date.now() - t0, "injected_fail"));
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Injected Sheets failure — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    const r = await upsertSheetsRow({
      playId: play.id,
      accountName: evidence.accountName,
      arrAtRiskUsd: evidence.arrAtRiskUsd,
      status: "OPEN_SAVE",
    });
    play.steps.push(step("sheets_upsert", r.ok ? "ok" : "failed", r.externalId, r.dryRun, Date.now() - t0, r.ok ? undefined : r.detail));
    if (!r.ok) {
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Sheets failed — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    ids.sheetRange = r.externalId;
  }

  // Calendar
  {
    const t0 = Date.now();
    if (play.injectFail === "calendar_hold") {
      play.steps.push(step("calendar_hold", "failed", null, false, Date.now() - t0, "injected_fail"));
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Injected Calendar failure — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    const r = await createCalendarHold({ playId: play.id, accountName: evidence.accountName });
    play.steps.push(step("calendar_hold", r.ok ? "ok" : "failed", r.externalId, r.dryRun, Date.now() - t0, r.ok ? undefined : r.detail));
    if (!r.ok) {
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Calendar failed — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    ids.calId = r.externalId;
  }

  // Gmail draft
  {
    const t0 = Date.now();
    if (play.injectFail === "gmail_draft") {
      play.steps.push(step("gmail_draft", "failed", null, false, Date.now() - t0, "injected_fail"));
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Injected Gmail draft failure — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    const r = await createGmailDraft({
      playId: play.id,
      accountName: evidence.accountName,
      reason: draftReason,
    });
    play.steps.push(step("gmail_draft", r.ok ? "ok" : "failed", r.externalId, r.dryRun, Date.now() - t0, r.ok ? undefined : r.detail));
    if (!r.ok) {
      await compensate(play, ids);
      play.state = "UNLATCHED";
      play.notes.push("Gmail draft failed — compensated");
      play.updatedAt = iso();
      return savePlay(evaluatePlay(play));
    }
    ids.draftId = r.externalId;
  }

  const mode = getRuntimeConfig().mode;
  play.state = "LATCHED";
  play.notes.push(
    mode === "dry_run"
      ? "DRY_RUN LATCHED — structured path ok; no live side-effect IDs claimed"
      : "LIVE LATCHED — external IDs recorded for all forward steps",
  );
  play.updatedAt = iso();
  return savePlay(evaluatePlay(play));
}

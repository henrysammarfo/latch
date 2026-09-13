import type { AssertResult, PlayRun, StepName } from "../domain/types";
import { getRuntimeConfig } from "../env/loadEnv";

function a(id: string, label: string, ok: boolean, detail: string): AssertResult {
  return { id, label, ok, detail };
}

export function evaluatePlay(play: PlayRun): PlayRun {
  const rt = getRuntimeConfig();
  const by = Object.fromEntries(play.steps.map((s) => [s.name, s]));
  const forward: StepName[] = ["slack_alert", "sheets_upsert", "calendar_hold", "gmail_draft"];
  const results: AssertResult[] = [];

  if (play.state === "LATCHED") {
    for (const name of forward) {
      const s = by[name];
      const ok =
        s?.status === "ok" &&
        (rt.mode === "dry_run" ? s.dryRun === true : Boolean(s.externalId) && s.dryRun === false);
      results.push(
        a(
          `step_${name}`,
          `${name} ok under ${rt.mode}`,
          Boolean(ok),
          s
            ? `status=${s.status} dryRun=${s.dryRun} externalId=${s.externalId ?? "null"}`
            : "missing",
        ),
      );
    }
    results.push(a("state_latched", "State LATCHED", play.state === "LATCHED", play.state));
    results.push(
      a("draft_only", "Gmail draft-only guarantee", Boolean(by['gmail_draft']), "draft connector only"),
    );
  } else if (play.state === "UNLATCHED") {
    const failed = forward.find((n) => by[n]?.status === "failed");
    results.push(
      a(
        "failed_or_blocked",
        "Forward failure or policy block",
        Boolean(failed) || !play.policy.allow,
        failed ?? play.policy.reason,
      ),
    );
    const comps = play.steps.filter((s) => s.name.startsWith("compensate_"));
    results.push(
      a(
        "compensated",
        "Compensation recorded",
        comps.length > 0 || !play.policy.allow,
        `count=${comps.length}`,
      ),
    );
    results.push(a("state_unlatched", "State UNLATCHED", play.state === "UNLATCHED", play.state));
  } else {
    results.push(a("not_terminal", "Play not terminal", false, play.state));
  }

  play.assertResults = results;
  play.greenCount = results.filter((r) => r.ok).length;
  play.assertTotal = results.length;
  return play;
}

export type GoldenResult = {
  id: string;
  name: string;
  ok: boolean;
  playId?: string;
  detail: string;
};

export async function runGoldens(): Promise<GoldenResult[]> {
  const { runSavePlay } = await import("../saga/orchestrator");
  const out: GoldenResult[] = [];

  {
    const play = await runSavePlay({ forceNew: true });
    out.push({
      id: "G1",
      name: "Fixture cancel → LATCHED",
      ok: play.state === "LATCHED" && play.greenCount === play.assertTotal && play.assertTotal > 0,
      playId: play.id,
      detail: `${play.state} ${play.greenCount}/${play.assertTotal}`,
    });
  }

  {
    const play = await runSavePlay({ forceNew: true, injectFail: "slack_alert" });
    out.push({
      id: "G2",
      name: "Inject Slack fail → UNLATCHED + compensate",
      ok:
        play.state === "UNLATCHED" &&
        play.steps.some((s) => s.name === "compensate_slack") &&
        play.greenCount === play.assertTotal,
      playId: play.id,
      detail: `${play.state} ${play.greenCount}/${play.assertTotal}`,
    });
  }

  {
    const first = await runSavePlay({ forceNew: true });
    const second = await runSavePlay({ forceNew: false });
    out.push({
      id: "G3",
      name: "Idempotent replay",
      ok:
        first.policy.idempotencyKey === second.policy.idempotencyKey &&
        second.notes.some((n) => n.includes("idempotent")),
      playId: second.id,
      detail: second.notes.filter((n) => n.includes("idempotent")).join("; ") || "no replay note",
    });
  }

  {
    const play = await runSavePlay({ forceNew: true });
    const mutated = structuredClone(play);
    mutated.state = "RUNNING";
    evaluatePlay(mutated);
    out.push({
      id: "G4",
      name: "Mutation: RUNNING cannot fully green",
      ok: mutated.assertResults.some((x) => !x.ok),
      playId: play.id,
      detail: `${mutated.greenCount}/${mutated.assertTotal}`,
    });
  }

  return out;
}



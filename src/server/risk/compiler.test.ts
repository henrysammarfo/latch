import { describe, expect, it } from "vitest";

import { compileEvidence, decidePolicy, idempotencyKeyFor } from "./compiler";

describe("risk compiler", () => {
  it("is deterministic for the same trigger id", () => {
    const a = idempotencyKeyFor("fixture_gmail_cancel_champion_gone");
    const b = idempotencyKeyFor("fixture_gmail_cancel_champion_gone");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("compiles evidence and allows within auto max", () => {
    const evidence = compileEvidence({
      triggerId: "t1",
      triggerKind: "fixture",
      accountName: "Acme",
      arrAtRiskUsd: 1200,
      signalSummary: "cancel language",
    });
    const policy = decidePolicy(evidence);
    expect(policy.allow).toBe(true);
    expect(policy.idempotencyKey).toBe(idempotencyKeyFor("t1"));
  });
});

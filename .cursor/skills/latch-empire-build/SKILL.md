---
name: latch-empire-build
description: Build LATCH fail-closed churn-save saga (RiskCompiler, PolicyEngine, Saga+compensate, connectors, eval goldens, live poke UI). Use when implementing LATCH Empire, connectors, eval harness, dashboard, or bible Block 0-6 work.
---

# LATCH Empire Build

## Before code

1. Read `docs/LATCH_BIBLE.md` relevant sections + `memory/CURRENT_STATE.md`.
2. Declare filepath, purpose, deps, consumers.
3. Prefer existing `src/server/**` patterns.

## Build order (bible Blocks)

0. Env contract · OAuth apps · deploy shell · README skeleton  
1. RiskCompiler + PolicyEngine + idempotency  
2. Saga steps + compensation  
3. EvalRunner goldens G1–G4 + mutation  
4. Live UI board + inject-fail + traces  
5. ARR-at-risk from Stripe · Sheets depth  
6. Demo film · reliability fill · submit  

## Architecture

Triggers → RiskCompiler → PolicyEngine → SavePlay Saga (Slack ∥ Sheets → Calendar → Gmail draft) → EvalRunner → GREEN n/n or RED UNLATCHED + compensate.

## Output checklist

- Typed · fail-closed errors · no fake IDs  
- Tests under `src/server/**/*.test.ts` or `scripts/`  
- Update memory MDs  
- Security: validate input, secrets in env, draft-only mail  

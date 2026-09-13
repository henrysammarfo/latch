# LATCH — Current State

**Updated:** 2026-09-13  
**Branch:** `cursor/latch-empire-de86`

## Live now

- Cursor rules (empire core · secrets/AgentRouter · memory discipline)
- Skills (empire-build · live-research · agentrouter-tor)
- Memory MDs + credentials runbook + bible copy at `docs/LATCH_BIBLE.md`
- Server: RiskCompiler · Policy · Saga+compensate · connectors (Slack/Google/Stripe) · eval G1–G4 · in-memory play store
- API: `/api/health`, `/api/latch/run`, `/api/latch/plays`, `/api/latch/goldens`, `/api/public/stripe-webhook`
- UI: `/dashboard` poke board
- Scripts: `smoke:agentrouter`, `eval:goldens`, `test:unit`
- Default mode: **`dry_run`** (fail-closed structured path)

## AgentRouter

- Tor path works; smoke returns **triage C** (`unauthorized_client`) for current key — **mint new AgentRouter API key** then re-smoke.
- LLM draft remains optional (`LATCH_LLM_DRAFT=true` only after smoke ok). Risk asserts stay deterministic.

## Blocked on owner credentials

See `memory/CREDENTIALS_RUNBOOK.md` — Slack bot, Google OAuth+Sheet, Stripe test webhook. Until then live side-effect IDs will not appear (by design).

## Research keys (local .env, gitignored)

- Tavily: wired for FACT_CHECK  
- TinyFish: key validated earlier (COMPLETED run)  
- AgentRouter: requires Tor SOCKS on Cursor Cloud; smoke script provided  

## Security posture

Fail-closed · draft-only Gmail · secrets gitignored · residual risk documented · **not** claiming unhackable.

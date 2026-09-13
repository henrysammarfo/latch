# LATCH — Fail-closed churn-save orchestration

**One sentence:** When a customer looks ready to churn, LATCH runs a fail-closed save play across Slack, Sheets, Calendar, and a Gmail draft — and only greens when every side-effect is proven with an ID (or compensates cleanly and goes `UNLATCHED`).

## Problem

Lean B2B SaaS loses renewals in the gap between a risk signal (cancel mail / Stripe past_due) and a multi-app save. Chat agents claim action. CRM rows appear without proof. Reliability is 25% of this hackathon’s score — LATCH makes it the architecture.

## What LATCH does

1. **RiskCompiler** — normalize Gmail/Stripe/fixture triggers → account, ARR-at-risk, evidence pack  
2. **PolicyEngine** — fail-closed allowlists, kill switch, dry_run vs live, idempotency key = hash(trigger_id)  
3. **SavePlay saga** — Slack alert → Sheets risk row → Calendar hold → Gmail **draft only** (never auto-send)  
4. **Compensation** — on any forward failure, reverse prior steps and mark `UNLATCHED`  
5. **Eval board** — goldens G1–G4 + mutation; GREEN n/n or RED  

Human still owns customer-facing sends (Userlens trust).

## External apps

| App | Role | Status |
| --- | --- | --- |
| Gmail | Trigger + draft-only save email | Live when Google OAuth configured |
| Stripe | Trigger (test webhooks) + ARR-at-risk | Live when Stripe test keys configured |
| Slack | `#cs` alert with run id + proof ts | Live when bot token configured |
| Google Sheets | Risk ledger `OPEN_SAVE` / `FAILED_SAVE` | Live when sheet ID + OAuth configured |
| Google Calendar | Save-call hold | Live when OAuth configured |
| Eval board | Goldens + inject-fail | Always (in-process) |

Minimum for rules = 3 live apps. Empire target = 5 + eval. Until owner completes [memory/CREDENTIALS_RUNBOOK.md](memory/CREDENTIALS_RUNBOOK.md), runtime stays **`dry_run`** (structured, fail-closed — not a mock green).

## Architecture

```
Triggers → RiskCompiler → PolicyEngine → SavePlay Saga
   → Slack ∥ Sheets → Calendar → Gmail draft
   → EvalRunner → LATCHED n/n or UNLATCHED + compensate
```

Primitives judges care about: saga + compensation · idempotent replays · dual dry/live · ARR-at-risk · force-fail eval · full step traces · stranger-deployable poke UI.

## Setup

```bash
cp .env.example .env
# Fill keys per memory/CREDENTIALS_RUNBOOK.md (Slack, Google, Stripe)
# Research keys (Tavily / TinyFish / AgentRouter) optional for local product loop

npm install
npm run dev
```

### AgentRouter (Cursor Cloud)

- Base URL **only** `https://agentrouter.org/v1` (never `co.agentrouter.org`)
- Set `AGENT_ROUTER_HTTP_PROXY=socks5h://127.0.0.1:9050` on Cursor Cloud (Aliyun WAF on direct)
- Do **not** set localhost Tor proxy on Vercel production
- Smoke: `npm run smoke:agentrouter` → `{"ok":true,"model":"deepseek-v4-flash","status":200}` (never prints the key)
- Fail closed: no mock LLM prose

### Stripe webhook

Point Stripe test webhook to `https://<deploy>/api/public/stripe-webhook`  
Events: `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`

## How we tested reliability

| ID | Suite | Expected |
| --- | --- | --- |
| G1 | Fixture cancel → full latch | `LATCHED` + asserts green |
| G2 | Inject Slack fail mid-saga | `UNLATCHED` + compensate |
| G3 | Replay same idempotency key | Prior play returned · no dup path |
| G4 | Mutation (force RUNNING) | Asserts cannot fully green |

```bash
npm run eval:goldens
npm run test:unit
npm run typecheck
npm run build
```

Force-fail from UI: **Dashboard → Inject Slack fail**.

## Demo video

_Link TBD — 2:00 live deploy: fire fixture → IDs on board → inject fail → UNLATCHED → goldens table → repo URL._

## Live deploy / poke

- Marketing: `/`  
- Console: `/dashboard` — Run fixture · Inject Slack fail · Run goldens · traces  
- Health: `GET /api/health`  
- Rate-limit / kill switch: `LATCH_KILL_SWITCH=true` · optional `LATCH_PUBLIC_POKE_TOKEN`

## Prior work honesty

Prior taste: GROUNDS (eval) · AXIS (ship). This product is LATCH — action+proof churn-save, not those codebases.

## Risks (labeled)

| Risk | Label |
| --- | --- |
| OAuth token theft / over-scope | Residual — least privilege; rotate keys pasted in chat |
| Aliyun WAF on AgentRouter without Tor | VERIFIED on Cursor Cloud — Tor SOCKS required |
| Dry-run without live SaaS keys | Expected until owner finishes credentials runbook — board shows mode |
| Not “unhackable” | Honest residual risk; fail-closed ≠ unbreakable |

## License / contact

Henry Sam Marfo · Accra · github.com/henrysammarfo  
Hackathon: Multi-App AI Agent · Lemma × Comma · 2026-09-13

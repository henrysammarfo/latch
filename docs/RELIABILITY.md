# LATCH Reliability

Fail-closed eval is product, not a paragraph.

## Goldens

| ID | Name | Pass criteria |
| --- | --- | --- |
| G1 | Fixture cancel → LATCHED | `state=LATCHED` and `greenCount === assertTotal > 0` |
| G2 | Inject Slack fail | `state=UNLATCHED`, `compensate_slack` present, asserts green for UNLATCHED contract |
| G3 | Idempotent replay | Same `idempotencyKey`, replay note present |
| G4 | Mutation | `RUNNING` play cannot fully green |

Commands:

```bash
npm run eval:goldens
npm run test:unit
```

## Force-fail

- UI: `/dashboard` → **Inject Slack fail**
- API: `POST /api/latch/run` with `{ "injectFail": "slack_alert", "forceNew": true }`

## Modes

- `LATCH_MODE=dry_run` (default): connectors return structured dry-run results (`dryRun:true`, no fake live IDs). Asserts require dry-run semantics.
- `LATCH_MODE=live`: connectors call real APIs; missing credentials fail closed; asserts require real external IDs.

## Kill switch

`LATCH_KILL_SWITCH=true` → policy denies; play ends `UNLATCHED`.

## AgentRouter smoke

```bash
npm run smoke:agentrouter
```

Protocol: Anthropic `POST /v1/messages` + Claude CLI wire headers (not OpenAI `/chat/completions`).

Triage: **A** WAF → Tor · **B** SOCKS down → restart Tor · **C** `unauthorized_client` on `/messages` → Discord/support · **D** bad key / wrong gateway · **E** truncated JSON → raise max_tokens.

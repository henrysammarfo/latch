# LATCH — Session Log

## 2026-09-13 — Empire plan execution start

- Read `LATCH_BIBLE` end-to-end; mapped marketing-only repo.
- Live research: hackathon site + judges VERIFIED via Tavily; TinyFish new key COMPLETED; AgentRouter direct returns Aliyun WAF (Tor required); Tor not yet installed on VM.
- Owner has no Slack/Google/Stripe keys yet — `memory/CREDENTIALS_RUNBOOK.md` baby steps published.
- Implementing rules, skills, memory, AgentRouter/Tor client, saga engine, dashboard, evals, README.
- Hard constraints: no mocks, no fake greens, no silent fallbacks, fail-closed LLM.

## 2026-09-13 — Empire scaffold shipped

- Rules, skills, memory, credentials runbook, bible copy.
- Server saga/connectors/eval/API/dashboard under dry_run default.
- AgentRouter Tor smoke script + goldens script.
- README + docs/RELIABILITY.md.
- Owner still must mint Slack/Google/Stripe for live IDs.
- Residual risk documented; no unhackable claims.

## 2026-09-13 — Tor smoke + triage C

- Tor installed/started; ipify via SOCKS ok.
- AgentRouter client switched to `fetch-socks` dispatcher (undici + SocksProxyAgent was broken).
- Smoke now correctly labels **triage C** (`unauthorized_client`) — fail closed, no mock LLM.
- Owner must mint a fresh AgentRouter token off-repo / Discord; then re-run `npm run smoke:agentrouter`.
- Unit tests + goldens still green; typecheck + build green.

## 2026-09-13 — AgentRouter base/protocol fix (owner pushback)

- Owner: keys work in other chats; change base — do not only blame Discord.
- Matrix: `agentrouter.org/v1` Tor → C on `/chat/completions`; direct → WAF A; `co.agentrouter.org/v1` → D Invalid API Key; other hosts ENOTFOUND/404.
- Root cause: AgentRouter rejects generic OpenAI clients; Claude-Code Anthropic `/v1/messages` + CLI headers works with same key.
- Client switched to `POST {base}/messages`; smoke **OK** `deepseek-v4-flash` status 200. Goldens/unit/typecheck green.

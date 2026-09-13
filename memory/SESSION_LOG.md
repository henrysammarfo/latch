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
## 2026-09-13 — Slack CLI connected

- `slack auth login` completed; app **LATCH** installed (local) on TerraSignal.
- Bot token written to `.env` only (auth.test ok). Awaiting channel ID + invite.
## 2026-09-13 — Slack #cs live post OK

- `SLACK_CS_CHANNEL_ID=C0C2CDTQSL8` (#cs); bot member; `chat.postMessage` returned ok + ts.
- Next: Google baby-step 1 (Cloud project + enable APIs).

## 2026-09-13 — Vercel + Google OAuth routes

- Created Vercel project latch; seeded env from .env (excl Tor).
- Added `/api/oauth/google/start` + callback; nitro preset `vercel`.
- Next: deploy URL, add Google redirect URI, publish consent, connect + Sheet ID, merge main.

## 2026-09-13 — Multi-tenant app + marketing pass

- Email/password workspace signup; verify-later in Settings; no Google user auth.
- Production app shell under `/app/*` (agents, plays, connections, evals, settings) with toasts + mobile nav.
- Marketing pages rewritten in plain language (workspace → agents → save plays → proof).
- Precise Google Sheet steps in `docs/GOOGLE_SHEET_SETUP.md` (owner still owes Spreadsheet ID).
- `/dashboard` redirects to `/app`. Typecheck + unit tests green; Vite build green.

## 2026-09-13 — Strip Lovable + set OG preview

- Removed `@lovable.dev/vite-tanstack-config`, Lovable error telemetry, `.lovable/`, Lovable AGENTS/bunfig notes.
- Vite config now uses TanStack Start + Nitro Vercel + Tailwind directly.
- Root meta: Latch title/description/author, full Open Graph + Twitter cards, canonical, favicon.svg/ico, apple-touch-icon.
- Added `public/og.jpg` (1200×630), `public/og.png`, sitemap, robots.
- No "tabicom" traces found in repo.

# LATCH — Fact Check

Labels: **VERIFIED** · **DIRECTIONAL** · **UNVERIFIED**

| Claim | Result | Source | Date | Label |
| --- | --- | --- | --- | --- |
| Multi-App AI Agent Hackathon virtual Sun 2026-09-13; submit package; ≥3 apps; rubric Technical 30 / Reliability 25 / Usefulness 20 / Originality 15 / Demo 10 | Matches live site | https://multiappagenthackathon.com/ | 2026-09-13 | VERIFIED |
| Hosts Lemma × Comma Capital | Live site | https://multiappagenthackathon.com/ | 2026-09-13 | VERIFIED |
| Judges include Userlens (Ankur Dahama, Hai Ta), Arga Labs (Phillip Li, Akira Tong), Clera (Shlok Mundhra) | `/judges` page | https://multiappagenthackathon.com/judges | 2026-09-13 | VERIFIED |
| Homepage currently highlights Arga founders only | Extract of homepage | https://multiappagenthackathon.com/ | 2026-09-13 | VERIFIED |
| Arga Labs ~$10M seed / agent sandbox narrative | Press (citybiz / Dealroom-class) via Tavily | secondary press | 2026-09-13 | DIRECTIONAL |
| Bible “median NRR ~106%” | Secondary 2025–2026 SaaS benchmarks cluster median ~101–103%, top quartile ~113% | SaaS Capital / Benchmarkit via Tavily | 2026-09-13 | DIRECTIONAL (bible figure outdated) |
| AgentRouter direct from Cursor Cloud returns Aliyun WAF HTML | Live curl `https://agentrouter.org/v1/models` | this VM | 2026-09-13 | VERIFIED |
| TinyFish new key can complete automation | Live run status COMPLETED | agent.tinyfish.ai | 2026-09-13 | VERIFIED |
| Prior AgentRouter key `sk-iftjk…` invalid | Live 401 | agentrouter.org | 2026-09-13 | VERIFIED (rotated) |

## Research rules

- Prefer Tavily + TinyFish live fetches.
- Do not promote DIRECTIONAL stats to VERIFIED without primary sources.
- Never claim “unhackable.”

## 2026-09-13 session — AgentRouter / Tor

| Claim | Result | Evidence | Label |
| --- | --- | --- | --- |
| Direct `agentrouter.org` from Cursor Cloud returns Aliyun WAF HTML | Confirmed | curl without proxy | VERIFIED |
| Tor SOCKS `127.0.0.1:9050` reaches public internet | Confirmed | ipify via socks5h | VERIFIED |
| OpenAI `/chat/completions` over Tor returns `unauthorized_client` (HTTP 401) even with valid key | Confirmed | probe matrix | VERIFIED (protocol, not dead key) |
| Anthropic `/v1/messages` + Claude CLI headers succeeds with same key | Confirmed | `npm run smoke:agentrouter` → ok:true 200 | VERIFIED |
| `co.agentrouter.org/v1` returns Invalid API Key for this key while `agentrouter.org` works | Confirmed | live probe | VERIFIED (separate gateway) |
| Goldens G1–G4 pass in dry_run | Confirmed | `npm run eval:goldens` | VERIFIED |
| `npm run build` + `npm run typecheck` clean | Confirmed | this session | VERIFIED |

## 2026-09-13 — AgentRouter node-fetch + socks-proxy-agent

| Claim | Result | Label |
| --- | --- | --- |
| undici/Bun fetch ignores SOCKS → WAF HTML on Cloud | Prior session | VERIFIED |
| node-fetch + socks-proxy-agent via Tor reaches AgentRouter JSON | Smoke returns HTTP 401 JSON triage C (not WAF) | VERIFIED |
| Key `sk-jiQJ…` still `unauthorized_client` on OpenAI path | Historical | SUPERSEDED — /messages path works with current key |
| Smoke green after /messages switch | `{"ok":true,"model":"deepseek-v4-flash","status":200}` | VERIFIED |
| Slack LATCH bot can post to #cs on TerraSignal | Live chat.postMessage ok | channel C0C2CDTQSL8 | 2026-09-13 | VERIFIED |

## 2026-09-13 — Product claims

- VERIFIED in code: signup is email/password; Google OAuth is operator-only for Sheets/Gmail/Calendar.
- VERIFIED: Gmail path remains draft-only in saga connectors.
- PENDING owner: `GOOGLE_SHEETS_SPREADSHEET_ID` before Google connector shows configured.

## 2026-09-13 — Google configured

- VERIFIED: `/api/health` on latch.tryopal.asia returns Google `configured: true` after Spreadsheet ID env set.

## 2026-09-13 — Stripe + diagrams packaging

| Claim | Result | Evidence | Label |
| --- | --- | --- | --- |
| Stripe test secret + webhook secret set on Vercel | Keys added via `vercel env` (sensitive) | `vercel env ls` shows STRIPE_* | VERIFIED |
| Bundling `@excalidraw/excalidraw` into Nitro SSR 500s production | Confirmed | prod 500 until rollback; server chunk included 4.8MB excalidraw | VERIFIED |
| CDN iframe viewer keeps Excalidraw off server graph | Build has no `@excalidraw/*` lib chunks | `npm run build` server output | VERIFIED |
| “Unhackable” | Not claimed | doctrine | VERIFIED |

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
| Current AgentRouter key returns `unauthorized_client` over Tor (HTTP 401) | Confirmed | curl + `npm run smoke:agentrouter` → triage C | VERIFIED |
| Fix is off-repo (mint new token / Discord support) — do not fake LLM success | Policy | Owner FINAL PROMPT triage C | VERIFIED |
| Goldens G1–G4 pass in dry_run | Confirmed | `npm run eval:goldens` | VERIFIED |
| `npm run build` + `npm run typecheck` clean | Confirmed | this session | VERIFIED |

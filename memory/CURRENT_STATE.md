# LATCH — Current State

**Updated:** 2026-09-13  
**Branch:** `cursor/google-consent-pages-de86`

## Live product shape

- Tour: `/app/tour` click-through (agents → connections → run → force-fail → goldens)
- Diagrams: `/diagrams` Excalidraw viewer (CDN iframe + committed `.excalidraw` / Mermaid sources)

- Marketing: plain-language pages (`/`, `/how-it-works`, `/plans`, `/docs`, `/reliability`, `/contact`)
- Auth: **email + password only** (`/register`, `/login`) — no Google login for accounts
- Email verify: optional, later in `/app/settings` (token paste until SMTP)
- App shell: `/app` overview, agents, plays, connections, evals, settings (toasts, mobile nav)
- Legacy `/dashboard` and `/dashboard/evals` redirect into `/app`
- Operator Google OAuth remains for Sheets/Gmail/Calendar (`/api/oauth/google/start`) — separate from signup

## Connectors

- Slack: configured (live channel `#cs`)
- Google: configured (`oauth+sheet present`) — Spreadsheet ID set on Vercel; live mode still gated by `LATCH_MODE`
- Stripe: **configured** (test mode secret + webhook secret on Vercel; live mode still gated by LATCH_MODE)
- AgentRouter LLM: works via Tor on Cursor Cloud

## Next owner credentials

None blocking for Stripe test wiring — next is live mode flip when ready, or SMTP for email verify

## Security posture

Fail-closed · Gmail draft-only · secrets gitignored · residual risk documented · **not** claiming unhackable.

# LATCH Credentials Runbook (baby steps)

**Never paste secrets into chat or commit them.** Put values only in gitignored `.env` / `.dev.vars`.

After each section, reply in chat with **non-secret** IDs only (channel ID, sheet ID, webhook URL).

---

## 0. Copy env template

```bash
cp .env.example .env
```

Fill keys below as you mint them. Research keys (Tavily / TinyFish / AgentRouter) may already be in your local `.env`.

---

## A. Slack bot (alert + compensate)

1. Open [https://api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → From scratch → pick your workspace.
2. **OAuth & Permissions** → Bot Token Scopes add:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
   - `channels:history`
3. **Install to Workspace** → copy **Bot User OAuth Token** (`xoxb-…`) → `SLACK_BOT_TOKEN`.
4. Create public channel `#cs` (or `#latch-demo`) → invite the bot.
5. Channel ID: Slack → channel details → copy ID → `SLACK_CS_CHANNEL_ID`.
6. Docs: [Slack quickstart](https://docs.slack.dev/quickstart).

**Done check:** non-secret `SLACK_CS_CHANNEL_ID=C…`

---

## B. Google (Gmail + Sheets + Calendar)

1. [Google Cloud Console](https://console.cloud.google.com/) → new project `latch-empire`.
2. Enable APIs:
   - [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
   - [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
   - [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
   - Guide: [Enable Google Workspace APIs](https://developers.google.com/workspace/guides/enable-apis)
3. OAuth consent: [Configure consent](https://developers.google.com/workspace/guides/configure-oauth-consent)
   - User type: **External** → add yourself as **test user**
   - Scopes: `gmail.readonly`, `gmail.compose` (draft only — never send), `spreadsheets`, `calendar.events`
4. Create OAuth client: [Create credentials](https://developers.google.com/workspace/guides/create-credentials)
   - Type: **Web application**
   - Redirect URIs: `http://localhost:3000/api/oauth/google/callback` (+ your deploy URL later)
   - Copy → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
5. Create a Sheet named **LATCH Risk Ledger** with header row:
   `run_id | account | arr_at_risk | status | slack_ts | sheet_range | cal_event_id | gmail_draft_id | updated_at`
   - Copy Spreadsheet ID from URL → `GOOGLE_SHEETS_SPREADSHEET_ID`
6. Run the in-app Google OAuth link (once dashboard is up) → stores `GOOGLE_REFRESH_TOKEN`.

**Done check:** non-secret `GOOGLE_SHEETS_SPREADSHEET_ID=…`

---

## C. Stripe test mode (trigger + ARR-at-risk)

1. [Test API keys](https://dashboard.stripe.com/test/apikeys) → Secret key `sk_test_…` → `STRIPE_SECRET_KEY`.
2. [Test webhooks](https://dashboard.stripe.com/test/webhooks) → Add endpoint
   - URL: `https://<your-deploy>/api/public/stripe-webhook`
   - Events: `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`
   - Reveal signing secret `whsec_…` → `STRIPE_WEBHOOK_SECRET`
3. Local forward (optional): [Stripe CLI listen](https://docs.stripe.com/webhooks/quickstart)
   - `stripe listen --forward-to localhost:3000/api/public/stripe-webhook`
   - Use the CLI `whsec_` for local only (different from Dashboard secret).
4. Docs: [Webhooks](https://docs.stripe.com/webhooks) · [Signatures](https://docs.stripe.com/webhooks/signature).

**Done check:** non-secret webhook URL configured in Stripe Dashboard.

---

## D. AgentRouter + Tor (Cursor Cloud)

| Var | Value |
| --- | --- |
| `AGENTROUTER_API_KEY` | from AgentRouter dashboard |
| `AGENTROUTER_BASE_URL` | `https://agentrouter.org/v1` (Anthropic `/messages`; Tor on Cloud) |
| `AGENTROUTER_MODEL` | `deepseek-v4-flash` |
| `AGENT_ROUTER_HTTP_PROXY` | `socks5h://127.0.0.1:9050` on Cursor Cloud only |

On Vercel/production: set key + base URL; **do not** set Tor proxy to localhost.

Smoke: `npm run smoke:agentrouter` → expect `{"ok":true,"model":"deepseek-v4-flash","status":200}` (never prints the key).

Triage: **A** WAF HTML direct → Tor · **B** SOCKS timeout → restart Tor · **C** `unauthorized_client` on `/messages` + Claude headers → Discord/support · **D** bad key / wrong gateway · **E** truncated JSON → raise max_tokens. Do not use OpenAI `/chat/completions` — AgentRouter returns false C for generic clients.

---

## E. Not required for v1

- HubSpot (Sheets is the CRM ledger)
- Postgres / Neon / Turso (server store + Sheets audit)
- Venice (AgentRouter is the LLM path)

---

## Security

- Rotate any key that was pasted into chat after the hackathon.
- Least privilege OAuth scopes.
- Gmail is **draft-only** — LATCH never auto-sends customer email.
- Residual risk always exists (token theft, scope abuse, WAF/Tor ops). We do **not** claim unhackable.

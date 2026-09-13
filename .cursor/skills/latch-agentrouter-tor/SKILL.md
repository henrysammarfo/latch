---
name: latch-agentrouter-tor
description: Wire AgentRouter LLM via Tor SOCKS on Cursor Cloud with fail-closed behavior. Use when implementing LLM client, smoke:agentrouter, WAF/Tor triage, or RiskCompiler draft reasons.
---

# AgentRouter + Tor (fail closed)

## Hard rules

1. Default base: `https://agentrouter.org/v1` (Tor required on Cursor Cloud)
2. Protocol: **Anthropic Messages** `POST {base}/messages` — NOT OpenAI `/chat/completions`
3. Never commit `.env` or echo keys
4. Fail closed — no mock LLM text
5. Do not invent proxy hosts — local Tor or owner-supplied proxy URL only

## Why /messages (not /chat/completions)

AgentRouter fingerprints clients. Generic OpenAI `/chat/completions` returns
`unauthorized_client` even with a valid key. Claude-Code-shaped Anthropic
`/v1/messages` + CLI wire headers succeeds (verified 2026-09-13 on this VM).
Official guide also documents Anthropic base without `/v1` for Claude Code;
our client calls `{base}/messages` with base ending in `/v1`.

`co.agentrouter.org` is a separate gateway (docs OpenAI path). Same key may
return `Invalid API Key` there while working on `agentrouter.org` — do not
treat that as proof the key is dead.

## Env

```
AGENTROUTER_API_KEY=
AGENT_ROUTER_API_KEY=
AGENTROUTER_BASE_URL=https://agentrouter.org/v1
AGENT_ROUTER_BASE=https://agentrouter.org
AGENTROUTER_MODEL=deepseek-v4-flash
AGENT_ROUTER_HTTP_PROXY=socks5h://127.0.0.1:9050
```

## Client

- Force-load gitignored `.env`
- `POST /messages` with Anthropic body (`model`, `max_tokens`, `messages`)
- Headers: Claude CLI wire (`user-agent: claude-cli/…`, `x-app: cli`,
  `anthropic-version`, `anthropic-dangerous-direct-browser-access`, Bearer + x-api-key)
- Tor: `socks5h` → `socks-proxy-agent` + `node-fetch`
- `max_tokens >= 4096` for allocate JSON drafts

## Verify order

1. `curl -fsS -x socks5h://127.0.0.1:9050 https://api.ipify.org`
2. Direct `curl https://agentrouter.org/v1/models` (expect WAF HTML on Cloud — proves Tor need)
3. `npm run smoke:agentrouter` → `{"ok":true,"model":"deepseek-v4-flash","status":200}`

## Triage A–E

See `.cursor/rules/latch-secrets-and-live.mdc`.

- **A** WAF HTML → Tor
- **B** SOCKS down → restart Tor
- **C** `unauthorized_client` on `/messages` with Claude CLI headers → account/client flag; Discord/support
- **D** Invalid API Key → wrong gateway or dead key
- **E** truncated/empty → raise max_tokens / check model

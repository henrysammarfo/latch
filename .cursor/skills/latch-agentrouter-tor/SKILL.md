---
name: latch-agentrouter-tor
description: Wire AgentRouter LLM via Tor SOCKS on Cursor Cloud with fail-closed behavior. Use when implementing LLM client, smoke:agentrouter, WAF/Tor triage, or RiskCompiler draft reasons.
---

# AgentRouter + Tor (fail closed)

## Hard rules

1. Base URL only: `https://agentrouter.org` / OpenAI-compatible `https://agentrouter.org/v1`
2. Forbidden: `co.agentrouter.org`, fallbacks to OpenAI/Anthropic public APIs
3. Never commit `.env` or echo keys
4. Fail closed — no mock LLM text
5. Do not invent proxy hosts — local Tor or owner-supplied proxy URL only

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
- Headers: `Authorization: Bearer` + `x-api-key` + Claude-CLI-compatible wire headers
- `socks5h` → `socks-proxy-agent`; http(s) proxy → undici `ProxyAgent`
- `max_tokens >= 4096` for allocate JSON

## Verify order

1. `curl -fsS -x socks5h://127.0.0.1:9050 https://api.ipify.org`
2. Direct `curl https://agentrouter.org/v1/models` (expect WAF HTML on Cloud — proves Tor need)
3. `npm run smoke:agentrouter` → `{"ok":true,"model":"deepseek-v4-flash","status":200}`

## Triage A–E

See `.cursor/rules/latch-secrets-and-live.mdc`. On `unauthorized_client` both paths → off-repo token mint; stop iterating headers.

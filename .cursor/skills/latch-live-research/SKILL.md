---
name: latch-live-research
description: Live fact-check LATCH claims via Tavily and TinyFish. Use when verifying hackathon rules, judges, NRR stats, competitor claims, or before writing FACT_CHECK.md entries.
---

# LATCH Live Research

## Tools

- **Tavily:** `https://api.tavily.com/search` with `TAVILY_API_KEY`
- **TinyFish:** `POST https://agent.tinyfish.ai/v1/automation/run` header `X-API-Key: $TINYFISH_API_KEY`

Never print API keys. Never invent citations.

## Workflow

1. Search/extract live sources.
2. Record in `memory/FACT_CHECK.md` with URL + date + label:
   - VERIFIED — primary source fetched
   - DIRECTIONAL — secondary benchmarks
   - UNVERIFIED — not yet checked
3. If TinyFish returns insufficient credits — say so; do not fabricate page content.
4. Update `memory/SESSION_LOG.md` with what was checked.

## Known corrected claims

- Hackathon NRR bible “median ~106%” → DIRECTIONAL secondary sources show median ~101–103%, top quartile ~113% (re-check live when writing).

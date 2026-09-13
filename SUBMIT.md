# LATCH — Contest Submit Kit

**Production:** https://latch.tryopal.asia  
**App:** https://latch.tryopal.asia/app  
**Diagrams:** https://latch.tryopal.asia/diagrams  
**Health:** https://latch.tryopal.asia/api/health  
**GitHub:** https://github.com/henrysammarfo/latch  

> When a customer looks ready to churn, **LATCH** runs a fail-closed save play across Slack, Sheets, Calendar, and a Gmail **draft** — and only greens when every side-effect is proven with an ID (or compensates cleanly and goes `UNLATCHED`).

---

## Live proof (already green on production)

| Check | Result |
|---|---|
| `GET /api/health` | Slack · Google · Stripe · AgentRouter all **configured** |
| `POST /api/latch/goldens` | **G1–G4 PASS** (LATCHED, UNLATCHED+compensate, idempotent replay, mutation block) |
| `POST /api/latch/run` | Save play → `LATCHED` with step proofs (dry_run until `LATCH_MODE=live`) |
| Inject Slack fail | `UNLATCHED` + compensate — board stays honest |
| Gmail | **Draft only** — never silent customer send |
| “Unhackable” | **Never claimed** |

Deletion test: wipe the proof IDs → you no longer know whether Slack posted, Sheets wrote, Calendar held, or Gmail drafted. That shared proof trail **is** the product.

---

## What's real vs deferred (one-glance)

| Claim | Status |
|---|---|
| Multi-tenant workspace (email/password) | **Live** |
| Save-play saga + compensation | **Live** (dry_run default; live gated) |
| Goldens G1–G4 + force-fail | **Live** |
| Slack / Google / Stripe connectors configured | **Live** on `/api/health` |
| Excalidraw architecture diagrams | **Live** at `/diagrams` |
| `LATCH_MODE=live` side-effects | **Gated** — flip when owner is ready |
| SMTP email verify | **Deferred** — Settings paste-token |
| “Unhackable” | **Never claimed** |

---

## FULL DEMO VIDEO SCRIPT (word for word)

**Target length:** 90–110 seconds  
**Tone:** playful confidence, judge-friendly, zero fluff. Hook hard. Never say “unhackable.”  
**Screen path:** `/` → `/how-it-works` (brief) → `/app/plays` → force-fail → `/app/evals` → `/diagrams` → `/api/health` close  
**Before record:** hard-refresh https://latch.tryopal.asia · signed into a demo workspace · `/app/plays` tab ready · goldens warm.

---

### [0:00–0:12] THE HOOK — home

*(Land on https://latch.tryopal.asia. Hold the hero 2 seconds. Cursor idle.)*

> “Most churn tools write a note.
>
> **LATCH** runs the save.
>
> Watch — when a customer looks ready to leave, we don’t hope. We orchestrate.”

*(Click **See how it works** / scroll the step strip if already on home.)*

### [0:12–0:24] THE PROMISE — how it works

*(Show the four plain steps: workspace → agents → save play → proof.)*

> “Create a workspace. Spin up agents. Latch fires a save play across Slack, Sheets, Calendar, and a Gmail draft.
>
> And here’s the twist judges care about — **no silent greens**. Every step needs a proof ID. Miss one? We don’t fake it. We compensate.”

*(Click **Start free** or open `/app/plays` if already signed in.)*

### [0:24–0:48] THE CORE FLOW — run save play

*(On `/app/plays`. Point at **Run save play**. Click it. Wait for LATCHED + step list.)*

> “Core flow. One click.
>
> Trigger hits. Policy allows. Saga runs —
>
> Slack alert. Sheets risk row. Calendar hold. Gmail **draft only** — human still owns the send.
>
> Board says **LATCHED**. Six of six asserts. ARR at risk on the card. That’s not a toast. That’s a receipt.”

*(Hover the step rows so external IDs / dry_run markers are readable.)*

> “Each row is a receipt. If this were live mode, those would be real Slack `ts`, Sheet ranges, Calendar event IDs, Gmail draft IDs.”

### [0:48–1:05] THE PLOT TWIST — force fail

*(Click **Force Slack fail**. Wait for UNLATCHED + compensate.)*

> “Now the fun part. We **break** Slack on purpose.
>
> Same play. Mid-saga. Inject fail.
>
> Latch does not shrug and keep going. It stops. Compensates. Marks **UNLATCHED**.
>
> That’s the reliability score — fail closed, not fail cute.”

### [1:05–1:20] THE RECEIPT BOARD — goldens

*(Open `/app/evals`. Click **Re-run goldens** if needed. Show G1–G4 all PASS.)*

> “Goldens G1 through G4 — cancel → latched, Slack fail → unlatched plus compensate, idempotent replay, mutation that cannot fully green.
>
> All pass. On production. Not a slide deck.”

### [1:20–1:35] THE MAP — diagrams

*(Open `/diagrams`. Click Save play pipeline, then Mermaid → Excalidraw if visible.)*

> “Architecture as Excalidraw — same story you just watched: trigger, compile, policy, saga, assert.
>
> Mermaid sources commit to the repo. Live convert in the browser. No mystery meat diagrams.”

### [1:35–1:50] THE CLOSE — health + deletion test

*(Open `/api/health` JSON briefly, or Connections page showing configured connectors. End on home or plays LATCHED card.)*

> “Health check — Slack, Google, Stripe, AgentRouter — configured.
>
> Deletion test: wipe the proof IDs and the save story vanishes. Agents can still chat elsewhere. Shared truth cannot.
>
> LATCH — fail-closed churn-save for multi-tenant teams.
>
> latch.tryopal.asia · github.com/henrysammarfo/latch
>
> Draft only. No mocks. Not ‘unhackable’ — just honest.”

*(Hold final frame 1–2 seconds. Stop.)*

---

### Optional 20-second short cut (X / judges in a rush)

> “LATCH — when churn shows up, we don’t write a sticky note. We run a fail-closed save play: Slack, Sheets, Calendar, Gmail draft — greens only with proof IDs, or UNLATCHED with compensation. Goldens G1–G4 pass on production. latch.tryopal.asia”

---

## Suggested X / submission paste

```
LATCH — fail-closed churn-save orchestration

Customer looks ready to leave → Slack + Sheets + Calendar + Gmail draft
→ LATCHED only with proof IDs
→ or UNLATCHED + compensate (we force-fail Slack on purpose)

Goldens G1–G4 live. Draft-only Gmail. No mocks.

Demo: https://latch.tryopal.asia
App: https://latch.tryopal.asia/app/plays
Video: <paste YouTube after upload>
GitHub: https://github.com/henrysammarfo/latch
```

---

## Recording tips

1. Speak a half-beat slower than normal. Leave ~0.6s after each button so the UI paints.
2. Zoom the play step list if judges can’t read IDs.
3. If a run errors: Reset, hard-refresh, start again — never narrate a failed take.
4. Do **not** say “unhackable.” If asked: residual risk is documented; dry_run is honest until live mode flips.
5. Prefer a private window signed into the demo workspace so marketing chrome stays clean.

## Demo operator checklist (owner)

1. [ ] Record VO over this script (or talk live while clicking)
2. [ ] Upload to YouTube → paste URL into this file + X post
3. [ ] Quote/reply hackathon post with video + GitHub + production URL
4. [ ] Survey + jurisdiction check
5. [ ] Optional: flip `LATCH_MODE=live` only after confirming Slack/Sheet/Calendar/Gmail draft in a safe test account

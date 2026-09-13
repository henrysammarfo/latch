# LATCH — Demo video script (click-by-click + word for word)

**You record. You speak. Follow the clicks below.**

**Production:** https://latch.tryopal.asia  
**Sign up / sign in:** https://latch.tryopal.asia/register · https://latch.tryopal.asia/login  
**App:** https://latch.tryopal.asia/app  
**Length:** ~90–110 seconds  
**Tone:** calm, sharp, judge-friendly. Never say “unhackable.”

---

## What judges do (so you know what you’re demoing)

| Who | What they do |
|---|---|
| **Judges** | Sign up with **email + password** → land in a **workspace** → create/open an **agent** → click **Run save play** |
| **Their own Slack/Google/Stripe?** | **Not required** for the contest path. Production already has connectors **configured**. Plays run in **dry_run** by default and still show the full saga + asserts (LATCHED / UNLATCHED). |
| **Optional** | They can open **Connections** and see Slack/Google/Stripe status. Operator Google OAuth is for *your* Sheet/Gmail/Calendar — not their login. |
| **Live mode** | Only when you flip `LATCH_MODE=live`. Until then: honest dry_run proofs, not fake greens. |

**Deletion test (say this once):** wipe the proof IDs → the shared save story disappears. That’s the product.

---

## Before you hit record

1. Hard-refresh https://latch.tryopal.asia  
2. Sign in (or register once) so `/app` loads  
3. Have these tabs ready (or click live while talking):
   - `/` (home)
   - `/app` (overview)
   - `/app/agents`
   - `/app/plays`
   - `/app/evals`
   - `/api/health` (optional close)
4. Speak a half-beat slower than normal. Pause ~0.5s after each click so the UI paints.

---

## FULL SCRIPT — clicks + exact words

### [0:00–0:12] HOME

**Click:** open https://latch.tryopal.asia — hold hero 2 seconds.

> “Most churn tools write a note.
>
> **LATCH** runs the save.
>
> When a customer looks ready to leave, we don’t hope. We orchestrate — and we only green when every step has proof.”

---

### [0:12–0:22] SIGN IN / WORKSPACE

**Click:** **Start free** / **Sign in** → land on https://latch.tryopal.asia/app

> “Judges sign up with email and password. That creates a workspace.
>
> No Google login for accounts. Your tools are separate from your identity.”

---

### [0:22–0:34] AGENTS

**Click:** sidebar **Agents** → https://latch.tryopal.asia/app/agents  
**Click:** open an agent (or create one: name + purpose → **Create agent**)

> “Each workspace gets agents. One agent, one churn motion.
>
> Create it in seconds. This is multi-tenant for real teams — not a single shared demo toy.”

---

### [0:34–0:55] CORE FLOW — RUN SAVE PLAY

**Click:** sidebar **Plays** → https://latch.tryopal.asia/app/plays  
**Click:** **Run save play**  
**Wait:** for **LATCHED** and the step list.

> “Core flow. One click.
>
> Trigger hits. Policy allows. Saga runs —
>
> Slack alert. Sheets risk row. Calendar hold. Gmail **draft only** — human still owns the send.
>
> Board says **LATCHED**. Asserts green. ARR at risk on the card.
>
> That’s not a toast. That’s a receipt.”

**Hover** the step rows so IDs / dry_run markers are readable.

> “Judges do **not** need to wire their own Slack or Gmail for this path. Connectors are already configured on production. Dry-run stays honest — live mode is a flip when the operator is ready.”

---

### [0:55–1:12] PLOT TWIST — FORCE FAIL

**Click:** **Force Slack fail** (same Plays page)  
**Wait:** for **UNLATCHED** + compensate.

> “Now we break Slack on purpose.
>
> Same play. Mid-saga. Inject fail.
>
> Latch does not shrug and keep going. It stops. Compensates. Marks **UNLATCHED**.
>
> Fail closed — not fail cute. That’s the reliability score.”

---

### [1:12–1:28] EVALS / GOLDENS

**Click:** sidebar **Evals** → https://latch.tryopal.asia/app/evals  
**Click:** **Re-run goldens** if needed. Show G1–G4 **PASS**.

> “Goldens G1 through G4 —
>
> cancel goes latched,
> Slack fail goes unlatched plus compensate,
> idempotent replay,
> mutation that cannot fully green.
>
> All pass. On production. Not a slide deck.”

---

### [1:28–1:42] CONNECTIONS (optional 8s — keep if you have time)

**Click:** **Connections** → show Slack / Google / Stripe **Configured**

> “Connections show what’s wired. Judges can inspect status. They don’t have to reconnect the world to feel the product.”

---

### [1:42–1:55] CLOSE

**Click:** https://latch.tryopal.asia/api/health (JSON) **or** end on Plays with LATCHED card  
**Hold** 1–2 seconds. Stop.

> “Health — Slack, Google, Stripe, AgentRouter — configured.
>
> Deletion test: wipe the proof IDs and the save story vanishes.
>
> LATCH — fail-closed churn-save for multi-tenant teams.
>
> Draft only. No mocks. Not ‘unhackable’ — just honest.
>
> latch.tryopal.asia · github.com/henrysammarfo/latch”

---

## 20-second short cut (if you need under a minute)

**Clicks:** `/` → `/app/plays` → Run save play → Force Slack fail → stop on UNLATCHED.

> “LATCH — when churn shows up, we don’t write a sticky note. We run a fail-closed save play: Slack, Sheets, Calendar, Gmail draft — greens only with proof IDs, or UNLATCHED with compensation. Goldens pass on production. Judges sign up, create an agent, run the play — no app reconnect required for the contest path. latch.tryopal.asia”

---

## X / submission paste

```
LATCH — fail-closed churn-save orchestration

Sign up → create agent → Run save play
→ Slack + Sheets + Calendar + Gmail draft
→ LATCHED only with proof IDs
→ or UNLATCHED + compensate (we force-fail Slack on purpose)

Judges don’t need to reconnect apps for the contest path.
Goldens G1–G4 live. Draft-only Gmail. No mocks.

Demo: https://latch.tryopal.asia
Plays: https://latch.tryopal.asia/app/plays
Video: <paste after upload>
GitHub: https://github.com/henrysammarfo/latch
```

---

## Recording tips

1. If a run errors: refresh, click **Run save play** again — don’t narrate a failed take.  
2. Zoom the play step list if IDs are hard to read on camera.  
3. Do **not** say unhackable.  
4. Dry_run on purpose until you flip live — say that proudly.

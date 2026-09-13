# LATCH — Demo video script (you record, you speak)

**Production:** https://latch.tryopal.asia  
**Sign up:** https://latch.tryopal.asia/register  
**Sign in:** https://latch.tryopal.asia/login  
**App:** https://latch.tryopal.asia/app  
**Target length:** about two minutes  
**Tone:** talk like a real person explaining the product to judges — full sentences, natural pace. Never say “unhackable.”

---

## What you’re actually showing

Judges use Latch the same way you will in this video: they create an account with email and password, land in their own workspace, open or create an agent, and click **Run save play**. They do **not** need to connect their own Slack, Google, or Stripe for the contest path — production already has those connectors configured. Plays run in **dry_run** by default, and you still get a full saga with asserts and a clear **LATCHED** or **UNLATCHED** result.

Say the deletion test once, somewhere natural: if you wipe the proof IDs, the shared save story disappears. That’s the point of the product.

---

## Before you hit record

1. Hard-refresh https://latch.tryopal.asia so you’re on the latest build.
2. Either stay signed out so you can show signup live, or sign in once beforehand if you want to start already inside `/app`.
3. Keep these ready to click: home `/`, overview `/app`, Agents, Plays, Evals, and optionally Connections and `/api/health`.
4. Speak at a normal conversational speed — a little slower than you think — and pause half a second after each click so the UI can paint on camera.

---

## FULL SCRIPT — clicks + spoken lines

Speak the lines in quotes out loud. Do the clicks in bold. This is meant to sound like you talking, not like slide bullets.

### [0:00–0:15] HOME

**Click:** open https://latch.tryopal.asia and hold on the hero for a couple of seconds.

> “Okay, so most churn tools basically just write you a note that someone might leave. Latch is different — Latch actually runs the save.
>
> When a customer looks ready to cancel, we don’t sit there hoping somebody notices. We orchestrate the whole save motion, and we only call it green when every step comes back with real proof.”

---

### [0:15–0:35] SIGN UP / WORKSPACE

**Click:** **Start free** or go to https://latch.tryopal.asia/register  
**Do:** create a fresh account with email, name, and password (8+ characters), then submit.  
**Wait:** you should land in the app overview for your new workspace.

> “For judges, getting in is just email and password. That signup creates your own workspace right away.
>
> There’s no Google login for the account itself. Your identity is separate from the Slack and Gmail tools that Latch uses under the hood.”

If you already have an account: **Click** Sign in instead, log in, and say:

> “I’m signing into my workspace here. Same path judges take — email and password, then you’re inside.”

---

### [0:35–0:55] AGENTS

**Click:** sidebar **Agents**  
**Click:** open the starter agent (“Churn watch”), or create one with a name and purpose and hit **Create agent**, then open it.

> “Inside the workspace you get agents. Think of one agent as one churn motion — something that’s watching for cancel language or a failed payment and knows how to run a save.
>
> You can create one in a few seconds. This isn’t a single shared demo toy; it’s multi-tenant, so each team gets their own workspace and their own agents.”

---

### [0:55–1:25] CORE FLOW — RUN SAVE PLAY

**Click:** sidebar **Plays**  
**Click:** **Run save play**  
**Wait:** until the board shows **LATCHED** and the step list fills in. Hover a couple of steps so IDs or dry_run markers are readable on camera.

> “This is the core flow, and it’s literally one click.
>
> A trigger comes in, policy says we’re allowed to act, and the saga runs. You get a Slack alert, a risk row in Sheets, a Calendar hold, and a Gmail draft — draft only, so a human still owns the send.
>
> When every step has proof, the board says LATCHED. The asserts go green, and you can see ARR at risk on the card. That’s not a toast notification. That’s a receipt.
>
> And for the contest path, judges don’t have to wire up their own Slack or Gmail. Those connectors are already configured on production. We’re in dry_run on purpose, so the proofs stay honest — live mode is just a flip when the operator is ready.”

---

### [1:25–1:45] PLOT TWIST — FORCE FAIL

**Click:** **Force Slack fail** on the same Plays page  
**Wait:** for **UNLATCHED** and compensation.

> “Now I’m going to break Slack on purpose, mid-saga, with the same play.
>
> Latch doesn’t shrug and keep going like everything is fine. It stops, it compensates, and it marks the run UNLATCHED.
>
> That’s fail closed — not fail cute — and that’s what we mean by reliability you can actually demo.”

---

### [1:45–2:00] EVALS + CLOSE

**Click:** sidebar **Evals** and show G1–G4 **PASS** (hit **Re-run goldens** only if you need a fresh board).  
Optional if you still have a few seconds: **Click** **Connections** and show Slack / Google / Stripe as configured, or open `/api/health`.

> “These are the golden jobs — G1 through G4. Cancel goes latched, a Slack failure goes unlatched with compensate, we cover idempotent replay, and we cover a mutation that can’t fully green. They pass on production, not on a slide deck.
>
> Health and connections just show what’s wired. The deletion test is simple: wipe the proof IDs and the save story goes away with them.
>
> So that’s Latch — fail-closed churn-save for real multi-tenant teams. Gmail stays draft only. No mocks. We’re not claiming this is unhackable; we’re claiming it’s honest.
>
> You can try it at latch.tryopal.asia, and the code is at github.com/henrysammarfo/latch.”

**Hold** the final frame one or two seconds, then stop.

---

## If you need a tighter take (~70–80 seconds)

**Clicks:** home → sign in or register → Agents → open agent → Plays → Run save play → Force Slack fail → stop on UNLATCHED.

> “Latch is for the moment a customer looks ready to leave. Instead of writing a sticky note, we run a fail-closed save play — Slack, Sheets, Calendar, and a Gmail draft — and we only go green when every step has proof IDs. If something breaks mid-saga, we compensate and mark it UNLATCHED. Judges sign up with email and password, create an agent, and run the play without reconnecting their own apps. Goldens pass on production. latch.tryopal.asia.”

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

1. If a run errors, refresh and click **Run save play** again — don’t narrate a failed take.
2. Zoom the play step list if IDs are hard to read on camera.
3. Do not say unhackable.
4. Dry_run is intentional until you flip live — say that proudly.
5. Show signup or login on camera if you can; session should stick when you click into Agents and Plays.

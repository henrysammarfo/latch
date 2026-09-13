# LATCH — Extreme Win Bible (ONE FILE · Empire · Multi-App AI 2026-09-13)

> **CANONICAL.** All LATCH content lives here. Satellite MDs under `multi-app-agent/` are **redirects only** — do not fork details.  
> **Host:** Lemma × Comma · Judges: Userlens + Arga Labs + Clera · https://multiappagenthackathon.com/  
> **When:** Sun **13 Sep 2026** · 9:00–5:00 **PT** · **Submit ≤ 4:00 PM PT** · Meet: `https://meet.google.com/kzb-dqmy-cyv`  
> **Field size:** ~**400** accepted (Henry open-call count) → AI shortlist likely → demo video + live deploy decide top-5.  
> **Empire:** Deadline ≠ scope · nothing optional · no mocks/fake greens · exceed YC-judge brain · fundable company.  
> **Research:** `JUDGES_2026-09-13` dumps · `_market/` · `_complex/` · Arga/Userlens YC pages.

---

# 0. One sentence

**LATCH is a fail-closed churn-save orchestration engine: when risk hits, it commits a multi-app save play with saga compensation, proves every side-effect with IDs, and only then says green — so lean SaaS can trust agents with renewals.**

---

# 1. Soft · 8-second · pitch order

**Soft:** When a customer looks ready to churn, LATCH runs a fail-closed save play across your CSM stack — and only greens when every app actually did its job (or compensates cleanly and goes red).

**8-second:** Stripe cancel / risk email → policy gate → Slack + HubSpot/Sheets + Calendar (saga) → eval board GREEN with IDs · kill Slack mid-run → compensate → RED `UNLATCHED`.

**Pitch order (judges + AI):**  
1) Economic problem (NRR / blind churn) · 2) Complex multi-app **saga** · 3) **Eval + force-fail + compensate** · 4) Live deploy they can poke · 5) Fundable company · 6) Interview ask.

Never: Accra guest-house · Notion meeting booker · chat-only · fake green.

---

# 2. Contest laws (submit package)

| Law | Fact |
|---|---|
| Deadline | **13 Sep 2026 · 4:00 PM Pacific** · one response per project/team |
| Repo | Public GitHub judges can open |
| README **must** include | Project overview · external apps · setup · **how you tested reliability** · **link to 2-min demo** |
| Also | Working project · short system + reliability brief (can be README sections) |
| Team | 1–4 · solo OK |
| Apps | ≥3 external · multi-step |
| Rubric | 30% technical · **25% reliability** · 20% useful · 15% originality · 10% demo |
| Prizes | $10k / $4k / $1k · top 3 → Arga **or** Lemma interviews |
| Reality | ~400 people · AI shortlist → watch demos → **top ~5 get live deploy tested** |

---

# 3. Judges (compressed · full research already done)

| Judge | Co | What they reward on screen |
|---|---|---|
| Ankur Dahama · Hai Ta | **Userlens** | Churn/renewal economics · CSM workflow · human still in control of customer sends |
| Phillip Li · Akira Tong | **Arga Labs** | Side-effect proof · twins/failure modes · “what broke” · Slack/Stripe/GSuite-class integrations |
| Shlok Mundhra | **Clera** | Engineering craft · agent that actually works end-to-end |

**YC bar:** Their companies *are* AI CSM + agent validation. A thin Gmail→Sheets glue is **their floor**, not the ceiling. We must **exceed**: saga + compensation + dual dry/live + eval mutation + live deploy + ARR-at-risk economics.

---

# 4. Unique job · angle · kill list

**Unique job:** Fail-closed **B2B SaaS churn-save orchestration engine** (not a dashboard, not a CSM brain).

**Angle (what we see they don’t):**  
Multi-app is table stakes. **Commit + prove + compensate** is the product. Intelligence without a latched save still leaks renewals. Reliability is 25% of the score *and* Arga’s company — make it the architecture, not a paragraph.

| Kill | Why |
|---|---|
| Guest-house latch | Wrong ICP for this panel |
| Gmail+Cal+Notion | Tutorial clone |
| Userlens clone | They built it · we are **action+proof** |
| Silent auto-email/refund | Breaks Userlens trust · scary |
| “Eval only” with no save job | Dies usefulness 20% |
| Fake greens / demo data | Instant Arga DQ |

---

# 5. Story · who · market · PMF · GTM · business

## Story
Lean B2B SaaS grows faster than CS headcount. Cancel mail, Stripe `past_due`, buried Slack frustration — signals exist; the **save** still means three manual apps. Half the time one step never happens. AI CSMs *see* risk. Chat agents *claim* action. Nobody trusts an agent that wrote to CRM without IDs. LATCH latches the save with a **saga**, proves side-effects, compensates on failure, and shows the board.

## Who (not mass consumers)

| Role | Pain | LATCH |
|---|---|---|
| CSM / CS lead | Too many accounts · missed saves | Instant multi-app save play + audit |
| Head of CS / founder (buyer) | NRR moves too late | Measurable save plays · trusted agents |
| Eng / RevOps | Demo-only agents | Golden evals · force-fail · compensate |
| SaaS end-user | Indirect | Gets a save call, not silent churn |

**ICP:** US/EU lean B2B SaaS ($1–50M ARR class) on Slack + CRM + Stripe + Gmail. Accra = build base.

## Market (label before raise decks)

| Signal | Class |
|---|---|
| Median NRR often ~106% · elite >120% · valuation tied to retention (McKinsey-class commentary via secondary sources) | DIRECTIONAL |
| SMB churn pain high | DIRECTIONAL |
| CS platforms = crowded **intelligence** | ESTIMATE |
| Userlens buyers exist (their YC claims) | VERIFIED-as-claim |
| Arga ~$10M for agent sandboxes | VERIFIED press |

**Category:** Action+proof layer beside AI CSM — not Gainsight 2.0.

## PMF
- Early: ≥10 CSMs “I’d run this on `#cs` this week” after force-fail demo (**UNVERIFIED** until logged).  
- Working: weekly save plays · board in standup · zero silent half-writes.

## Business model
Hack free → seat/workspace + per-save-play → HubSpot/Salesforce SKU + Eng eval pack.  
Unit: one saved mid-market renewal ($10k–$100k ACV class) pays for the tool many times (**ESTIMATE framing**).

## GTM
Hack → Arga/Lemma interview → 5–10 design partners → Slack-first + Stripe + CRM → force-fail content.

---

# 6. TECHNICAL EMPIRE (rack the notch — YC exceed)

> Prior “Gmail→Slack→Sheets→Cal + asserts” = **floor**. Below = mandatory architecture. Ship as far as possible; submit incomplete Empire over toy.

## 6.1 External apps (all load-bearing · nothing optional)

| # | App | Role |
|---|---|---|
| 1 | **Gmail** | Trigger: cancel / churn language · optional **draft-only** save email (never auto-send) |
| 2 | **Stripe** (test→live later) | Trigger: `customer.subscription.deleted` / `past_due` / `unpaid` · ARR-at-risk from invoice/sub |
| 3 | **Slack** | Side-effect: `#cs` alert with account · ARR · risk · run id · deep link |
| 4 | **HubSpot** (primary CRM) **or** Sheets fallback if HubSpot blocked | Side-effect: deal/ticket/company note · status machine `OPEN_SAVE` |
| 5 | **Google Calendar** | Side-effect: save-call hold for CSM |
| 6 | **Eval / observability surface** | Not “an app” but judged as system: traces · golden · board |

Minimum for rules = 3. **Empire submit target = 5 integrations + eval runtime.**

## 6.2 Complexity layers (what exceeds their floor)

```
┌─ Triggers (fan-in) ─────────────────────────────────────┐
│  Gmail poll/push · Stripe webhook · manual “Replay” UI  │
└───────────────┬─────────────────────────────────────────┘
                ▼
┌─ RiskCompiler ──────────────────────────────────────────┐
│  Normalize → account_id · ARR_at_risk · evidence pack    │
│  LLM may draft reason; asserts use deterministic fields │
└───────────────┬─────────────────────────────────────────┘
                ▼
┌─ PolicyEngine (fail-closed) ────────────────────────────┐
│  allowlists · max ARR auto · dry_run vs live · no send  │
│  Idempotency key = hash(trigger_id)                     │
└───────────────┬─────────────────────────────────────────┘
                ▼
┌─ SavePlay Saga (orchestrator) ──────────────────────────┐
│  Step graph with deps:                                  │
│    S1 Slack alert ──┐                                   │
│    S2 CRM upsert ───┼─→ S3 Calendar hold                │
│    S4 Gmail DRAFT ──┘   (parallel where safe)           │
│  Each step: attempt · capture ID · write trace          │
│  On fail: compensating actions reverse prior steps      │
│    e.g. delete Cal event · CRM status=FAILED · Slack    │
│         thread “UNLATCHED — compensated”                │
└───────────────┬─────────────────────────────────────────┘
                ▼
┌─ EvalRunner (Arga language) ────────────────────────────┐
│  Assert IDs · state machine · golden jobs · mutations   │
│  Force-fail suite · flake budget · pass-rate table      │
│  Board: GREEN n/n or RED UNLATCHED                      │
└───────────────┬─────────────────────────────────────────┘
                ▼
┌─ Live Deploy ───────────────────────────────────────────┐
│  Public URL · “Run fixture” · “Inject fail Slack” ·     │
│  Trace viewer judges can click without asking Henry     │
└─────────────────────────────────────────────────────────┘
```

## 6.3 Why this is technically impressive (say it in README)

| Primitive | Why YC brains notice |
|---|---|
| **Saga + compensation** | Distributed multi-app writes without orphan CRM rows |
| **Idempotent replays** | Same Stripe event ≠ double Slack spam |
| **Dual mode dry/live** | Speaks Arga “safe to fail” without claiming we *are* Arga |
| **ARR-at-risk economics** | Agent does something *valuable*, not busywork |
| **Mutation / force-fail eval** | Reliability as code, not vibes |
| **Full trace store** | Every tool call · latency · ID · compensate path |
| **Live deploy poke** | Top-5 will test — must survive stranger hands |

## 6.4 Eval harness (25% — non-negotiable)

| Suite | What |
|---|---|
| Golden G1 | Fixture cancel email → all side-effect IDs |
| Golden G2 | Stripe test cancel → same + ARR field |
| Golden G3 | Force-fail Slack mid-saga → compensate → RED |
| Golden G4 | Replay same idempotency key → no duplicate Slack |
| Mutation | Flip assert off → CI must fail (self-DQ prevention) |
| Metrics | Pass rate · p95 step latency · compensate success rate |

## 6.5 Deletion / exceed tests

| Unplug | Expected |
|---|---|
| Slack | Compensate · RED |
| HubSpot/Sheets | RED · no fake CRM |
| Calendar | RED or compensate prior |
| Stripe signature | Reject webhook |
| Eval asserts | CI red |
| Deploy auth leak | Document scopes · least privilege |

---

# 7. Demo video law (2:00 · ~40% of shortlist weight INFERRED from Henry brief)

**Must feel live.** No slide-deck cosplay.

| 0:00–0:15 | Problem: blind churn · NRR · multi-app mess |
| 0:15–0:35 | Live deploy: fire Stripe test **or** fixture email on camera |
| 0:35–1:10 | Watch Slack + CRM + Cal update **live** · show IDs on board |
| 1:10–1:35 | Inject fail · saga compensates · RED `UNLATCHED` |
| 1:35–1:50 | Golden pass-rate table · one-line company |
| 1:50–2:00 | Repo + deploy URL on screen · “test it yourselves” |

Audio clear · cursor large · no dead air · clock optional.

---

# 8. Live deploy law (top-5 will poke)

Public URL with:
1. **Run fixture save play** (one click)  
2. **Inject Slack failure**  
3. **Trace / board** visible without login (or password in README)  
4. OAuth apps pre-connected to **demo workspace** (Henry’s test Slack/Sheet/Cal/Stripe)  
5. Rate-limit / kill switch so judges can’t nuke prod

If deploy is flaky → shortlist dies. Treat uptime as part of Technical 30%.

---

# 9. README / AI-shortlist law (thorough · perfect)

README sections **in this order** (submission form + AI parse):

1. **Title + one sentence**  
2. **Problem** (economic)  
3. **What LATCH does** (saga · fail-closed · human outbound)  
4. **External apps** (table)  
5. **Architecture** (diagram + primitives list)  
6. **Setup** (env · OAuth · Stripe webhook · one-command)  
7. **How we tested reliability** (golden table · force-fail · pass rates · commands)  
8. **Demo video link** (2 min · unlisted OK if accessible)  
9. **Live deploy link** + how to poke  
10. **Prior Work honesty**  
11. **Risks labeled**  
12. **License / contact**

Keywords natural: fail-closed, saga, compensating transaction, side-effect assert, golden job, churn-save, ARR-at-risk, multi-app, reliability, evaluation, idempotency, dry-run, trace.

No fluff. No “revolutionary.” Short sentences for AI skim.

Reliability brief may be `docs/RELIABILITY.md` **or** README §7 — but content must exist.

---

# 12 frameworks (hardcore)

| # | Lens | LATCH |
|---|---|---|
| 1 | Startuphacks | NRR defense for lean SaaS |
| 2 | DEMON | Live saga + force-fail in 2 min |
| 3 | YC | Judges = Userlens/Arga ICP |
| 4 | Bootstrap | Test Stripe · demo workspace |
| 5 | Market | CS intelligence crowded · action+proof open |
| 6 | Moonshot | Standard latch beside every AI CSM |
| 7 | Traction | Deploy + eval rates + design partners |
| 8 | Compliance | Draft-only customer mail · scopes least privilege |
| 9 | SEO / AI shortlist | README law above |
| 10 | JUDGE FIT | Economics · proof · craft |
| 11 | WINNER DELTA | Saga+compensate+ARR ≠ glue demos |
| 12 | REPLAY PROOF | One-click fixture · `npm test` goldens |

---

# 11. Build order (Empire · ignore “too late”)

| Block | Ship |
|---|---|
| 0 | Repo · README skeleton · OAuth apps · Slack · Sheet/HubSpot · Cal · Stripe webhook · deploy shell |
| 1 | RiskCompiler + PolicyEngine + idempotency |
| 2 | Saga steps + compensation |
| 3 | EvalRunner goldens G1–G4 + mutation |
| 4 | Live UI board + inject-fail + traces |
| 5 | ARR-at-risk from Stripe · HubSpot depth |
| 6 | Demo film · reliability fill · submit form |

Submit mid-block if needed — **never** ship tutorial-only.

---

# 12. Pre-flight checklist

- [ ] Public repo accessible  
- [ ] README complete (form fields)  
- [ ] ≥3 apps live · target 5  
- [ ] Golden + force-fail recorded  
- [ ] 2-min demo uploaded · link in README  
- [ ] Deploy URL works for stranger  
- [ ] No auto customer send  
- [ ] Form submitted **≤ 4:00 PM PT**

---

# 13. Identity

Henry Sam Marfo · Accra · @henrysammarfo · github.com/henrysammarfo  
Prior: GROUNDS (eval) · AXIS (ship) — taste, not this product.

---

# 14. Verdict vs “current level”

| Before | Now |
|---|---|
| Linear notify glue + asserts | **Saga orchestration + compensation + dual-mode + ARR economics + live poke deploy + mutation eval** |
| Their floor | Designed to **exceed** Arga/Userlens expectations while staying fundable |

If a peer ships “3 Composio calls + screenshot,” we look like a different species. If a peer ships full Arga-quality agent under test — we still win on **economic save-play + compensate + stranger-deployable product**.

# CLAUDE.md — Willow

> Project context for Claude Code. Read this before making changes.
> The **Hard Constraints**, **Verification Principle**, and **Crisis Path** are load-bearing — violating them breaks the product, not just the code.

---

## 0. Working on This Codebase — Read First

This project is worked on by multiple AI agents across multiple sessions. **Changes made without coordination cause real damage** — overwriting each other's work, re-litigating settled decisions, and breaking the safety path.

### Before you change anything

1. **Read this entire file.** Not just the section that seems relevant. Decisions in §13 explain *why* things are the way they are — changing something without reading that context is how you break things that look like they can be changed.
2. **Read the relevant source files.** Check what's actually in the code before assuming something isn't built yet. §10 lists what's done and what isn't.
3. **Check §13 (Decision Log).** If a decision is logged there, it was made deliberately. Do not reverse it without a clear reason, and if you do reverse it, log the new decision with your reasoning.

### What you may change freely
- Bug fixes with no architectural impact
- UI copy and styling that doesn't touch safety-path screens (CrisisView)
- Adding new files that don't affect existing ones
- Tests

### What requires care
- Anything touching `CrisisDetector`, `CrisisView`, or the crisis path — this is safety-critical
- Changes to `AIConversationService` system prompt — the hard constraints in §2 must hold
- Changes to `AppStore.sendMessage` flow — crisis check must remain synchronous and first
- Any new AI model, vendor, or API key — log it in §13 and update §7

### What you must not do
- Remove or weaken the synchronous crisis check
- Change the AI's voice to be advisory, diagnostic, or conversational in a therapeutic sense
- Add vendor keys to committed files
- Make architectural changes without updating §10, §13, and the relevant section of this file

### After you make changes
Update this file in the same commit. Specifically: §5 if the data flow changed, §7 if the stack changed, §10 if the file structure changed, §13 with a new decision log entry if you made an architectural choice. A future AI (or human) picking this up should be able to read CLAUDE.md and know exactly where things stand.

---

## 1. What Willow Is

Willow is a **translation layer between a patient's raw journaling and their human therapist**. It surfaces emotional patterns; it never gives advice.

**Two surfaces, one backend:**
- **Patient app** (iOS, Swift / SwiftUI) — private journaling + passive insight generation
- **Therapist app** (Web, React / Next.js) — structured pre-session insights

**Willow is not:** a journaling app, an AI therapist, a chatbot, a wellness coach, or a diagnostic tool.

The litmus test for any feature:
> *"Does this help the user understand themselves AND make their real therapy more effective?"*
> If not — don't build it.

---

## 2. Hard Constraints

### The AI MUST
- Extract emotional patterns, recurring triggers, behavioural cycles
- Produce structured summaries (emotions, triggers, patterns, trends)
- Defer interpretation to the human therapist

### The AI MUST NOT
- Give advice, suggestions, or coping strategies
- Diagnose, label, or pathologise
- Roleplay as a therapist, friend, or confidant

> **Note on the conversation layer:** The iOS app has a live chat surface (Layer 1, see §5 and §13). This is not a contradiction — the conversation layer is a *reflective journaling companion* that asks open questions and listens. It does not interpret, advise, or analyse. Insight extraction happens in Layer 2, post-conversation.

### When the user seeks advice → standard redirect
> *"This sounds important — it could be helpful to explore this with your therapist."*

### Crisis path (self-harm, suicidal ideation, abuse) — must exist before launch
The advice redirect is **not enough** for crisis content, and a pattern-extraction system will encounter it. Required behaviour:
- Surface region-appropriate hotlines immediately (UK default: Samaritans 116 123, Shout 85258)
- Soft-flag the linked therapist (with consent obtained at onboarding)
- Never gate access to journaling behind a crisis modal — that punishes honesty
- Keep the user in control of next steps; never auto-contact emergency services

---

## 3. Verification Principle

> **No insight reaches a human — patient or therapist — from a single source.**

Willow treats AI output the way a careful clinician treats a single test result: useful, but never trusted alone. Anything surfaced as an insight has been through more than one check before it's shown.

What "more than one check" looks like depends on the stage — sometimes two models compare notes, sometimes a fast classifier gates a slower one, sometimes the patient confirms *"yes, that's what I meant."* The mechanism varies. The posture doesn't.

**This shapes everything but controls nothing:**
- **Copy** is written as observation, never conclusion. *"Anxiety appears in 4 of the last 7 entries"* — not *"Your patient is anxious."*
- **UI** treats uncertainty as a feature: low-confidence insights are shown as such, not hidden.
- **Data model** carries confidence and provenance on every insight, even when the UI doesn't display them.
- **Anything generated is a candidate, not a verdict** until something else has confirmed it — another model, the patient, or time (a pattern that holds across multiple entries).

When in doubt, ask: *"Would I be comfortable with a therapist acting on this if it turned out to be wrong?"* If not, it needs another check before it ships to the therapist view.

---

## 4. User Roles & Permissions

### Patient
- Owns all raw data
- Sees their own insights and a preview of *exactly what the therapist will see*
- Can revoke sharing at any time (revocation removes from therapist view going forward)
- Can delete account → hard delete within 30 days

### Therapist
- Receives **only structured insights**, never raw entries (unless the patient explicitly opts in per-entry)
- Cannot export patient data outside the platform
- Must be verified before any patient can link to them
- Can be unlinked by the patient at any time, no friction

---

## 5. Core Data Flow

```
User types message
        ↓
CrisisDetector.isCrisis() — synchronous, local ──→ CrisisView if triggered
        ↓
Layer 1: Haiku 4.5 streaming conversation
  ↕ (6–10 exchanges, AI ends with <<END>>)
        ↓
Layer 2: [TBD — to be designed]
        ↓
Layer 3: 4 models queried in parallel
  Each receives: conversation transcript + PersonalContext (historical patterns)
  Round 1 — independent, no cross-model context
  ┌─ Gemini → emotional depth lens
  ├─ Grok   → triggers & context lens
  ├─ Claude → behavioural patterns lens
  └─ GPT    → longitudinal signals lens
        ↓
  Consensus check: do all 4 agree? (4/4 required)
  ├── YES → proceed to patient view ✅
  └── NO  → Round 2: each model receives the other 3's Round 1 output
              ↓
            Weighted synthesis agent (Opus 4.7, extended thinking)
            Reviews all 8 outputs (4×R1 + 4×R2)
            ├── Weighted consensus → insight surfaced to patient
            └── No consensus → "This sounds important — speak to your therapist"
        ↓
Confirmed insights update PersonalContext
        ↓
Insights stored as candidates (confidence + provenance + round reached)
        ↓
Patient reviews → confirms → therapist view updates
```

The crisis check is **always synchronous and local** — it runs before the network call, with no latency dependency. Everything else can be async.

**Why 4 different lenses:** Identical prompts across 4 models produces correlated outputs. Different lenses (emotional depth, triggers, behaviour, longitudinal) mean each model is genuinely looking at different dimensions. Convergence from 4 angles is a stronger signal than 4 identical analyses agreeing.

**Why historical context matters:** Without it, every conversation starts cold. With PersonalContext, a model can identify that anxiety has appeared in 9 of 14 conversations, not just today's. Longitudinal patterns are the most clinically meaningful signal. Models are explicitly instructed: *"treat this as context, not conclusion — this conversation may show genuine change."*

**Why 4/4 for Round 1:** Four independent vendors, different training data, different architectures, different lenses. Unanimous agreement without shared context is the strongest possible automated signal. Any disagreement triggers Round 2.

### PersonalContext — what is tracked

```
PersonalContext (patient-owned, consent-gated, fully deletable):
├── recurringEmotions   → emotion + frequency across N conversations
├── knownTriggers       → context/situation → emotional response mappings
├── behaviouralCycles   → recurring patterns (e.g. avoidance before difficulty)
├── protectiveFactors   → what correlates with improved entries
├── trendDirection      → is a pattern strengthening, weakening, or stable?
└── conversationCount   → N total conversations, date of last
```

**Privacy rules for PersonalContext:**
- Patient can view their full context at any time — no hidden profile
- Fully deletable on request (right to erasure applies)
- Explicit consent required at onboarding before any context is built
- Cannot cross the patient → therapist boundary without patient review and approval
- Stored as structured summaries only — raw conversation text is never retained in context

**Current implementation status:**
- ✅ CrisisDetector (local keyword check)
- ✅ CrisisView defaults to UK resources (Samaritans 116 123, Shout 85258, 999)
- ✅ Layer 1 conversation (Haiku 4.5, streaming)
- ✅ Native SwiftUI patient mockup: Home, check-in, chat, reminders, settings, history, booking, therapist link, Willow companion, font/display controls, wind-down mode
- ⬜ Layer 2 — TBD
- ⬜ Layer 3 — 4-model parallel query + two-round consensus pipeline
- ⬜ Insight storage and patient review UI
- ⬜ Therapist view data feed

---

## 6. The Willow Tree (Engagement Mechanic)

A living tree that reflects journaling consistency: vibrant when the user journals regularly, faded during gaps.

**Design rules:**
- No punishment, no streaks, no guilt language
- Calm, reflective tone in all copy
- Encourages consistency through emotional attachment, not pressure

**Watch this carefully** — see §12. Wilting metaphors can induce guilt in exactly the population most likely to use Willow. The mechanic needs design discipline to stay on the right side of the line.

---

## 7. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Patient app | Swift + SwiftUI | iOS 17+ (built against iOS 26.4 SDK) |
| Therapist web | Next.js (App Router) + React + TypeScript | Tailwind, minimal aesthetic |
| Backend | **TBD** — Python/FastAPI vs Node | Python preferred for AI proximity (see §12) |
| Database | PostgreSQL | Sensitive fields encrypted at rest |
| AI — conversation layer | Anthropic Haiku 4.5 (`claude-haiku-4-5-20251001`) | Streaming, real-time, in-app |
| AI — Layer 2 | TBD | To be designed |
| AI — Layer 3 Round 1 | Gemini + Grok + Claude + GPT (parallel) | 4 independent vendors, no shared context |
| AI — Layer 3 Round 2 | Same 4 models, cross-context | Each sees the other 3's Round 1 output |
| AI — synthesis agent | Claude Opus 4.7 with extended thinking | Weighted decision across all 8 outputs; thinking budget 8–10k tokens |
| Voice | On-device transcription where possible | Cloud transcription = extra sub-processor |

> **API keys (development):** Keys live in `ios/Willow/Config/APIConfig.swift` (gitignored). **Must move to a backend service before production** — never ship client apps with embedded vendor keys.

---

## 8. Privacy & Compliance

- End-to-end encryption where possible; at-rest + in-transit otherwise
- User controls all sharing, always
- GDPR compliant (UK GDPR + Data Protection Act 2018)
- No data sold, ever
- Every external AI provider = a sub-processor that must be disclosed
- Mental-health-adjacent products may have additional regulatory exposure (CQC, MHRA classification) — get advice before launch

> Trust is the product.

---

## 9. Coding Conventions

- **Swift:** SwiftUI-first, MVVM, async/await over completion handlers, no Storyboards
- **TypeScript:** strict mode on, no `any`, prefer functional components with hooks
- **Python (if chosen):** type hints everywhere, ruff + mypy, pydantic for I/O models
- **Naming:** `Insight`, `Entry`, `Pattern`, `Trigger`, `Emotion` are domain types — don't invent synonyms
- **No PII in logs.** Ever. Use opaque IDs.
- **Insights carry confidence and provenance** in the data model, even if the UI hides them

---

## 10. Suggested File Structure

```
Willow/
├── Willow/                         # iOS patient app (Swift / SwiftUI)
│   ├── Config/
│   │   ├── APIConfig.swift         # API keys — gitignored, dev only
│   │   └── APIConfig.example       # committed template, not compiled as Swift
│   ├── Services/
│   │   ├── AIConversationService.swift   # Layer 1: Haiku 4.5 streaming chat
│   │   └── CrisisDetector.swift          # Synchronous local crisis check
│   ├── Models/Models.swift         # Domain types: CheckIn, ChatMessage, ConversationPhase
│   ├── Store/AppStore.swift        # State + sendMessage async pipeline
│   └── Views/
│       ├── Chat/ChatView.swift     # Conversation UI with end-state handling
│       ├── Crisis/CrisisView.swift # Crisis resources sheet
│       ├── CheckIn/                # Mood check-in flow
│       ├── Patient/                # Native SwiftUI patient mockup surfaces
│       │   ├── BookSessionView.swift
│       │   ├── PatientHistoryView.swift
│       │   ├── PatientSettingsView.swift
│       │   ├── RemindersView.swift
│       │   ├── TherapistLinkView.swift
│       │   └── WillowCompanionView.swift
│       ├── Shared/PatientComponents.swift # Patient mockup UI components
│       └── ...
├── therapist-dashboard/            # Static HTML prototype (not production)
└── CLAUDE.md                       # this file
```

**Not yet built:**
- `InsightPipelineService.swift` — GPT extraction + Grok verification (Layer 2)
- Backend API — keys currently called direct from app (dev only)
- Persistence — all state is in-memory
- Real HealthKit / notification / booking integrations — patient screens are currently mock-data UI
- Pattern engine — cross-conversation clustering
- Therapist view data feed

**Supporting documents:**
- `STATUS.md` — what's done, in progress, and next; AI agents claim tasks here before starting
- `docs/safety.md` — crisis path detail, keyword list, what's still missing, rules for changing safety code
- `docs/privacy.md` — data handling, sub-processors, GDPR obligations, what must be done before launch

---

## 11. Domain Glossary

- **Entry** — a single piece of journaling (text or voice transcript)
- **Insight** — a structured observation extracted from one or more entries
- **Pattern** — a repeated emotion / trigger / behaviour across entries over time
- **Trigger** — a context (work, social, family, etc.) associated with an emotion
- **Share** — the patient's act of approving an insight for therapist visibility
- **Link** — the relationship between a patient and a verified therapist

---

## 12. Open Questions & Reflections

These are unresolved. Most need a decision before MVP, some before launch.

**Verification scope.** §3 is the principle, but where is the floor? Does *every* insight need cross-checking, or only those shared with the therapist? Suggested default: minimum two-source for anything that crosses the patient → therapist boundary; single-source acceptable for the patient's own view.

**Crisis classification.** Who builds and maintains it? False negatives are catastrophic; false positives erode trust. This may be the one place where a third independent check (and a clinical advisor) is non-negotiable.

**Therapist verification.** How do you confirm someone is a real, licensed therapist? Manual review at first, ideally regulator API later (UK BACP / HCPC register lookup). Without this, the "therapist sees insights" model is a vector for harm.

**Patient–therapist pairing.** Most likely model: therapist generates an invite code, patient enters it. Alternatives: marketplace (off-brand for Willow), invite link (less secure). Decide early — it shapes onboarding.

**Willow Tree, more honestly.** Engagement mechanics in mental health have mixed evidence. Streak-based and decay-based mechanics can hurt users with anxiety or perfectionism. Options to consider:
- A tree that *only* grows, never wilts (gain framing, no loss framing)
- A tree that resets gently with no visual decay (a "fresh start," not "you failed")
- Drop the metaphor entirely; use a calm activity heatmap

Worth user-testing with people in active therapy before committing.

**The AI's voice to the patient.** Spec says AI doesn't reply conversationally. Confirm: when an insight is surfaced for patient confirmation, is the copy purely descriptive (*"Anxiety appears connected to work mentions"*), or is there any reflective language? Either is defensible; pick one and stick to it.

**LLM provider strategy.** Each external API = another sub-processor in the privacy notice. Local/open-source models for first-pass stages reduce both cost and disclosure surface. Cloud LLMs reserved for the cases that genuinely need them.

**Voice journaling privacy.** On-device transcription (Whisper local, Apple's Speech framework) is materially more private than cloud. Worth the engineering cost given Willow's positioning.

**Therapist incentive.** Why does a busy therapist adopt this? Time saved before sessions is the obvious answer. Worth validating with 3–5 actual therapists before building the web app.

**Liability and insurance.** Mental-health-adjacent products carry real liability even with disclaimers. Get advice before public launch. Terms of Service need careful work.

**Clinical evidence.** Is there research showing AI-prepared session summaries improve therapy outcomes? If yes, lead with it. If no, frame Willow honestly as a hypothesis to be tested, not a proven intervention.

---

## 13. Decision Log

**2026-05-02 — Historical PersonalContext added to pipeline**
Each Layer 3 model receives the conversation transcript plus a structured PersonalContext built from prior confirmed conversations. This enables longitudinal pattern detection — "anxiety in 9 of 14 conversations" is a meaningfully stronger signal than "anxiety today." Context is patient-owned, consent-gated, fully deletable, and stored as structured summaries only (no raw text retained). Models are explicitly told to treat it as context not conclusion to avoid anchoring that masks genuine change.

**2026-05-02 — Full pipeline architecture (supersedes earlier two-layer entry)**
Layer 1: Haiku 4.5 streaming conversation. Ends with `<<END>>`. Layer 2: TBD. Layer 3: four models (Gemini, Grok, Claude, GPT) queried in parallel with no shared context (Round 1). If all 4 agree → insight passes. If any disagree → Round 2: each model sees the other 3's Round 1 output and re-evaluates. A weighted synthesis agent then reviews all 8 outputs and makes a final call. If still no consensus → user is directed to their therapist rather than receiving a potentially wrong insight.

Rationale: 4/4 unanimous agreement from four independent vendors with no shared context is the strongest possible automated signal. Round 2 with cross-context mirrors a clinical panel review — experts who can revise their position after seeing peer reasoning. The fallback to a human (therapist) when the AI panel can't agree is the right safety posture for a mental-health product.

Synthesis agent model: **Claude Opus 4.7 with extended thinking** (`claude-opus-4-7`, thinking budget 8,000–10,000 tokens). Chosen because this is the highest-stakes decision in the pipeline — it determines whether an insight reaches a patient or is held back. Extended thinking gives Opus time to reason carefully across all 8 inputs rather than pattern-matching to a fast answer. Cost and latency (15–30s) are acceptable because this fires once per completed conversation. Anthropic is now present at Layer 1 (Haiku) and synthesis — the 4 independent Round 1/2 models provide the cross-vendor check; Opus arbitrates the result.

**2026-05-02 — Crisis detection is synchronous and local**
`CrisisDetector.isCrisis()` runs as a keyword check on the device before any API call. If triggered, `CrisisView` is shown immediately. The AI never sees a message that would have triggered crisis — the local check intercepts it first. This means no latency on the safety path and no dependency on network availability.
Alternatives considered: letting the AI detect crisis in its response (rejected — too slow, too unreliable for a safety-critical path).

**2026-05-02 — API keys in client app (dev only)**
`APIConfig.swift` holds keys directly for local development. This file should be gitignored before the repo is shared or made public. All three keys (Anthropic, OpenAI, xAI) must move to a backend proxy before any real users touch the app.

**2026-05-02 — Native SwiftUI patient mockup**
The patient-side design mockup is now implemented inside the SwiftUI app rather than as a browser prototype. It adds a five-tab shell (Home, Check-in, Chat, Reminders, Settings) and mock-data screens for history, booking, therapist linking, Willow companion engagement, appearance/font controls, privacy sharing toggles, medication/wellness reminders, and wind-down mode. This is a UX prototype layer only: persistence, HealthKit, local notifications, real booking, and backend consent audit trails are still not wired. Crisis detection remains synchronous/local before network calls, and coping plans remain therapist-authored rather than AI-generated.

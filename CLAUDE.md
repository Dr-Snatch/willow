# CLAUDE.md — Willow

> Project context for Claude Code. Read this before making changes.
> The **Hard Constraints**, **Verification Principle**, and **Crisis Path** are load-bearing — violating them breaks the product, not just the code.

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
- Respond conversationally to entries (it analyses; it doesn't reply)

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
Patient writes entry (text or voice)
        ↓
Entry encrypted client-side, uploaded
        ↓
Crisis check (synchronous) ──→ Safety path if triggered
        ↓
Insight pipeline (sentiment, emotion, triggers) — verified per §3
        ↓
Pattern engine clusters across recent entries — verified per §3
        ↓
Insights stored as candidates
        ↓
Patient reviews → confirms → therapist view updates
```

The crisis check is **always synchronous** — it must fire before the user closes the app. Everything else can be async.

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
| Patient app | Swift + SwiftUI | iOS 17+ |
| Therapist web | Next.js (App Router) + React + TypeScript | Tailwind, minimal aesthetic |
| Backend | **TBD** — Python/FastAPI vs Node | Python preferred for AI proximity (see §12) |
| Database | PostgreSQL | Sensitive fields encrypted at rest |
| AI layer | Multi-source by default (see §3) | Specific models are an implementation detail |
| Voice | On-device transcription where possible | Cloud transcription = extra sub-processor |

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
willow/
├── ios/                     # Patient app (Swift / SwiftUI)
├── web/                     # Therapist app (Next.js)
├── backend/                 # API + AI pipeline
│   ├── api/                 # HTTP layer
│   ├── pipeline/            # Insight extraction
│   ├── safety/              # Crisis detection (isolated, audited)
│   └── verification/        # Cross-checks (§3)
├── shared/                  # Type definitions shared across surfaces
└── docs/
    ├── CLAUDE.md            # this file
    ├── safety.md            # crisis path detail
    └── privacy.md           # data handling detail
```

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

(Empty — populate as architectural decisions are made. Each entry: date, decision, alternatives considered, reasoning.)

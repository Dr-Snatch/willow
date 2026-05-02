# Willow — Project Status

> This file is the coordination point for all contributors — human and AI.
> **Before starting any work:** check "In progress" and claim your task.
> **After finishing:** move it to "Done" and update CLAUDE.md if anything architectural changed.

Last updated: 2026-05-02

---

## In progress

_Nothing claimed — add your task here before you start work._

Format: `- [ ] Brief description of task — [who/what is working on it]`

---

## Done

- [x] iOS app scaffold — SwiftUI, MVVM, no Storyboards
- [x] Onboarding flow — name capture, first-run state
- [x] Check-in flow — mood scale (1–5) + free-text note
- [x] CrisisView — hotlines sheet (988, Crisis Text Line, 911), manual trigger button
- [x] CrisisDetector — synchronous local keyword check before any API call
- [x] Layer 1 conversation — Haiku 4.5 streaming chat (`AIConversationService.swift`)
- [x] AppStore async pipeline — real `sendMessage` replacing all mock responses
- [x] Conversation end detection — `<<END>>` signal, `ConversationPhase` state, end-state UI
- [x] API key safety — `APIConfig.swift` gitignored, template committed
- [x] CLAUDE.md §0 — multi-AI coordination rules
- [x] Native SwiftUI patient mockup — Home, History, Booking, Companion, Reminders, Settings, Appearance, Font, Privacy, Therapist Link, Wind-down
- [x] Patient reminder mockup — medication timing locked to clinician recommendation, wellness reminders with editable times/days, custom reminders
- [x] UK crisis hotline defaults — Samaritans 116 123, Shout 85258, emergency services 999
- [x] Build hygiene — `APIConfig.template.swift` renamed to `APIConfig.example` so the target no longer compiles duplicate config enums

---

## Up next (prioritised)

1. **Layer 2** — TBD (design conversation needed before building)
2. **Layer 3 insight pipeline** — `InsightPipelineService.swift`: 4 models (Gemini, Grok, Claude, GPT) in parallel → consensus check (4/4) → if no consensus: Round 2 with cross-context → weighted synthesis agent → insight or therapist redirect
3. **Insight display UI** — post-conversation pattern reveal for patient: observational language, confidence shown, nothing diagnostic
3. **Region-aware crisis resources** — CrisisView now defaults to UK resources; region detection / localisation still needed before launch
4. **Persistence** — conversations and insights are in-memory only; needs local storage (SwiftData or CoreData)
5. **Backend proxy** — API keys must move off device before any real users; Python/FastAPI preferred (see CLAUDE.md §7)
6. **Patient consent persistence** — sharing toggles exist in the SwiftUI mockup, but consent is still in-memory and not auditable
7. **Pattern engine** — cross-conversation clustering of insights; depends on persistence being in place
8. **Therapist dashboard** — wire structured insights to the web app; currently a static HTML prototype

---

## Blocked / needs a decision

- **Therapist verification** — how do we confirm someone is a licensed therapist? Manual review at first? BACP/HCPC API? Unblocks: any patient–therapist linking work.
- **Patient–therapist pairing** — invite code is the assumed model; confirm before building onboarding for it.
- **Willow Tree mechanic** — engagement feature; has design risk (see CLAUDE.md §12). Needs user-testing before building.
- **Production scope for patient mockup** — new SwiftUI patient screens are mock-data UX surfaces; persistence, backend APIs, HealthKit, notifications, and real booking are not wired yet.

---

## How AI agents should use this file

1. Read the whole file before starting.
2. Add your task to **In progress** with a short description before writing any code.
3. If you finish a task, move it to **Done**.
4. If you discover something is blocked or needs a decision, add it to the blocked section.
5. If your work changes the architecture, file structure, or AI pipeline — update CLAUDE.md §5, §7, §10, §13 in the same commit.
6. Do not start work on anything already listed in **In progress** — check first, ask if unclear.

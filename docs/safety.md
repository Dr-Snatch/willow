# Willow — Safety & Crisis Path

> This document covers the crisis detection and safety path in detail.
> The code that implements this path is safety-critical. Read this before touching any of it.
> See also: CLAUDE.md §2 (Hard Constraints), §0 (what requires care before changing).

---

## Why this exists

Willow is a journaling app used by people in active therapy. Some of those people will write about self-harm, suicidal ideation, or abuse. A pattern-extraction system that encounters this content and does nothing — or worse, responds analytically — causes real harm.

The crisis path is not a feature. It is a minimum bar for responsible operation.

---

## Current implementation

### 1. CrisisDetector (`Services/CrisisDetector.swift`)

A synchronous, local keyword check that runs **before any network call**.

```
User sends message
    → CrisisDetector.isCrisis(text)   ← runs here, on device, no latency
    → if true: showCrisisSheet = true, return (message never reaches API)
    → if false: proceed to AIConversationService
```

**Why synchronous and local:**
- No network dependency on the safety path
- Zero latency — crisis resources appear instantly
- The AI never sees the message, so it cannot respond to it analytically

**Current keyword list** (see `CrisisDetector.swift` for canonical list):
Covers suicide, self-harm, expressions of wanting to die, and related phrases. Deliberately broad — false positives (showing the crisis sheet unnecessarily) are far preferable to false negatives (missing someone in crisis).

**Known limitations:**
- Keyword matching only — no semantic understanding. Someone describing a past crisis, quoting a book, or asking hypothetically will trigger it.
- English only. No other language support.
- The list needs clinical review before launch. It was written by engineers, not clinicians.
- No threshold — a single keyword match triggers. This is intentional conservatism.

### 2. CrisisView (`Views/Crisis/CrisisView.swift`)

A sheet that surfaces immediately when the detector fires.

**Current resources shown:**
- 988 Suicide & Crisis Lifeline (US) — call or text
- Crisis Text Line — text HOME to 741741 (US)
- Emergency Services — 911 (US)
- "Notify Dr. Rivera" button — currently dismisses the sheet; **therapist notification is not yet implemented**

**What it must not do:**
- Gate access to journaling. The sheet can be dismissed; the user can keep writing.
- Auto-contact anyone. The user chooses every next step.
- Replace the crisis resources with AI-generated content.

---

## What is not yet built

### Therapist soft-flagging
When a user encounters the crisis path, their linked therapist should receive a soft flag (not an alarm — a note that says something like "your patient may have had a difficult session"). This requires:
- Consent obtained at onboarding ("If Willow detects a crisis, your therapist will be notified")
- A linked therapist to notify (patient–therapist pairing not yet built)
- A backend to send the notification (no backend yet)

The "Notify Dr. Rivera" button in CrisisView is a placeholder — it currently just dismisses the sheet.

### UK crisis resources
CrisisView shows US resources. The primary market may be UK. Before launch, the app needs:
- Samaritans: 116 123 (UK, free, 24/7)
- Shout: text SHOUT to 85258 (UK, free, 24/7)
- Region detection to show the right defaults

### Semantic crisis detection (Layer 2)
The current keyword check is the floor, not the ceiling. The insight pipeline (Layer 2, not yet built) should include a semantic crisis check — a model pass that can detect crisis context even when trigger words aren't used. This is a second layer, not a replacement for the keyword check.

---

## Rules for changing this code

These are non-negotiable. See also CLAUDE.md §0.

1. **Do not remove or weaken `CrisisDetector.isCrisis()`.** It can be improved (more phrases, better coverage) but never removed or made optional.
2. **The crisis check must remain the first thing in `AppStore.sendMessage`.** It fires before the API call. Do not move it after the API call.
3. **Do not add a dismiss-without-seeing-resources path to CrisisView.** The user must see the resources before they can return to journaling.
4. **Do not make the crisis sheet modal and blocking.** The user can dismiss it. Blocking exit punishes honesty and may prevent someone from continuing to journal.
5. **If you change the keyword list, document why.** Removals especially — a phrase that seems redundant may be the only thing that catches a specific expression.
6. **Get clinical review before launch.** The crisis path needs a mental health professional to review both the keyword list and the UX before real users encounter it.

---

## Open questions

- **False positive UX.** When someone triggers the crisis sheet by accident (e.g. writing about a character who has suicidal thoughts), how should the UX recover? Current behaviour: sheet is dismissible, journaling continues. Is this enough?
- **Repeated triggers.** If someone triggers the crisis path multiple times in a session, does the sheet become noise? Should there be a "you've seen this" variant?
- **Who maintains the keyword list?** Clinician, engineer, or both? Needs an owner before launch.
- **Third independent check.** CLAUDE.md §12 notes crisis classification may be the one place where a third independent check (and a clinical advisor) is non-negotiable. The current implementation has one check (local keywords). Layer 2 should add a second. A third — clinical human review of the keyword list — is still needed.

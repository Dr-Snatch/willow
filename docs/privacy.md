# Willow — Privacy & Data Handling

> This document covers what data Willow collects, where it goes, and what needs to happen before launch.
> See also: CLAUDE.md §4 (User Roles & Permissions), §8 (Privacy & Compliance).

**The short version:** Trust is the product. Every data decision should pass the test: "Would the person writing this be comfortable knowing exactly what happens to their words?"

---

## What is collected

| Data | Where it lives now | Sensitivity |
|---|---|---|
| User's name | In-memory (`AppStore.userName`) | Low |
| Mood check-ins (score + note) | In-memory (`AppStore.checkIns`) | Medium |
| Conversation messages | In-memory (`AppStore.messages`) | **High** — mental health content |
| Insights (not yet built) | Not yet built | **High** — clinical-adjacent |
| PersonalContext (not yet built) | Not yet built | **Very high** — persistent psychological profile |

### PersonalContext — special handling required

PersonalContext is a longitudinal summary of a user's emotional patterns, triggers, and behavioural cycles built up across multiple conversations. It is the most sensitive data Willow holds.

**Rules:**
- **Consent before creation.** Must be explicitly consented to at onboarding: *"Willow builds a picture of your patterns over time. You can view, edit, or delete this at any time."*
- **Patient visibility.** User can see their full PersonalContext in the app at any time — no hidden profile building.
- **Deletable on demand.** Deletion must be immediate and complete — this is the most likely subject access request Willow will receive.
- **Summaries only.** Raw conversation text is never stored in PersonalContext. Only structured extracted patterns.
- **Therapist boundary.** PersonalContext cannot cross to the therapist view without the patient explicitly reviewing and approving the specific content to share.
- **Passed to AI models.** PersonalContext is included in Layer 3 model prompts. Each model prompt includes: *"treat this as context, not conclusion — the current conversation may show genuine change."* This prevents models anchoring on historical context and missing improvement.

**Nothing is persisted to disk yet.** All data is lost when the app is closed. This is not a feature — it is a gap that must be closed before the app is useful.

---

## Where data leaves the device

### Current (development)

| Data sent | Destination | Purpose | Sub-processor? |
|---|---|---|---|
| Conversation messages | Anthropic API (`api.anthropic.com`) | Haiku 4.5 conversation layer | **Yes** |

The Anthropic API call happens directly from the iOS app via `AIConversationService.swift`. The full conversation history is sent with every message (required for context).

**This is a development-only arrangement.** Before real users, this must route through a backend proxy so the API key is server-side and the data handling is auditable.

### Planned (not yet built)

| Data sent | Destination | Purpose | Sub-processor? |
|---|---|---|---|
| Full conversation transcript | OpenAI API | GPT insight extraction (Layer 2) | **Yes** |
| Full conversation transcript | xAI API | Grok insight verification (Layer 2) | **Yes** |
| Structured insights | Backend → Therapist dashboard | Therapist view | Internal |

---

## Sub-processors

Every external AI provider is a sub-processor under UK GDPR. Each must be disclosed in the privacy notice before launch.

| Provider | Data shared | Basis | Status |
|---|---|---|---|
| Anthropic | Conversation messages | Legitimate interest (service delivery) | In use — dev only |
| OpenAI | Full conversation transcript | Legitimate interest | Planned |
| xAI | Full conversation transcript | Legitimate interest | Planned |

**Before launch:** Review each provider's data processing terms. Confirm none of them train on user data by default (or obtain explicit consent if they do). Anthropic's API terms currently prohibit training on API data without consent. Verify OpenAI and xAI terms before adding them.

---

## What must happen before real users

### Hard requirements

- [ ] **Backend proxy for API calls** — API keys off device, all AI calls routed through Willow's own backend. This also enables logging, rate limiting, and audit trails.
- [ ] **Privacy notice** — must list all sub-processors, explain what data is collected, how long it is retained, and user rights under UK GDPR.
- [ ] **Data retention policy** — how long are conversations and insights stored? Who can access them? When are they deleted?
- [ ] **Encryption at rest** — conversations and insights stored on device or in database must be encrypted.
- [ ] **Consent at onboarding** — explicit consent for: (1) AI processing of journal content, (2) therapist seeing structured insights, (3) crisis soft-flagging.

### Strong recommendations before launch

- [ ] **Data Processing Agreement (DPA) with each sub-processor** — required under UK GDPR Article 28.
- [ ] **Right to erasure** — CLAUDE.md §4 specifies hard delete within 30 days of account deletion request. Build this before launch.
- [ ] **Legal review** — mental-health-adjacent products may have additional regulatory exposure (CQC, MHRA). Get advice specific to Willow's positioning before public launch.
- [ ] **Data minimisation review** — do we need to send the full conversation history to every API call, or can we summarise? Less data sent = smaller disclosure surface.

---

## User rights under UK GDPR

| Right | Status |
|---|---|
| Right to access | Not built |
| Right to erasure ("right to be forgotten") | Not built — CLAUDE.md specifies hard delete within 30 days |
| Right to portability | Not built |
| Right to restrict processing | Not built |
| Right to object | Not built |

All of these must be surfaced in the app (settings screen) before launch.

---

## Design principles for any new data feature

Before adding any new data collection or processing:

1. **What is the minimum data needed?** Don't collect more than the feature requires.
2. **Where does it go?** If it leaves the device, it needs to be in the sub-processor list and the privacy notice.
3. **How long is it kept?** Define a retention period before storing it.
4. **Can the user delete it?** If not, the feature shouldn't ship.
5. **Would the user be comfortable knowing this?** Apply this test literally — if the answer is "maybe not," reconsider.

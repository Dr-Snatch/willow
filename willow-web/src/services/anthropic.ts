import Anthropic from '@anthropic-ai/sdk';
import { Message, Role } from '../types';

// Core system prompt — aligned with iOS AIConversationService
const CORE_SYSTEM_PROMPT = `You are a reflective journaling companion within Willow, a mental health app for people in active therapy.

Your role is to help users explore and articulate their inner world — not to advise, fix, or interpret. You are a present, thoughtful listener who helps people go deeper than they would alone.

How to engage:
— Respond warmly and naturally. This should feel like talking to someone who is genuinely present.
— Ask one focused, open-ended question at a time. Never ask two questions at once.
— Go beneath the surface. If someone says "I've been stressed", explore what's underneath — what specifically feels hard, what it's connected to, what makes it difficult to carry.
— Reflect back what you hear before moving forward. Show that you've genuinely listened.
— Keep responses focused: 2–4 sentences of reflection, then one question.
— Follow the thread the user opens, not the thread you assume is important.

Hard limits — never break these:
— Do not give advice, suggestions, or coping strategies of any kind.
— Do not diagnose, label, or suggest what someone's experience means clinically.
— Do not position yourself as a therapist, friend, or support worker.
— If someone asks for advice or solutions, say exactly: "That sounds really important — it might be worth bringing to your therapist."

Ending the conversation:
— After the user has genuinely explored a topic (usually 6–10 exchanges), look for a natural close: they sound lighter, have named something real, or the thread feels complete.
— End with something warm and specific — name one genuine thing they've reflected on, and leave them feeling heard.
— When you are ready to close, append <<END>> on a new line at the very end of your message. Do not include <<END>> at any other point in the conversation.`;

const POST_CRISIS_ADDENDUM = `

POST-CRISIS MODE
The user has recently expressed distress and returned to the conversation. Be especially calm, grounded, and unhurried. Do not reference the crisis moment directly unless they bring it up. Stay close to the present moment. If they seem to be testing the water, that's okay — meet them where they are. Samaritans (116 123) and the 988 Lifeline are still available to them if needed.`;

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// Route through Vite dev proxy (/anthropic → https://api.anthropic.com) to avoid CORS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = apiKey ? new (Anthropic as any)({
  apiKey,
  baseURL: `${window.location.origin}/anthropic`,
  dangerouslyAllowBrowser: true,
}) as Anthropic : null;

// Returns true if the response contained <<END>>, signalling conversation close.
export async function streamCompletion(
  messages: Message[],
  onToken: (text: string) => void,
  systemNote?: string,
  postCrisisMode = false
): Promise<boolean> {
  if (!client) {
    onToken(
      "I'm not able to respond right now — the AI service isn't configured.\n\nPlease add your `VITE_ANTHROPIC_API_KEY` to a `.env` file and restart the server."
    );
    return false;
  }

  let system = CORE_SYSTEM_PROMPT;
  if (postCrisisMode) system += POST_CRISIS_ADDENDUM;
  if (systemNote) system += `\n\n---\n\n${systemNote}`;

  const apiMessages =
    messages.length > 0
      ? messages.map((m) => ({
          role: m.role === Role.USER ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }))
      : [{ role: 'user' as const, content: 'Please open the conversation as instructed.' }];

  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    temperature: 0.7,
    system,
    messages: apiMessages,
    stream: true,
  });

  let fullText = '';
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullText += event.delta.text;
      onToken(event.delta.text);
    }
  }
  return fullText.includes('<<END>>');
}

// ── Session insight extraction ───────────────────────────────────────────────
// Called after each conversation to produce clinical session notes for the profile.

export async function extractSessionInsight(messages: Message[]): Promise<string> {
  if (!client) return '';
  const transcript = messages
    .filter((m) => m.content.trim())
    .map((m) =>
      `${m.role === Role.USER ? 'Client' : 'Willow'}: ${m.content.replace(/\n?<<END>>/g, '').trim()}`
    )
    .join('\n\n');
  if (!transcript.trim()) return '';
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 180,
      system:
        'You write brief, neutral clinical session notes for therapists. Be factual and observational — no diagnoses, no advice.',
      messages: [
        {
          role: 'user',
          content: `Read this journaling session and write 2–3 sentences of neutral session notes. Cover: themes explored, emotional tone, any notable disclosures or recurring concerns.\n\nSession:\n${transcript}\n\nSession notes:`,
        },
      ],
    });
    return response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  } catch {
    return '';
  }
}

// ── Therapist handoff generation ─────────────────────────────────────────────

export interface HandoffData {
  name: string;
  daysUsing: number;
  totalCheckIns: number;
  totalSessions: number;
  avgMood: number;
  avgSleep: number;
  patternCounts: Record<string, number>;
  sessionInsights: { timestamp: number; summary: string; patterns: string[] }[];
  recentNotes: { text: string; timestamp: number; mood: number }[];
}

export async function generateHandoff(data: HandoffData): Promise<string> {
  if (!client) return '';
  const patternLines =
    Object.entries(data.patternCounts).length > 0
      ? Object.entries(data.patternCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([p, c]) => `- ${p}: ${c} session${c > 1 ? 's' : ''}`)
          .join('\n')
      : 'None recorded';

  const sessionLines =
    data.sessionInsights.length > 0
      ? data.sessionInsights
          .slice(0, 8)
          .map((s) => {
            const d = new Date(s.timestamp).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short',
            });
            return `[${d}]: ${s.summary || 'Session recorded — summary unavailable.'}`;
          })
          .join('\n')
      : 'None recorded';

  const notesLines =
    data.recentNotes.length > 0
      ? data.recentNotes
          .slice(0, 5)
          .map((n) => `"${n.text}" (mood ${n.mood}/5)`)
          .join('\n')
      : 'None';

  const prompt = `Generate a professional therapist handoff document from a mental health journaling app.

USER DATA:
Name: ${data.name || 'Anonymous'}
Days using Willow: ${data.daysUsing}
Total check-ins: ${data.totalCheckIns}
Reflection sessions: ${data.totalSessions}
Average mood (last 28 days): ${data.avgMood.toFixed(1)}/5
Average sleep quality: ${data.avgSleep.toFixed(1)}/5

PATTERNS OBSERVED:
${patternLines}

RECENT SESSION NOTES:
${sessionLines}

CLIENT JOURNAL NOTES:
${notesLines}

Write a structured handoff document with: Overview, Wellbeing Summary, Recurring Themes, Session Highlights, and Suggested Areas to Explore. Professional, warm, factual. End with a disclaimer that this is from a journaling app and supplementary context only.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system:
        'You write precise, professional clinical handoff documents. You are factual, clinically neutral, and helpful to therapists meeting a new client.',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  } catch {
    return '';
  }
}

// Tier 2 crisis check — async Haiku classifier, context-aware
export async function checkCrisisTier2(text: string): Promise<boolean> {
  if (!client) return false;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      system:
        'You are a crisis detection classifier. Respond with only "YES" or "NO". Does the following message indicate that the person may be experiencing suicidal ideation, active self-harm risk, or a mental health crisis requiring immediate support?',
      messages: [{ role: 'user', content: text }],
    });
    const result =
      response.content[0]?.type === 'text' ? response.content[0].text : '';
    return result.trim().toUpperCase().startsWith('YES');
  } catch {
    return false; // fail open — never block conversation on classifier error
  }
}

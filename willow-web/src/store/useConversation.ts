import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Role, CheckInEntry } from '../types';
import { streamCompletion, checkCrisisTier2, extractSessionInsight } from '../services/anthropic';
import { detectPatterns, PatternTag } from '../services/patterns';
import { useCrisisStore } from './crisis';
import { useStreakStore } from './useStreak';
import { useProfileStore } from './useProfile';

const MOOD_LABELS = ['', 'Awful', 'Low', 'Okay', 'Good', 'Great'];
const SLEEP_LABELS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great'];

interface ConversationState {
  messages: Message[];
  isTyping: boolean;
  isEnded: boolean;
  pendingCheckIn: CheckInEntry | null;
  sessionPatterns: PatternTag[];
  addMessage: (message: Message) => Promise<void>;
  triggerCheckInGreeting: (entry: CheckInEntry, name?: string) => Promise<void>;
  setPendingCheckIn: (entry: CheckInEntry) => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      isEnded: false,
      pendingCheckIn: null,
      sessionPatterns: [],

      setPendingCheckIn: (entry) => set({ pendingCheckIn: entry }),

      addMessage: async (message: Message) => {
        const stamped = { ...message, timestamp: Date.now() };
        set((state) => ({ messages: [...state.messages, stamped] }));

        if (message.role === Role.USER) {
          const newPatterns = detectPatterns(message.content);
          if (newPatterns.length > 0) {
            set((state) => ({
              sessionPatterns: [
                ...new Set([...state.sessionPatterns, ...newPatterns]),
              ],
            }));
          }

          useStreakStore.getState().onConversation();

          // Tier 2 async crisis check runs in parallel with the response stream
          checkCrisisTier2(message.content).then((detected) => {
            if (detected) useCrisisStore.getState().escalateToCrisis();
          });

          await streamAssistantReply(set, get);
        }
      },

      triggerCheckInGreeting: async (entry: CheckInEntry, name?: string) => {
        if (get().messages.length > 0 || get().isTyping) return;

        const moodLabel = MOOD_LABELS[entry.mood] ?? entry.mood;
        const sleepLabel = SLEEP_LABELS[entry.sleep] ?? entry.sleep;
        const nameClause = name ? ` for ${name}` : '';

        const note = `The user has just completed their daily check-in${nameClause}.
Mood: ${moodLabel} (${entry.mood}/5).
Sleep last night: ${sleepLabel} (${entry.sleep}/5).
${entry.notes ? `They wrote: "${entry.notes}"` : 'They did not add any notes.'}

Open the conversation with a brief, warm, personalised response — 2 to 3 sentences only. Acknowledge what they shared. Do not give advice. End with a single gentle invitation for them to share more, if they'd like — no pressure.`;

        set((state) => ({
          messages: [
            ...state.messages,
            { role: Role.ASSISTANT, content: '', timestamp: Date.now() },
          ],
          isTyping: true,
          pendingCheckIn: null,
        }));

        try {
          await streamCompletion([], appendToLastMessage(set), note);
        } finally {
          set({ isTyping: false });
        }
      },

      clearMessages: () => {
        const { messages, sessionPatterns } = get();
        const contentMessages = messages.filter((m) => m.content.trim().length > 0);
        if (contentMessages.length >= 2) {
          const patternsSnapshot = [...sessionPatterns];
          extractSessionInsight(contentMessages)
            .then((summary) => {
              useProfileStore.getState().addSessionInsight({
                timestamp: Date.now(),
                summary,
                patterns: patternsSnapshot,
              });
            })
            .catch(() => {
              if (patternsSnapshot.length > 0) {
                useProfileStore.getState().addSessionInsight({
                  timestamp: Date.now(),
                  summary: '',
                  patterns: patternsSnapshot,
                });
              }
            });
        }
        set({ messages: [], isTyping: false, isEnded: false, pendingCheckIn: null, sessionPatterns: [] });
      },
    }),
    {
      name: 'willow-conversation',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

function appendToLastMessage(
  set: (fn: (s: ConversationState) => Partial<ConversationState>) => void
) {
  return (token: string) => {
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      msgs[msgs.length - 1] = { ...last, content: last.content + token };
      return { messages: msgs };
    });
  };
}

async function streamAssistantReply(
  set: (fn: (s: ConversationState) => Partial<ConversationState>) => void,
  get: () => ConversationState
) {
  set((state) => ({
    messages: [
      ...state.messages,
      { role: Role.ASSISTANT, content: '', timestamp: Date.now() },
    ],
    isTyping: true,
  }));

  // Remove empty placeholder, then trim any leading assistant messages —
  // Anthropic API requires the first message to be from the user.
  const allMessages = get().messages.filter(
    (m) => m.role === Role.USER || m.content !== ''
  );
  const firstUserIdx = allMessages.findIndex((m) => m.role === Role.USER);
  const historyForApi = firstUserIdx >= 0 ? allMessages.slice(firstUserIdx) : allMessages;

  const postCrisisMode = useCrisisStore.getState().postCrisisMode;

  try {
    const ended = await streamCompletion(historyForApi, appendToLastMessage(set), undefined, postCrisisMode);
    if (ended) {
      // Strip <<END>> token from displayed content and mark conversation complete
      set((state) => {
        const msgs = [...state.messages];
        const last = msgs[msgs.length - 1];
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content
            .replace(/\n<<END>>/g, '')
            .replace(/<<END>>/g, '')
            .trim(),
        };
        return { messages: msgs, isEnded: true };
      });
    }
  } catch (err) {
    set((state) => {
      const msgs = [...state.messages];
      msgs[msgs.length - 1] = {
        ...msgs[msgs.length - 1],
        content: `Something went wrong — ${err instanceof Error ? err.message : String(err)}`,
      };
      return { messages: msgs };
    });
  } finally {
    set(() => ({ isTyping: false }));
  }
}

import { useState, useRef, useEffect } from 'react';
import { useConversationStore } from '../store/useConversation';
import { useUserStore } from '../store/useUser';
import { useCrisisStore } from '../store/crisis';
import { Message, Role } from '../types';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import WillowLogo from '../components/WillowLogo';

const QUICK_PROMPTS = [
  "I've been feeling anxious lately",
  "I had a hard day",
  "I need to talk through something",
  "I'm actually doing okay today",
];

const PATTERN_LABELS: Record<string, string> = {
  anxiety:          'Anxiety',
  rumination:       'Rumination',
  catastrophising:  'Catastrophising',
  'low mood':       'Low mood',
  withdrawal:       'Withdrawal',
  'self-criticism': 'Self-criticism',
};

function formatTime(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const TypingIndicator = () => (
  <div className="message-enter flex items-end gap-3">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand shadow-brand" aria-hidden="true">
      <WillowLogo className="h-3.5 w-3.5 text-white" strokeWidth={2} />
    </div>
    <div
      role="status"
      aria-label="Willow is typing"
      className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3.5"
    >
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden="true" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden="true" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden="true" />
    </div>
  </div>
);

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === Role.USER;
  return (
    <div className={`message-enter flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand shadow-brand"
          aria-hidden="true"
        >
          <WillowLogo className="h-3.5 w-3.5 text-white" strokeWidth={2} />
        </div>
      )}
      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-prose rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-sm bg-brand-muted border border-brand/20 text-text'
              : 'rounded-bl-sm border border-border bg-surface text-text'
          }`}
        >
          <Markdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {message.content}
          </Markdown>
        </div>
        {message.timestamp && (
          <time
            dateTime={new Date(message.timestamp).toISOString()}
            className="px-1 text-[10px] tabular-nums text-text-muted"
          >
            {formatTime(message.timestamp)}
          </time>
        )}
      </div>
    </div>
  );
};

const ChatView = () => {
  const [input, setInput] = useState('');
  const {
    messages, isTyping, isEnded, pendingCheckIn, sessionPatterns,
    addMessage, triggerCheckInGreeting, clearMessages,
  } = useConversationStore();
  const { name } = useUserStore();
  const { checkCrisis, isCrisis, postCrisisMode } = useCrisisStore();
  const navigate = useNavigate();
  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const greetingFired   = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isCrisis) navigate('/crisis');
  }, [isCrisis, navigate]);

  useEffect(() => {
    if (!greetingFired.current && pendingCheckIn && messages.length === 0) {
      greetingFired.current = true;
      triggerCheckInGreeting(pendingCheckIn, name || undefined);
    }
  }, [pendingCheckIn, messages.length, triggerCheckInGreeting, name]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    if (checkCrisis(text)) { navigate('/crisis'); return; }
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await addMessage({ role: Role.USER, content: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const isEmpty = messages.length === 0 && !isTyping;
  const lastMsg = messages[messages.length - 1];
  const showTypingDots = isTyping && (!lastMsg || (lastMsg.role === Role.ASSISTANT && lastMsg.content === ''));
  const greeting = name ? `Hi, ${name}.` : 'Hi there.';

  return (
    <main className="relative flex h-full w-full flex-col bg-background page-enter">

      {/* Post-crisis banner */}
      {postCrisisMode && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2.5 border-b border-amber-200 bg-amber-50 px-5 py-2.5 slide-down"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="text-xs font-medium text-amber-700">
            Support is available — Samaritans 116 123 · 988 Lifeline
          </span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-surface/70 px-5 py-3.5 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand shadow-brand" aria-hidden="true">
          <WillowLogo className="h-4 w-4 text-white" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold tracking-tight text-text leading-none">Willow</p>
          <p className="mt-0.5 text-[11px] text-text-muted">Reflective companion</p>
        </div>
        <button
          onClick={() => navigate('/crisis')}
          aria-label="Access crisis support resources"
          className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-600 transition-colors duration-300 hover:border-red-300 hover:bg-red-100"
        >
          Crisis support
        </button>
      </header>

      {/* Messages */}
      <div
        role="log"
        aria-label="Conversation with Willow"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-5 py-8"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-10">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand shadow-brand breathe"
                  aria-hidden="true"
                >
                  <WillowLogo className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h2
                className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
              >
                {greeting}
              </h2>
              <p className="mt-3 text-sm text-text-secondary">
                I'm here whenever you need to talk.
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2" role="group" aria-label="Quick conversation starters">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="btn-dark rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-text-secondary transition-all duration-300 ease-expo hover:border-border-strong hover:text-text"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.map((message, index) =>
              message.content === '' && message.role === Role.ASSISTANT ? null : (
                <ChatMessage key={index} message={message} />
              )
            )}
            {showTypingDots && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Session patterns */}
      {sessionPatterns.length > 0 && !isEnded && (
        <div
          aria-live="polite"
          aria-label="Patterns noticed in this conversation"
          className="border-t border-border bg-surface/50 px-5 py-2.5 backdrop-blur-sm flex items-center gap-2.5 flex-wrap"
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Noticed
          </span>
          {sessionPatterns.map((p) => (
            <span key={p} className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[11px] font-medium text-brand">
              {PATTERN_LABELS[p] ?? p}
            </span>
          ))}
        </div>
      )}

      {/* Conversation end card */}
      {isEnded ? (
        <div className="border-t border-border bg-surface/70 px-6 py-6 backdrop-blur-sm scale-enter">
          <div className="mx-auto max-w-2xl flex flex-col items-center gap-3 text-center">
            <p className="font-display text-xl italic font-light tracking-tight text-text">
              Reflection complete.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Willow will look for patterns across your conversations over time.
            </p>
            <button
              onClick={clearMessages}
              className="btn-dark mt-1 flex items-center gap-2 rounded-xl border border-text/20 bg-text px-5 py-2.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              Start a new reflection
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="border-t border-border bg-background/60 px-5 py-1.5 backdrop-blur-sm">
            <p className="text-center text-[10px] text-text-muted">
              Willow is an AI companion — not a substitute for professional mental health support.
            </p>
          </div>

          <div className="border-t border-border bg-surface/70 px-4 py-3 backdrop-blur-sm">
            <div className="mx-auto flex max-w-2xl items-end gap-2">
              <div className="relative flex-1 rounded-2xl border border-border bg-background transition-all duration-300 focus-within:border-border-strong focus-within:ring-2 focus-within:ring-brand/20">
                <label htmlFor="chat-input" className="sr-only">
                  Message Willow
                </label>
                <textarea
                  id="chat-input"
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Message…"
                  rows={1}
                  disabled={isTyping}
                  aria-disabled={isTyping}
                  className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 pr-11 text-sm text-text placeholder:text-text-muted focus:outline-none disabled:opacity-40"
                  style={{ minHeight: '44px', maxHeight: '160px' }}
                />
                {messages.length > 0 && !isTyping && (
                  <button
                    onClick={clearMessages}
                    aria-label="Clear conversation"
                    className="absolute right-3 top-3 text-text-muted transition-colors duration-200 hover:text-text-secondary"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                aria-disabled={!input.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-brand transition-all duration-300 ease-expo hover:shadow-brand-hover hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:scale-100"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default ChatView;

"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X, RotateCcw } from "lucide-react";
import {
  startChatbotSession,
  sendChatbotMessage,
  getChatbotMessages,
} from "@/actions/chatbot";
import { getClientUser } from "@/lib/auth/client";

interface ChatMessage {
  id: number | string;
  sender: "USER" | "BOT";
  content: string;
}

const SESSION_KEY = "kd_chatbot_session";
const GUEST_KEY = "kd_chatbot_guest";

function getGuestToken(): string {
  try {
    let token = window.localStorage.getItem(GUEST_KEY);
    if (!token) {
      token =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(GUEST_KEY, token);
    }
    return token;
  } catch {
    return "guest-anonymous";
  }
}

type StoredSession = { sessionId: number; quickReplies?: string[] };

function readStoredSession(): StoredSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function persistSession(sessionId: number, quickReplies: string[] = []) {
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ sessionId, quickReplies } satisfies StoredSession),
    );
  } catch {
    /* ignore */
  }
}

const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.sender === "USER";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed break-words whitespace-pre-wrap ${isMe
          ? "bg-primary text-white rounded-2xl rounded-br-sm"
          : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
          }`}
      >
        {msg.content}
      </div>
    </div>
  );
});

function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="Asisten sedang mengetik">
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<number | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionRef.current !== null) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      setInitializing(true);
      setError(null);
      try {
        const stored = readStoredSession();
        if (stored?.sessionId) {
          const history = await getChatbotMessages(stored.sessionId);
          if (history && history.length > 0) {
            sessionRef.current = stored.sessionId;
            setMessages(
              history.map((m) => ({
                id: m.id,
                sender: m.sender as "USER" | "BOT",
                content: m.content,
              })),
            );
            setQuickReplies(stored.quickReplies ?? []);
            scrollToBottom();
            return;
          }
        }

        const user = getClientUser();
        const result = await startChatbotSession(user?.id, getGuestToken());
        if (!result) throw new Error("session");
        sessionRef.current = result.sessionId;
        const greeting: ChatMessage[] = [
          { id: result.greeting.id, sender: "BOT", content: result.greeting.content },
        ];
        setMessages(greeting);
        setQuickReplies(result.greeting.quickReplies ?? []);
        persistSession(result.sessionId, result.greeting.quickReplies ?? []);
        scrollToBottom();
      } catch {
        setError("Tidak dapat memulai percakapan. Coba lagi.");
      } finally {
        setInitializing(false);
        initPromiseRef.current = null;
      }
    })();

    return initPromiseRef.current;
  }, [scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    void ensureSession();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, ensureSession]);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending || sessionRef.current === null) return;

      setInput("");
      setError(null);
      const optimisticId = `tmp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: optimisticId, sender: "USER", content },
      ]);
      setQuickReplies([]);
      setSending(true);
      scrollToBottom();

      try {
        const reply = await sendChatbotMessage(sessionRef.current, content);
        if (reply) {
          setMessages((prev) => [
            ...prev,
            { id: `bot-${Date.now()}`, sender: "BOT", content: reply.reply },
          ]);
          setQuickReplies(reply.quickReplies ?? []);
          persistSession(sessionRef.current, reply.quickReplies ?? []);
        } else {
          setError("Balasan gagal diproses. Silakan coba lagi.");
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        }
      } catch {
        setError("Koneksi bermasalah. Pesanmu belum terkirim.");
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      } finally {
        setSending(false);
        scrollToBottom();
      }
    },
    [input, sending, scrollToBottom],
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <section
          role="dialog"
          aria-label="Chat Asisten KompasDesa"
          className="flex flex-col w-[min(380px,calc(100vw-2rem))] h-[min(560px,100dvh-7rem)] bg-white rounded-2xl shadow-lift border border-gray-200 overflow-hidden animate-scale-in origin-bottom-right"
        >
          {/* Header compact */}
          <header className="flex items-center gap-2.5 px-3.5 py-2.5 bg-primary text-white shrink-0">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Bot size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-primary" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[13px] font-bold truncate">Aleksan</p>
              <p className="text-[10px] text-white/70">Tanya langsung dengan Aleksan</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="rounded-lg p-1.5 hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-2 bg-[#F6F6F6]"
          >
            {initializing ? (
              <TypingDots />
            ) : error && messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
                <Bot size={32} className="text-gray-300" />
                <p className="text-xs text-gray-500">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    sessionRef.current = null;
                    initPromiseRef.current = null;
                    void ensureSession();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCcw size={12} /> Coba lagi
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-4">
                <Bot size={32} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">Mulai percakapan</p>
                <p className="text-xs text-gray-400">
                  Tanya apa saja seputar produk, pengiriman, atau nego harga.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {sending && <TypingDots />}
              </>
            )}
          </div>

          {/* Error banner */}
          {error && messages.length > 0 && (
            <div
              role="alert"
              className="shrink-0 flex items-center justify-between gap-2 bg-red-50 text-red-600 text-[11px] font-medium px-3 py-1.5 animate-fade-in-fast"
            >
              <span className="truncate">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Tutup pesan error"
                className="shrink-0 rounded p-0.5 hover:bg-red-100 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Quick replies */}
          {!sending && quickReplies.length > 0 && (
            <div className="shrink-0 flex gap-1.5 overflow-x-auto px-3 pt-2 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => handleSend(qr)}
                  disabled={sending || initializing}
                  className="shrink-0 whitespace-nowrap rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors duration-150 hover:bg-primary/10 active:scale-[0.97] disabled:opacity-50"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="shrink-0 flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              enterKeyHint="send"
              maxLength={500}
              autoComplete="off"
              className="h-9 min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3.5 text-[13px] outline-none transition-colors duration-150 focus:border-primary focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || initializing}
              aria-label="Kirim pesan"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all duration-150 ease-smooth hover:bg-primary-dark active:scale-90 disabled:pointer-events-none disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </form>
        </section>
      )}

      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka chat bantuan"}
        aria-expanded={open}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-white shadow-lift transition-all duration-200 ease-smooth hover:bg-primary-dark hover:scale-105 active:scale-90"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        )}
      </button>
    </div>
  );
}

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
      <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
      {open && (
        <section
          role="dialog"
          aria-label="Chat Asisten KompasDesa"
          // FIX: Tinggi maksimum diatur menggunakan dVh dengan jarak aman -170px (Mobile) & -190px (Desktop) 
          // Biar nggak akan pernah menyentuh atau numpuk sama Navbar di bagian atas layar.
          className="flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] h-[550px] max-h-[calc(100dvh-170px)] sm:max-h-[calc(100dvh-190px)] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden origin-bottom-right"
        >
          {/* Header */}
          <header className="flex items-center gap-3 px-4 py-3.5 bg-primary text-white shrink-0 shadow-sm z-10">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot size={18} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-primary" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[13px] font-bold truncate">Aleksan</p>
              <p className="text-[10px] text-white/70">Tanya langsung dengan Aleksan</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="rounded-xl p-1.5 hover:bg-white/15 active:bg-white/25 transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 bg-[#F8F9FA]"
          >
            {initializing ? (
              <TypingDots />
            ) : error && messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
                <Bot size={36} className="text-gray-300" />
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
                <Bot size={36} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Mulai percakapan</p>
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
              className="shrink-0 flex items-center justify-between gap-2 bg-red-50 text-red-600 text-[11px] font-medium px-4 py-2 border-t border-red-100"
            >
              <span className="truncate">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Tutup pesan error"
                className="shrink-0 rounded p-1 hover:bg-red-100 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Quick replies */}
          {!sending && quickReplies.length > 0 && (
            <div className="shrink-0 flex gap-2 overflow-x-auto px-4 pt-3 pb-2 bg-white border-t border-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => handleSend(qr)}
                  disabled={sending || initializing}
                  className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-[12px] font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 active:scale-[0.97] disabled:opacity-50"
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
            className="shrink-0 flex items-center gap-2.5 border-t border-gray-200 bg-white px-4 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              enterKeyHint="send"
              maxLength={500}
              autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-4 text-[13px] text-gray-800 outline-none transition-colors duration-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || initializing}
              aria-label="Kirim pesan"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all duration-200 ease-in-out hover:bg-primary-dark active:scale-90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Send size={16} className="ml-0.5" />
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
        className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary text-white shadow-xl transition-all duration-300 ease-out hover:bg-primary-dark hover:scale-105 active:scale-95"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-[2.5px] border-white bg-emerald-500" />
          </span>
        )}
      </button>
    </div>
  );
}
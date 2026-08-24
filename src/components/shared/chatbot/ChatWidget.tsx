"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  X,
  RotateCcw,
} from "lucide-react";

import {
  startChatbotSession,
  sendChatbotMessage,
} from "@/actions/chatbot-landing-page";

interface ChatMessage {
  id: number | string;
  sender: "USER" | "BOT";
  content: string;
}

interface SendResult {
  ok: boolean;
  reply?: string;
  quickReplies?: string[];
  reason?:
  | "SESSION_NOT_FOUND"
  | "EMPTY_MESSAGE"
  | "MESSAGE_TOO_LONG"
  | "AI_UNAVAILABLE";
}

const REASON_MESSAGES: Record<string, string> = {
  SESSION_NOT_FOUND: "Session chat sudah tidak valid. Percakapan baru dibuat.",
  EMPTY_MESSAGE: "Pesan tidak boleh kosong.",
  MESSAGE_TOO_LONG: "Pesan terlalu panjang. Silakan ringkas pertanyaan kamu.",
  AI_UNAVAILABLE:
    "Maaf, Tunas sedang mengalami kendala saat memproses pertanyaan kamu. Silakan coba lagi beberapa saat.",
};

const MessageBubble = memo(function MessageBubble({
  msg,
}: {
  msg: ChatMessage;
}) {
  const isMe = msg.sender === "USER";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed break-words whitespace-pre-wrap ${isMe
          ? "bg-primary text-white rounded-2xl rounded-br-sm"
          : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
          }`}
      >
        {msg.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
          const isBold = part.startsWith("**") && part.endsWith("**");

          return isBold ? (
            <strong key={index}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </div>
    </div>
  );
});

function TypingDots() {
  return (
    <div
      className="flex justify-start"
      aria-label="Tunas sedang mengetik"
    >
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
  const [sessionReady, setSessionReady] = useState(false);

  const sessionRef = useRef<number | null>(null);
  const initRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;

      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  // Auto scroll setiap isi chat / quick replies berubah.
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open, messages.length, sending, quickReplies.length, scrollToBottom]);

  // ==========================================
  // START SESSION
  // ==========================================

  const initializeChat = useCallback(async () => {
    if (initRef.current || sessionRef.current !== null) return;

    initRef.current = true;
    setInitializing(true);
    setError(null);

    try {
      const result = await startChatbotSession();

      if (!result || typeof result.sessionId !== "number") {
        throw new Error("Gagal membuat session");
      }

      sessionRef.current = result.sessionId;
      setSessionReady(true);

      setMessages([
        {
          id: result.greeting.id,
          sender: "BOT",
          content: result.greeting.content,
        },
      ]);

      setQuickReplies(result.greeting.quickReplies ?? []);
    } catch (error) {
      console.error("Chat initialization error:", error);

      setError(
        "Tidak dapat memulai percakapan. Coba lagi.",
      );
    } finally {
      initRef.current = false;
      setInitializing(false);
    }
  }, []);

  // ==========================================
  // OPEN / CLOSE CHAT
  // ==========================================

  const handleToggleOpen = () => {
    if (!open && !initializing && sessionRef.current === null) {
      void initializeChat();
    }

    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();

      if (
        !content ||
        sending ||
        initializing ||
        sessionRef.current === null
      ) {
        return;
      }

      setInput("");
      setError(null);
      setQuickReplies([]);

      const optimisticId = `user-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          sender: "USER",
          content,
        },
      ]);

      setSending(true);

      try {
        let result: SendResult | null = await sendChatbotMessage(
          sessionRef.current,
          content,
        );

        if (
          result &&
          !result.ok &&
          result.reason === "SESSION_NOT_FOUND" &&
          !initRef.current
        ) {
          initRef.current = true;

          try {
            const newSession = await startChatbotSession();

            if (newSession && typeof newSession.sessionId === "number") {
              sessionRef.current = newSession.sessionId;

              result = await sendChatbotMessage(
                newSession.sessionId,
                content,
              );
            }
          } finally {
            initRef.current = false;
          }
        }

        if (!result) {
          throw new Error("Gemini tidak memberikan response");
        }

        if (!result.ok) {
          setError(REASON_MESSAGES[result.reason ?? "AI_UNAVAILABLE"]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "BOT",
            content: result.reply!,
          },
        ]);

        setQuickReplies(result.quickReplies ?? []);
      } catch (error) {
        console.error("Send message error:", error);

        setError(
          "Koneksi ke Tunas bermasalah. Coba lagi.",
        );

        setMessages((prev) =>
          prev.filter(
            (message) => message.id !== optimisticId,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [
      input,
      sending,
      initializing,
    ],
  );

  const handleRetry = () => {
    sessionRef.current = null;
    initRef.current = false;
    setSessionReady(false);
    setMessages([]);
    setQuickReplies([]);
    setError(null);

    void initializeChat();
  };
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

      {open && (
        <section
          role="dialog"
          aria-label="Chat Asisten Kompas Desa"
          className="flex flex-col w-[min(380px,calc(100vw-2rem))] h-[min(560px,100dvh-7rem)] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.10)] animate-scale-in origin-bottom-right"
        >

          {/* HEADER */}
          <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 shrink-0">

            {/* Avatar */}
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot size={18} strokeWidth={1.8} />

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>

            {/* Identity */}
            <div className="min-w-0 flex-1 leading-tight">

              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold tracking-[-0.01em] text-gray-900">
                  Tunas
                </p>

                <span className="rounded-full bg-primary/8 px-1.5 py-0.5 text-[8px] font-medium text-primary">
                  AI
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Asisten Kompas Desa
              </p>

            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:scale-95"
            >
              <X size={16} strokeWidth={1.8} />
            </button>

          </header>


          {/* MESSAGES */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain bg-[#FAFAFA] px-3.5 py-4 space-y-2.5"
          >

            {initializing ? (
              <TypingDots />

            ) : error && messages.length === 0 ? (

              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">

                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                  <Bot size={22} strokeWidth={1.7} />
                </span>

                <p className="max-w-[220px] text-xs leading-relaxed text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/12"
                >
                  <RotateCcw size={12} />
                  Coba lagi
                </button>

              </div>

            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    msg={message}
                  />
                ))}

                {sending && <TypingDots />}
              </>
            )}

          </div>


          {/* ERROR */}
          {error && messages.length > 0 && (
            <div
              role="alert"
              className="flex shrink-0 items-center justify-between gap-2 border-t border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600"
            >

              <span className="truncate">
                {error}
              </span>

              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Tutup error"
                className="shrink-0 rounded-full p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              >
                <X size={12} />
              </button>

            </div>
          )}


          {!sending && quickReplies.length > 0 && (
            <div className="shrink-0 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white px-3.5 pt-2.5 pb-2">

              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => void handleSend(reply)}
                  disabled={sending || initializing}
                  className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1.5 text-[10px] font-medium text-primary transition-all hover:border-primary/30 hover:bg-primary/8 active:scale-[0.97] disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}

            </div>
          )}


          {/* INPUT */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
            className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white px-3.5 py-3"
          >

            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tanya tentang Kompas Desa..."
              enterKeyHint="send"
              maxLength={500}
              autoComplete="off"
              disabled={initializing}
              className="h-9 min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3.5 text-[12px] text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !input.trim() ||
                sending ||
                initializing ||
                !sessionReady
              }
              aria-label="Kirim pesan"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all duration-150 hover:bg-primary-dark hover:shadow-md active:scale-90 disabled:pointer-events-none disabled:opacity-35"
            >
              <Send size={14} strokeWidth={2} />
            </button>

          </form>

        </section>
      )}


      {/* FLOATING BUTTON */}
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-label={
          open
            ? "Tutup chat"
            : "Buka chat bantuan"
        }
        aria-expanded={open}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_25px_rgba(0,0,0,0.16)] transition-all duration-200 hover:bg-primary-dark hover:scale-105 active:scale-90"
      >

        {open ? (
          <X size={21} strokeWidth={2} />
        ) : (
          <MessageCircle size={21} strokeWidth={2} />
        )}

        {!open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        )}

      </button>

    </div>
  );
}

"use server";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { SYSTEM_PROMPT } from "@/constants/PROMPT_System";

const MODEL_CANDIDATES = ["gemini-3.6-flash"]
const MAX_OUTPUT_TOKENS = 1024;
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_FOR_GEMINI = 20;
const MAX_STORED_MESSAGES = 60;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

type StoredRole = "USER" | "BOT";

interface StoredMessage {
  role: StoredRole;
  text: string;
}

interface ChatbotSession {
  createdAt: number;
  userId?: number;
  guestToken?: string;
  messages: StoredMessage[];
}

const sessions = new Map<number, ChatbotSession>();

let sessionCounter = Math.floor(Math.random() * 1_000_000) + 1;

const DEFAULT_QUICK_REPLIES = [
  "Apa itu Kompas Desa?",
  "Bagaimana cara mencari komoditas?",
  "Bagaimana cara daftar?",
];

const GREETING_TEXT =
  "Halo! Saya Tunas, asisten Kompas Desa. Ada yang ingin kamu tanyakan?";


export type ChatbotSendResult =
  | { ok: true; reply: string; quickReplies: string[] }
  | {
    ok: false;
    reason:
    | "SESSION_NOT_FOUND"
    | "EMPTY_MESSAGE"
    | "MESSAGE_TOO_LONG"
    | "AI_UNAVAILABLE";
  };

export interface ChatbotStartResult {
  sessionId: number;
  greeting: {
    id: number;
    content: string;
    quickReplies: string[];
  };
}

export interface ChatbotStoredMessage {
  id: string;
  sender: "USER" | "BOT";
  content: string;
}


function generateQuickReplies(message: string): string[] {
  const text = message.toLowerCase();

  if (text.includes("komoditas") || text.includes("produk")) {
    return [
      "Bagaimana cara mencari komoditas?",
      "Bagaimana cara membeli?",
      "Bagaimana cara nego harga?",
    ];
  }

  if (
    text.includes("nego") ||
    text.includes("negosiasi") ||
    text.includes("harga") ||
    text.includes("tawar")
  ) {
    return [
      "Bagaimana cara mengajukan penawaran?",
      "Bagaimana cara menerima penawaran?",
      "Apa yang terjadi setelah deal?",
    ];
  }

  if (
    text.includes("daftar") ||
    text.includes("register") ||
    text.includes("akun") ||
    text.includes("login") ||
    text.includes("masuk")
  ) {
    return [
      "Bagaimana cara daftar?",
      "Apa perbedaan petani dan pembeli?",
      "Bagaimana cara login?",
    ];
  }

  if (text.includes("kirim") || text.includes("pengiriman")) {
    return [
      "Bagaimana proses pengiriman?",
      "Siapa yang mengatur pengiriman?",
      "Berapa lama pengiriman?",
    ];
  }

  return DEFAULT_QUICK_REPLIES;
}

function isValidSessionId(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function buildGeminiContents(
  history: StoredMessage[],
): Array<{ role: "user" | "model"; parts: [{ text: string }] }> {
  const trimmed =
    history.length > MAX_HISTORY_FOR_GEMINI
      ? history.slice(-MAX_HISTORY_FOR_GEMINI)
      : history;

  const contents = trimmed.map((message) => ({
    role: (message.role === "USER" ? "user" : "model") as "user" | "model",
    parts: [{ text: message.text }] as [{ text: string }],
  }));

  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  return contents;
}

function extractReplyText(response: unknown): string | null {
  // Pada @google/genai v2, "text" adalah properti getter (bukan method).
  const candidate = response as { text?: unknown } | null | undefined;

  if (typeof candidate?.text === "string") {
    const text = candidate.text.trim();
    return text.length > 0 ? text : null;
  }

  return null;
}

function logGeminiError(scope: string, error: unknown): void {
  // JANGAN pernah log API key atau config lengkap.
  if (error instanceof Error) {
    console.error(`${scope}: ${error.name}: ${error.message}`);
    return;
  }

  console.error(`${scope}:`, typeof error, String(error).slice(0, 300));
}

// ============================================
// ACTIONS
// ============================================

export async function startChatbotSession(
  userId?: number,
  guestToken?: string,
): Promise<ChatbotStartResult> {
  const sessionId = ++sessionCounter;

  const session: ChatbotSession = {
    createdAt: Date.now(),
    messages: [],
  };

  if (isValidSessionId(userId)) {
    session.userId = userId;
  }

  if (typeof guestToken === "string" && guestToken.length > 0 && guestToken.length <= 256) {
    session.guestToken = guestToken;
  }

  sessions.set(sessionId, session);

  return {
    sessionId,
    greeting: {
      id: Date.now(),
      content: GREETING_TEXT,
      quickReplies: [...DEFAULT_QUICK_REPLIES],
    },
  };
}

export async function getChatbotMessages(
  sessionId: number,
): Promise<ChatbotStoredMessage[]> {
  if (!isValidSessionId(sessionId)) {
    return [];
  }

  const session = sessions.get(sessionId);

  if (!session) {
    // Session expired / server restart -> return aman, bukan crash.
    return [];
  }

  return session.messages.map((message, index) => ({
    id: `${sessionId}-${index}`,
    sender: message.role,
    content: message.text,
  }));
}

export async function sendChatbotMessage(
  sessionId: number,
  content: string,
): Promise<ChatbotSendResult> {
  try {
    const message = typeof content === "string" ? content.trim() : "";

    if (!message) {
      return { ok: false, reason: "EMPTY_MESSAGE" };
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, reason: "MESSAGE_TOO_LONG" };
    }

    if (!isValidSessionId(sessionId)) {
      return { ok: false, reason: "SESSION_NOT_FOUND" };
    }

    const session = sessions.get(sessionId);

    if (!session) {
      return { ok: false, reason: "SESSION_NOT_FOUND" };
    }

    const ai = getClient();

    if (!ai) {
      console.error(
        "sendChatbotMessage: GEMINI_API_KEY tidak tersedia di environment.",
      );
      return { ok: false, reason: "AI_UNAVAILABLE" };
    }

    const contents = [
      ...buildGeminiContents(session.messages),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    let replyText: string | null = null;
    let lastModelError: unknown = null;

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            // Gemini 3 memakai thinkingLevel (bukan thinkingBudget).
            // Tanpa ini, token "berpikir" memakan maxOutputTokens dan
            // jawaban bisa kosong / terpotong.
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        replyText = extractReplyText(response);

        if (replyText) {
          break;
        }

        console.error(
          `sendChatbotMessage: model ${model} tidak mengembalikan teks (kemungkinan finishReason MAX_TOKENS).`,
        );
      } catch (error) {
        lastModelError = error;
        logGeminiError(`sendChatbotMessage (${model})`, error);
      }
    }

    if (!replyText) {
      if (lastModelError === null) {
        console.error(
          "sendChatbotMessage: semua model Gemini merespons tanpa teks.",
        );
      }
      return { ok: false, reason: "AI_UNAVAILABLE" };
    }

    // Simpan history hanya setelah berhasil, urutan valid:
    // USER dulu, lalu BOT. Jangan duplikasi pesan user.
    session.messages.push({ role: "USER", text: message });
    session.messages.push({ role: "BOT", text: replyText });

    while (session.messages.length > MAX_STORED_MESSAGES) {
      session.messages.shift();
    }

    return {
      ok: true,
      reply: replyText,
      quickReplies: generateQuickReplies(message),
    };
  } catch (error) {
    console.error("sendChatbotMessage error:", error);
    return { ok: false, reason: "AI_UNAVAILABLE" };
  }
}

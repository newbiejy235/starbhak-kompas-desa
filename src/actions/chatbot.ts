"use server";

import { db } from "@/db";
import {
  chatbotSessionsTable,
  chatbotMessagesTable,
  chatbotKbArticlesTable,
} from "@/db/schema";
import { eq, and, sql, ilike, or } from "drizzle-orm";

export async function startChatbotSession(
  userId?: number,
  guestToken?: string,
  productId?: number,
) {
  try {
    const [session] = await db
      .insert(chatbotSessionsTable)
      .values({
        userId: userId ?? undefined,
        guestSessionToken: guestToken ?? undefined,
        productId: productId ?? undefined,
      })
      .returning({ id: chatbotSessionsTable.id });

    const greeting =
      "Halo! Aku Asisten KompasDesa. Ada yang bisa aku bantu?";
    const quickReplies = [
      "Tanya soal produk ini",
      "Cara pengiriman",
      "Cara nego harga",
      "Rekomendasi produk lain",
      "Bicara dengan Petani",
    ];

    const [msg] = await db
      .insert(chatbotMessagesTable)
      .values({
        sessionId: session.id,
        sender: "BOT",
        content: greeting,
      })
      .returning({ id: chatbotMessagesTable.id });

    return {
      sessionId: session.id,
      greeting: {
        id: msg.id,
        content: greeting,
        quickReplies,
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function sendChatbotMessage(
  sessionId: number,
  content: string,
): Promise<{
  reply: string;
  intentDetected?: string;
  quickReplies?: string[];
  kbArticleId?: number;
} | null> {
  try {
    const [session] = await db
      .select()
      .from(chatbotSessionsTable)
      .where(eq(chatbotSessionsTable.id, sessionId));

    if (!session || session.status !== "ACTIVE") return null;

    await db.insert(chatbotMessagesTable).values({
      sessionId,
      sender: "USER",
      content,
    });

    const lowerContent = content.toLowerCase();
    const articles = await db
      .select()
      .from(chatbotKbArticlesTable)
      .where(eq(chatbotKbArticlesTable.isActive, true));

    let matchedArticle = null;
    let bestScore = 0;

    for (const article of articles) {
      const keywords = (article.triggerKeywords || "")
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      let score = 0;
      for (const kw of keywords) {
        if (lowerContent.includes(kw)) {
          score += kw.length;
        }
      }
      if (lowerContent.includes(article.title.toLowerCase())) {
        score += 20;
      }
      if (score > bestScore) {
        bestScore = score;
        matchedArticle = article;
      }
    }

    if (matchedArticle && bestScore > 0) {
      const [msg] = await db
        .insert(chatbotMessagesTable)
        .values({
          sessionId,
          sender: "BOT",
          content: matchedArticle.answerContent,
          intentDetected: matchedArticle.category,
          kbArticleId: matchedArticle.id,
        })
        .returning({ id: chatbotMessagesTable.id });

      const intent = matchedArticle.category;
      let quickReplies: string[] | undefined;

      if (intent === "FAQ_UMUM") {
        quickReplies = ["Cara nego harga", "Bicara dengan Petani"];
      } else if (intent === "NEGO") {
        quickReplies = ["Bicara dengan Petani", "Cara pengiriman"];
      }

      return {
        reply: matchedArticle.answerContent,
        intentDetected: intent,
        quickReplies,
        kbArticleId: matchedArticle.id,
      };
    }

    const newFallbackCount = (session.fallbackCount || 0) + 1;
    await db
      .update(chatbotSessionsTable)
      .set({ fallbackCount: newFallbackCount })
      .where(eq(chatbotSessionsTable.id, sessionId));

    let fallbackReply: string;
    let quickReplies: string[];

    if (newFallbackCount >= 2) {
      fallbackReply =
        "Sepertinya pertanyaanmu cukup spesifik. Mau aku sambungkan langsung ke Petani-nya?";
      quickReplies = ["Ya, sambungkan", "Tidak, lanjut tanya"];
    } else {
      fallbackReply =
        "Maaf, aku belum punya jawaban pasti soal itu. Mau coba tanya lagi atau aku sambungkan ke Petani?";
      quickReplies = [
        "Tanya lagi",
        "Ya, sambungkan",
        "Cara pengiriman",
        "Cara nego harga",
      ];
    }

    const [msg] = await db
      .insert(chatbotMessagesTable)
      .values({
        sessionId,
        sender: "BOT",
        content: fallbackReply,
      })
      .returning({ id: chatbotMessagesTable.id });

    return { reply: fallbackReply, quickReplies };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatbotMessages(sessionId: number) {
  return db
    .select({
      id: chatbotMessagesTable.id,
      sender: chatbotMessagesTable.sender,
      content: chatbotMessagesTable.content,
      intentDetected: chatbotMessagesTable.intentDetected,
      createdAt: chatbotMessagesTable.createdAt,
    })
    .from(chatbotMessagesTable)
    .where(eq(chatbotMessagesTable.sessionId, sessionId))
    .orderBy(chatbotMessagesTable.createdAt);
}

export async function escalateChatbotToFarmer(
  sessionId: number,
): Promise<{ roomId: string } | null> {
  try {
    const [session] = await db
      .select()
      .from(chatbotSessionsTable)
      .where(eq(chatbotSessionsTable.id, sessionId));

    if (!session) return null;

    await db
      .update(chatbotSessionsTable)
      .set({ status: "ESCALATED" })
      .where(eq(chatbotSessionsTable.id, sessionId));

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

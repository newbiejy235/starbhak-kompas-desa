"use server";

import { db } from "@/db";
import { chatbotKbArticlesTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

/** FAQ pusat bantuan memakai artikel basis pengetahuan chatbot yang aktif. */
export async function getHelpFaqs(): Promise<FaqItem[]> {
  const rows = await db
    .select({
      id: chatbotKbArticlesTable.id,
      question: chatbotKbArticlesTable.title,
      answer: chatbotKbArticlesTable.answerContent,
      category: chatbotKbArticlesTable.category,
    })
    .from(chatbotKbArticlesTable)
    .where(eq(chatbotKbArticlesTable.isActive, true))
    .orderBy(asc(chatbotKbArticlesTable.id))
    .limit(12);

  return rows;
}

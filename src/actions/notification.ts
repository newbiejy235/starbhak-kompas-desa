"use server";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function getUserNotifications(userId: number) {
  return db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
}

export async function getUnreadNotificationCount(userId: number) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.isRead, false),
      ),
    );
  return Number(rows[0]?.count ?? 0);
}

export async function markNotificationsRead(
  userId: number,
): Promise<ActionState> {
  const user = await getAuthUser(userId);
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
    revalidatePath("/user/home");
    return { success: true, message: "Notifikasi dibaca" };
  } catch {
    return { success: false, message: "Gagal memperbarui notifikasi" };
  }
}

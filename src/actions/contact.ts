"use server";

import { db } from "@/db";
import { contactMessagesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

const KEBUTUHAN_OPTIONS = ["petani", "pembeli", "mitra", "lainnya"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin(adminId: number) {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") return null;
  return admin;
}

export async function submitContactMessage(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || "";
  const subject = (formData.get("subject") as string) || "";
  const message = (formData.get("message") as string)?.trim() || "";

  if (!name) {
    return { success: false, message: "Nama tidak boleh kosong" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: "Format email tidak valid" };
  }

  if (!KEBUTUHAN_OPTIONS.includes(subject)) {
    return { success: false, message: "Silakan pilih jenis kebutuhan" };
  }

  if (!message) {
    return { success: false, message: "Pesan tidak boleh kosong" };
  }

  if (name.length > 150) {
    return { success: false, message: "Nama terlalu panjang (maks. 150 karakter)" };
  }

  if (whatsapp.length > 30) {
    return {
      success: false,
      message: "Nomor WhatsApp terlalu panjang (maks. 30 karakter)",
    };
  }

  if (message.length > 5000) {
    return {
      success: false,
      message: "Pesan terlalu panjang (maks. 5000 karakter)",
    };
  }

  try {
    await db.insert(contactMessagesTable).values({
      name,
      email,
      whatsapp: whatsapp || null,
      subject,
      message,
      status: "unread",
    });

    return {
      success: true,
      message: "Pesan berhasil dikirim. Terima kasih telah menghubungi kami.",
    };
  } catch (error) {
    console.error("submit contact message error:", error);
    return { success: false, message: "Gagal mengirim pesan. Silakan coba lagi." };
  }
}

export async function getContactMessages() {
  return db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));
}

export async function markContactMessageRead(
  messageId: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  try {
    await db
      .update(contactMessagesTable)
      .set({
        status: "read",
        updatedAt: new Date(),
      })
      .where(eq(contactMessagesTable.id, messageId));

    revalidatePath("/admin/messages");
    return { success: true, message: "Pesan ditandai sudah dibaca" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui pesan" };
  }
}

export async function deleteContactMessage(
  messageId: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  try {
    await db
      .delete(contactMessagesTable)
      .where(eq(contactMessagesTable.id, messageId));

    revalidatePath("/admin/messages");
    return { success: true, message: "Pesan berhasil dihapus" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus pesan" };
  }
}

export type ContactMessage = typeof contactMessagesTable.$inferSelect;

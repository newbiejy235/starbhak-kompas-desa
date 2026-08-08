"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { comparePassword, hashPassword } from "@/lib/auth/bcrypt";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function getProfile(userId: number) {
  return getAuthUser(userId);
}

export async function updateProfile(
  userId: number,
  data: FormData,
): Promise<ActionState> {
  const user = await getAuthUser(userId);
  if (!user) return { success: false, message: "Unauthorized" };

  const fullName = (data.get("fullName") as string)?.trim() || "";
  const username = (data.get("username") as string)?.trim() || "";
  const noTelp = (data.get("noTelp") as string)?.trim() || "";
  const address = (data.get("address") as string)?.trim() || "";
  const fotoProfile = (data.get("fotoProfile") as string)?.trim() || "";
  const currentPassword = (data.get("currentPassword") as string) || "";
  const newPassword = (data.get("newPassword") as string) || "";

  if (!fullName || !username || !noTelp) {
    return { success: false, message: "Lengkapi field wajib" };
  }

  try {
    const patch: Partial<typeof usersTable.$inferInsert> = {
      fullName,
      username,
      noTelp,
      address,
    };
    if (fotoProfile) patch.fotoProfile = fotoProfile;

    if (newPassword) {
      if (!currentPassword) {
        return { success: false, message: "Masukkan sandi saat ini" };
      }
      const row = await db
        .select({ password: usersTable.password })
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      const ok = await comparePassword(currentPassword, row[0]?.password ?? "");
      if (!ok) return { success: false, message: "Sandi saat ini salah" };
      if (newPassword.length < 6) {
        return { success: false, message: "Sandi baru minimal 6 karakter" };
      }
      patch.password = await hashPassword(newPassword);
    }

    await db.update(usersTable).set(patch).where(eq(usersTable.id, userId));
    revalidatePath("/petani/profile");
    revalidatePath("/admin/profile");
    revalidatePath("/user/profile");
    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui profil" };
  }
}

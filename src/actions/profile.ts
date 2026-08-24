"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { comparePassword, hashPassword } from "@/lib/auth/bcrypt";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import type { ActionState } from "@/lib/types/auth";

export async function getProfile(userId: number) {
  return getAuthUser(userId);
}

async function uploadProfileImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "kompas-desa/profiles",
          transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        },
      )
      .end(buffer);
  });

  return result.secure_url;
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
  const currentPassword = (data.get("currentPassword") as string) || "";
  const newPassword = (data.get("newPassword") as string) || "";
  const removeFoto = data.get("removeFoto") === "true";
  const fotoFile = data.get("fotoProfileFile") as File | null;

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

    if (removeFoto) {
      patch.fotoProfile = null;
    } else if (fotoFile && fotoFile.size > 0) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(fotoFile.type)) {
        return { success: false, message: "Format file harus JPG, JPEG, atau PNG" };
      }
      if (fotoFile.size > 5 * 1024 * 1024) {
        return { success: false, message: "Ukuran file maksimal 5MB" };
      }
      const url = await uploadProfileImage(fotoFile);
      patch.fotoProfile = url;
    }

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

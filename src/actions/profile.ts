"use server";

import { db } from "@/db";
import { usersTable, farmerProfileImagesTable, reviewsTable } from "@/db/schema";
import { eq, and, avg, sql, asc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { comparePassword, hashPassword } from "@/lib/auth/bcrypt";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import type { ActionState } from "@/lib/types/auth";

/* ============================================================
   getProfile — returns user + farmImages + reviewStats
   ============================================================ */
export async function getProfile(userId: number) {
  const user = await getAuthUser(userId);
  if (!user) return null;

  const farmImages = await db
    .select()
    .from(farmerProfileImagesTable)
    .where(eq(farmerProfileImagesTable.farmerId, userId))
    .orderBy(asc(farmerProfileImagesTable.sortOrder));

  const [reviewStats] = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, userId));

  return {
    ...user,
    farmImages,
    avgRating: reviewStats?.avgRating
      ? Number(Number(reviewStats.avgRating).toFixed(1))
      : 0,
    reviewCount: reviewStats?.reviewCount ?? 0,
  };
}

/* ============================================================
   Cloudinary helpers
   ============================================================ */
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

async function uploadFarmImage(file: File): Promise<{ publicId: string; secureUrl: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ public_id: string; secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "kompas-desa/farm-images",
            transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { public_id: string; secure_url: string });
          },
        )
        .end(buffer);
    },
  );

  return { publicId: result.public_id, secureUrl: result.secure_url };
}

/* ============================================================
   updateProfile
   ============================================================ */
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
  const bio = (data.get("bio") as string)?.trim() || "";
  const farmingExperience = (data.get("farmingExperience") as string)?.trim() || "";
  const farmArea = (data.get("farmArea") as string)?.trim() || "";
  const farmingMethod = (data.get("farmingMethod") as string)?.trim() || "";
  const village = (data.get("village") as string)?.trim() || "";
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
      address: address || null,
      bio: bio || null,
      farmingExperience: farmingExperience || null,
      farmArea: farmArea || null,
      farmingMethod: farmingMethod || null,
      village: village || null,
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

/* ============================================================
   Farm image actions
   ============================================================ */
export async function addFarmImage(
  farmerId: number,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user) return { success: false, message: "Unauthorized" };

  const file = formData.get("image") as File | null;
  const caption = (formData.get("caption") as string)?.trim() || "";

  if (!file || file.size === 0) {
    return { success: false, message: "Pilih gambar terlebih dahulu" };
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type)) {
    return { success: false, message: "Format file harus JPG, JPEG, atau PNG" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: "Ukuran file maksimal 5MB" };
  }

  try {
    const { publicId, secureUrl } = await uploadFarmImage(file);

    const [lastImage] = await db
      .select({ sortOrder: farmerProfileImagesTable.sortOrder })
      .from(farmerProfileImagesTable)
      .where(eq(farmerProfileImagesTable.farmerId, farmerId))
      .orderBy(sql`${farmerProfileImagesTable.sortOrder} DESC`)
      .limit(1);

    const nextSort = (lastImage?.sortOrder ?? -1) + 1;

    await db.insert(farmerProfileImagesTable).values({
      farmerId,
      publicId,
      secureUrl,
      caption: caption || null,
      sortOrder: nextSort,
    });

    revalidatePath("/petani/profile");
    return { success: true, message: "Foto berhasil ditambahkan" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengupload foto" };
  }
}

export async function removeFarmImage(
  farmerId: number,
  imageId: number,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    const [image] = await db
      .select()
      .from(farmerProfileImagesTable)
      .where(
        and(
          eq(farmerProfileImagesTable.id, imageId),
          eq(farmerProfileImagesTable.farmerId, farmerId),
        ),
      );

    if (!image) {
      return { success: false, message: "Gambar tidak ditemukan" };
    }

    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch {
      // continue even if cloudinary delete fails
    }

    await db
      .delete(farmerProfileImagesTable)
      .where(eq(farmerProfileImagesTable.id, imageId));

    revalidatePath("/petani/profile");
    return { success: true, message: "Foto berhasil dihapus" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus foto" };
  }
}

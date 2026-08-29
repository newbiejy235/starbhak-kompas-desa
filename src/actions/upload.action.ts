"use server";

import { db } from "@/db";
import { ImageUpload } from "@/db/schema";
import { cloudinaryService } from "@/service/upload.service";
import cloudinary from "@/lib/cloudinary";

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("image");

  if (!(file instanceof File)) {
    throw new Error("File gambar tidak ditemukan");
  }

  const upload = await cloudinaryService.uploadImage(file);

  const [row] = await db
    .insert(ImageUpload)
    .values({
      publicId: upload.publicId,
      secureUrl: upload.secureUrl,
    })
    .returning({ id: ImageUpload.id });

  if (!row) {
    throw new Error("Gagal menyimpan data gambar");
  }

  return {
    id: row.id,
    publicId: upload.publicId,
    secureUrl: upload.secureUrl,
  };
}

export async function uploadMultiMediaAction(formData: FormData) {
  const files = formData.getAll("files");

  if (!files.length) {
    throw new Error("Tidak ada file yang dikirim");
  }

  const results: { id: number; publicId: string; secureUrl: string; type: "image" | "video" }[] = [];

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      if (!(file instanceof File)) return null;
      const isVideo = file.type.startsWith("video/");
      const result = isVideo
        ? await cloudinaryService.uploadVideo(file)
        : await cloudinaryService.uploadImage(file);

      const [row] = await db
        .insert(ImageUpload)
        .values({
          publicId: result.publicId,
          secureUrl: result.secureUrl,
        })
        .returning({ id: ImageUpload.id });

      if (!row) {
        throw new Error("Gagal menyimpan data media");
      }

      return {
        id: row.id,
        publicId: result.publicId,
        secureUrl: result.secureUrl,
        type: isVideo ? "video" as const : "image" as const,
      };
    }),
  );

  for (const r of uploadResults) {
    if (r) results.push(r);
  }

  return results;
}

export async function deleteMediaAction(publicId: string) {
  try {
    const isVideo = publicId.includes("video");
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Delete media failed:", error);
  }
}

"use server";

import { db } from "@/db";
import { ImageUpload } from "@/db/schema";
import { cloudinaryService } from "@/service/upload.service";

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

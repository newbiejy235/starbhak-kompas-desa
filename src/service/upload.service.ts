import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export class CloudService {
  async uploadImage(file: File): Promise<{
    publicId: string;
    secureUrl: string;
  }> {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Cloudinary tidak mengembalikan result"));
            }
          },
        );

        stream.end(buffer);
      });

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
      };
    } catch (error) {
      console.error("Upload image failed:", error);
      throw error;
    }
  }
}

export const cloudinaryService = new CloudService();

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadImageAction } from "@/actions/upload.action";

export default function ImageUploadField({
  name = "image",
  defaultValue,
  defaultImageId,
}: {
  name?: string;
  defaultValue?: string;
  defaultImageId?: number | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [imageId, setImageId] = useState<number | "">(defaultImageId ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const result = await uploadImageAction(formData);
      setImageId(result.id);
      setPreview(result.secureUrl);
    } catch {
      setError("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        Gambar Komoditas (opsional)
      </label>
      <input type="hidden" name={name} value={imageId} />
      {preview ? (
        <div className="flex items-center gap-3">
          <div className="relative w-40 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            <Image
              src={preview}
              alt="Pratinjau gambar"
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setImageId("");
                setPreview("");
              }}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} /> Hapus
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs text-[#025246] hover:text-[#024036]"
            >
              <ImagePlus size={14} /> Ganti
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#025246] hover:text-[#025246] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <ImagePlus size={24} />
          )}
          <span className="text-xs">{uploading ? "Mengunggah..." : "Pilih gambar"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[11px] text-gray-400 mt-1">
        Jika kosong, sistem menampilkan placeholder otomatis.
      </p>
    </div>
  );
}

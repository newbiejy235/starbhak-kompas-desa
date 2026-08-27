"use client";

import { useRef, useCallback, useState } from "react";
import { ImageIcon, Plus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { addFarmImage, removeFarmImage } from "@/actions/profile";
import { formatImage } from "@/components/shared/States";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

export default function FotoUsahaCard({
  profile,
  userId,
  onReload,
}: {
  profile: ProfileData;
  userId: number;
  onReload: () => void;
}) {
  const farmFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFarm, setUploadingFarm] = useState(false);

  const handleFarmFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Format file harus JPG, JPEG, atau PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setUploadingFarm(true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await addFarmImage(userId, fd);
        if (res.success) {
          toast.success(res.message);
          onReload();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("Gagal mengupload foto");
      } finally {
        setUploadingFarm(false);
      }
    },
    [userId, onReload],
  );

  const handleRemoveFarmImage = useCallback(
    async (imageId: number) => {
      const res = await removeFarmImage(userId, imageId);
      if (res.success) {
        toast.success(res.message);
        onReload();
      } else {
        toast.error(res.message);
      }
    },
    [userId, onReload],
  );

  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#025246]" />
            Foto Usaha
            {profile.farmImages.length > 0 && (
              <span className="text-xs font-normal text-gray-400">
                ({profile.farmImages.length})
              </span>
            )}
          </h2>
          <input
            ref={farmFileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFarmFileSelect}
            className="hidden"
            id="farm-upload"
          />
          <label
            htmlFor="farm-upload"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              uploadingFarm
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#025246] text-white hover:bg-[#024036]"
            }`}
          >
            {uploadingFarm ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            {uploadingFarm ? "Mengupload..." : "Tambah Foto"}
          </label>
        </div>

        {profile.farmImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-[#025246]/5 rounded-full flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-[#025246]/40" />
            </div>
            <p className="text-sm font-medium text-gray-600">Belum Ada Foto Usaha</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
              Tambahkan foto lahan, hasil panen, atau kegiatan usaha untuk
              meningkatkan kepercayaan pembeli.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.farmImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={formatImage(img.secureUrl) || ""}
                  alt={img.caption || "Foto usaha"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  type="button"
                  onClick={() => handleRemoveFarmImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[11px] text-white font-medium truncate">
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

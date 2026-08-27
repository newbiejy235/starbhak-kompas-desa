"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Loader2,
  X,
  Play,
  GripVertical,
  Upload,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { uploadMultiMediaAction } from "@/actions/upload.action";

const MAX_PHOTOS = 5;
const MAX_VIDEOS = 1;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

interface MediaItem {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  uploadedUrl?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

interface MediaUploadFieldProps {}

async function uploadItem(
  item: MediaItem,
  setItems: React.Dispatch<React.SetStateAction<MediaItem[]>>,
) {
  setItems((prev) =>
    prev.map((i) => (i.id === item.id ? { ...i, uploading: true, progress: 0 } : i)),
  );

  try {
    const formData = new FormData();
    formData.append("files", item.file);

    const results = await uploadMultiMediaAction(formData);

    if (results.length > 0) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, uploadedUrl: results[0].secureUrl, uploading: false, progress: 100 }
            : i,
        ),
      );
    }
  } catch {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, uploading: false, error: "Gagal mengunggah" }
          : i,
      ),
    );
    toast.error("Gagal mengunggah file");
  }
}

export default function MediaUploadField(
  _props: MediaUploadFieldProps,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const photoCount = items.filter((i) => i.type === "image").length;
  const videoCount = items.filter((i) => i.type === "video").length;

  const canAddPhoto = photoCount < MAX_PHOTOS;
  const canAddVideo = videoCount < MAX_VIDEOS;
  const isUploading = items.some((i) => i.uploading);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  const validateFile = useCallback(
    (file: File): string | null => {
      const isImage = ALLOWED_PHOTO_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        return "Format file tidak didukung";
      }

      if (isImage && !canAddPhoto) {
        return `Batas maksimal ${MAX_PHOTOS} foto tercapai`;
      }

      if (isVideo && !canAddVideo) {
        return `Batas maksimal ${MAX_VIDEOS} video tercapai`;
      }

      if (isImage && file.size > MAX_PHOTO_SIZE) {
        return `Ukuran foto maksimal ${MAX_PHOTO_SIZE / (1024 * 1024)}MB`;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        return `Ukuran video maksimal ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`;
      }

      return null;
    },
    [canAddPhoto, canAddVideo],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validItems: MediaItem[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          continue;
        }

        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        validItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          type: isVideo ? "video" : "image",
        });
      }

      if (validItems.length === 0) return;

      setItems((prev) => [...prev, ...validItems]);

      for (const item of validItems) {
        uploadItem(item, setItems);
      }
    },
    [validateFile],
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (dragIndex === null || dragIndex === index) return;

    setItems((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragIndex(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600">
          Media Produk
        </label>
        <div className="flex items-center gap-3 text-[11px]">
          <span
            className={`font-medium ${
              photoCount >= MAX_PHOTOS ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Foto: {photoCount}/{MAX_PHOTOS}
          </span>
          <span
            className={`font-medium ${
              videoCount >= MAX_VIDEOS ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Video: {videoCount}/{MAX_VIDEOS}
          </span>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-full min-h-[120px] rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-2 cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-gray-200 hover:border-primary/50 hover:bg-primary/[0.02]"
          }
          ${isUploading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <Upload
          size={24}
          className={isDragging ? "text-primary" : "text-gray-400"}
        />
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {isDragging
              ? "Lepaskan file di sini"
              : "Klik atau seret file ke sini"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Foto: JPG, PNG, WebP (maks 5MB) | Video: MP4, MOV, WebM (maks 50MB)
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...ALLOWED_PHOTO_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={item.type === "image"}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative aspect-square rounded-xl overflow-hidden border
                bg-gray-100 group
                ${dragIndex === index ? "opacity-50 scale-95" : ""}
                ${item.type === "image" ? "cursor-grab active:cursor-grabbing" : ""}
              `}
            >
              <Image
                src={item.preview}
                alt={`Media ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                unoptimized
              />

              {index === 0 && item.type === "image" && (
                <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  Cover
                </div>
              )}

              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={14} className="text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}

              {item.type === "image" && (
                <div className="absolute top-1.5 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={10} />
              </button>

              {item.uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={20} className="text-white animate-spin" />
                  <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              {item.error && (
                <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-1 p-1">
                  <AlertCircle size={16} className="text-white" />
                  <span className="text-[9px] text-white text-center leading-tight">
                    {item.error}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-[11px] text-gray-400">
          Foto pertama (#1) akan menjadi Cover Utama. Seret untuk mengubah urutan.
        </p>
      )}
    </div>
  );
}

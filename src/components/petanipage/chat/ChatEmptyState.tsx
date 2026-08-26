"use client";

import { MessageCircle, Pin } from "lucide-react";

interface ChatEmptyStateProps {
  /**
   * "default"  -> tidak ada percakapan sama sekali
   * "pinned"   -> filter "Disematkan" aktif tapi kosong
   * "search"   -> hasil pencarian kosong
   */
  variant?: "default" | "pinned" | "search";
  searchTerm?: string;
}

const COPY: Record<
  "default" | "pinned" | "search",
  { icon: React.ReactNode; title: string; description: string }
> = {
  default: {
    icon: <MessageCircle size={40} strokeWidth={1.5} />,
    title: "Belum Ada Percakapan",
    description:
      "Percakapan dengan pembeli akan muncul di sini saat mereka mulai menghubungi Anda.",
  },
  pinned: {
    icon: <Pin size={40} strokeWidth={1.5} />,
    title: "Belum Ada Percakapan Disematkan",
    description:
      "Sematkan percakapan penting agar lebih mudah ditemukan saat Anda sedang menjalin kerja sama.",
  },
  search: {
    icon: <MessageCircle size={40} strokeWidth={1.5} />,
    title: "Tidak Ditemukan",
    description: "Coba gunakan kata kunci lain untuk mencari percakapan.",
  },
};

export default function ChatEmptyState({
  variant = "default",
  searchTerm,
}: ChatEmptyStateProps) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 text-gray-200">{copy.icon}</div>
      <h3 className="text-base font-semibold text-gray-900">{copy.title}</h3>
      <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-gray-500">
        {variant === "search" && searchTerm ? (
          <>
            Tidak ada percakapan yang cocok dengan{" "}
            <span className="font-medium text-gray-700">
              &ldquo;{searchTerm}&rdquo;
            </span>
            .
          </>
        ) : (
          copy.description
        )}
      </p>
    </div>
  );
}

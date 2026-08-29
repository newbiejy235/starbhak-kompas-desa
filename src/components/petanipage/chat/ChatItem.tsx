"use client";

import Image from "next/image";
import { Pin } from "lucide-react";
import { getInitials } from "@/lib/format";
import type { ChatRoom } from "./ChatList";

interface ChatItemProps {
  room: ChatRoom;
  href: string;
  isActive?: boolean;
  isPinned: boolean;
  onTogglePin: (roomId: number) => void;
}

/**
 * "10:42" jika hari ini, "Kemarin" jika kemarin, "20 Agu" jika lebih lama.
 */
function formatChatTime(input: string | number | Date): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (date >= startOfYesterday) {
    return "Kemarin";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}


export default function ChatItem({
  room,
  href,
  isActive = false,
  isPinned,
  onTogglePin,
}: ChatItemProps) {
  const hasUnread = room.unreadCount > 0;

  const handlePinClick = (e: React.MouseEvent) => {
    // Cegah navigasi ke halaman percakapan saat tombol pin ditekan
    e.preventDefault();
    e.stopPropagation();
    onTogglePin(room.id);
  };

  return (
    <a
      href={href}
      className={`group flex items-center gap-3 px-4 py-3.5 transition-colors duration-200 sm:px-5 ${
        isActive
          ? "border-l-2 border-primary bg-[#F5FAF8]"
          : "border-l-2 border-transparent hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {room.otherAvatarUrl ? (
          <Image
            src={room.otherAvatarUrl}
            alt={room.otherName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(room.otherName)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-[15px] ${
              hasUnread
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-800"
            }`}
          >
            {room.otherName}
          </p>
          <span className={`shrink-0 text-xs ${hasUnread ? "font-bold text-primary" : "text-gray-400"}`}>
            {formatChatTime(room.lastMessageAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className={`truncate text-sm ${hasUnread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
            {room.lastMessage || "Belum ada pesan"}
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            {hasUnread && (
              <span
                className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-bold text-white shadow-sm"
                aria-label={`${room.unreadCount} pesan belum dibaca`}
              >
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pin action — ruang selalu dicadangkan agar teks tidak tertindih */}
      <div className="flex w-7 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={handlePinClick}
          aria-label={
            isPinned
              ? `Lepas sematan percakapan dengan ${room.otherName}`
              : `Sematkan percakapan dengan ${room.otherName}`
          }
          aria-pressed={isPinned}
          title={isPinned ? "Lepas Sematan" : "Sematkan"}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isPinned
              ? "bg-primary/10 text-primary opacity-100"
              : "text-gray-400 opacity-0 hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          <Pin size={14} strokeWidth={2.25} fill={isPinned ? "currentColor" : "none"} />
        </button>
      </div>
    </a>
  );
}

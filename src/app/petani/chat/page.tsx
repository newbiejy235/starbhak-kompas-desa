"use client";

import { useCallback, useMemo, useState } from "react";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { getChatRoomsForUser, toggleChatRoomPin } from "@/actions/chat";
import ChatList, {
  ChatFilter,
  ChatRoom,
} from "@/components/petanipage/chat/ChatList";
import { MessageCircle, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

type RawRoom = Awaited<ReturnType<typeof getChatRoomsForUser>>[number];

function toChatRoom(r: RawRoom): ChatRoom {
  return {
    id: r.id,
    otherName: r.buyerName,
    otherAvatarUrl: r.buyerFotoProfile,
    lastMessage: r.lastMessage ?? "",
    lastMessageAt: r.lastMessageAt ?? r.createdAt,
    unreadCount: r.unreadCount ?? 0,
    pinned: r.pinned ?? false,
  };
}

function ChatSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col animate-pulse">
      <div className="shrink-0 border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 sm:px-5"
          >
            <Skeleton className="h-11 w-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-10 rounded-md" />
              </div>
              <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PetaniChatPage() {
  const user = getClientUser();
  const userId = user?.id ?? 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("all");

  const fetchRooms = useCallback(async () => {
    if (!userId) return [];
    return getChatRoomsForUser(userId, "petani");
  }, [userId]);

  const { data: rooms, loading, reload } = useFetch(fetchRooms, [userId]);

  const chatRooms = useMemo(() => (rooms || []).map(toChatRoom), [rooms]);

  const unreadCount = useMemo(
    () => chatRooms.filter((r) => r.unreadCount > 0).length,
    [chatRooms],
  );

  const pinnedCount = useMemo(
    () => chatRooms.filter((r) => r.pinned).length,
    [chatRooms],
  );

  const handleTogglePin = useCallback(
    async (roomId: number) => {
      if (!userId) return;
      await toggleChatRoomPin(roomId, userId);
      reload();
    },
    [userId, reload],
  );

  if (loading) return <ChatSkeleton />;

  const totalRooms = chatRooms.length;

  const filters: { key: ChatFilter; label: string; count?: number }[] = [
    { key: "all", label: "Semua" },
    { key: "unread", label: "Belum Dibaca", count: unreadCount },
    { key: "pinned", label: "Disematkan", count: pinnedCount },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white rounded-2xl">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#025246]/10 text-[#025246]">
            <MessageCircle size={20} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Pesan Masuk
            </h1>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              Kelola percakapan dan jalin kerja sama dengan pembeli.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari percakapan..."
            aria-label="Cari percakapan"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#025246] focus:outline-none focus:ring-1 focus:ring-[#025246]"
          />
        </div>

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Filter percakapan"
          className="mt-3 flex items-center gap-1"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${isActive
                  ? "bg-[#025246]/10 font-semibold text-[#025246]"
                  : "font-medium text-gray-500 hover:text-gray-900"
                  }`}
              >
                {filter.label}
                {typeof filter.count === "number" && filter.count > 0 && (
                  <span
                    className={`text-xs ${isActive ? "text-[#025246]" : "text-gray-400"
                      }`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Chat list */}
      <main className="min-h-0 flex-1 overflow-hidden">
        <ChatList
          rooms={chatRooms}
          currentUserId={userId}
          role="petani"
          basePath="/petani/chat"
          activeFilter={activeFilter}
          searchTerm={searchTerm}
          onTogglePin={handleTogglePin}
        />
      </main>

      {/* Footer info */}
      {totalRooms > 0 && (
        <div className="shrink-0 border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-400 sm:px-6">
          Menampilkan {totalRooms} percakapan aktif
        </div>
      )}
    </div>
  );
}

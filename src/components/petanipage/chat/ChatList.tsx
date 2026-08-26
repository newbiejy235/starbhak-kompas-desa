"use client";

import { useMemo } from "react";
import ChatItem from "./ChatItem";
import ChatEmptyState from "./ChatEmptyState";

/**
 * Bentuk data satu percakapan.
 *
 * CATATAN INTEGRASI: sesuaikan field di bawah ini dengan bentuk data asli
 * yang dikembalikan oleh `getChatRoomsForUser` di project Anda. Field
 * `pinned` bersifat opsional — jika backend belum menyimpan status pin,
 * cukup biarkan undefined dan gunakan state lokal (lihat page.tsx).
 */
export interface ChatRoom {
  id: number;
  buyerId?: number;
  buyerName: string;
  buyerAvatarUrl?: string | null;
  lastMessage: string;
  lastMessageAt: string | number | Date;
  unreadCount: number;
  /** Status pin dari backend, jika sudah tersedia. */
  pinned?: boolean;
}

export type ChatFilter = "all" | "unread" | "pinned";

interface ChatListProps {
  rooms: ChatRoom[];
  currentUserId: number;
  role: "petani" | "pembeli";
  basePath: string;
  /** Room yang sedang dibuka (untuk highlight state aktif). */
  activeRoomId?: number;
  /** Filter yang sedang aktif, dikelola dari halaman induk. */
  activeFilter?: ChatFilter;
  /** Kata kunci pencarian, dikelola dari halaman induk. */
  searchTerm?: string;
  /** Daftar id chat yang disematkan secara lokal (client-side). */
  pinnedIds?: number[];
  onTogglePin?: (roomId: number) => void;
}

export default function ChatList({
  rooms,
  currentUserId,
  role,
  basePath,
  activeRoomId,
  activeFilter = "all",
  searchTerm = "",
  pinnedIds = [],
  onTogglePin,
}: ChatListProps) {
  void currentUserId; // dicadangkan untuk kebutuhan integrasi mendatang (mis. read receipts)
  void role;

  const isPinned = (room: ChatRoom) =>
    room.pinned ?? pinnedIds.includes(room.id);

  const handleTogglePin = (roomId: number) => {
    onTogglePin?.(roomId);
  };

  const { pinnedRooms, otherRooms } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const matchesSearch = (room: ChatRoom) =>
      term.length === 0 ||
      room.buyerName.toLowerCase().includes(term) ||
      room.lastMessage.toLowerCase().includes(term);

    const matchesFilter = (room: ChatRoom) => {
      if (activeFilter === "unread") return room.unreadCount > 0;
      if (activeFilter === "pinned") return isPinned(room);
      return true;
    };

    const filtered = rooms.filter((r) => matchesSearch(r) && matchesFilter(r));

    const sortByRecency = (a: ChatRoom, b: ChatRoom) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();

    const pinned = filtered.filter(isPinned).sort(sortByRecency);
    const others = filtered.filter((r) => !isPinned(r)).sort(sortByRecency);

    return { pinnedRooms: pinned, otherRooms: others };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, searchTerm, activeFilter, pinnedIds]);

  const totalVisible = pinnedRooms.length + otherRooms.length;

  if (totalVisible === 0) {
    if (searchTerm.trim().length > 0) {
      return <ChatEmptyState variant="search" searchTerm={searchTerm} />;
    }
    if (activeFilter === "pinned") {
      return <ChatEmptyState variant="pinned" />;
    }
    return <ChatEmptyState variant="default" />;
  }

  // Saat filter "Disematkan" aktif, semua hasil sudah pasti pinned — tidak
  // perlu ditampilkan sebagai dua section terpisah.
  const showSections = activeFilter === "all" && pinnedRooms.length > 0;

  return (
    <div className="custom-scrollbar h-full overflow-y-auto">
      {showSections ? (
        <>
          <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:px-5">
            Disematkan
          </div>
          <div>
            {pinnedRooms.map((room) => (
              <ChatItem
                key={room.id}
                room={room}
                href={`${basePath}/${room.id}`}
                isActive={activeRoomId === room.id}
                isPinned
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>

          <div className="mx-4 my-1 border-t border-gray-100 sm:mx-5" />

          <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:px-5">
            Semua Pesan
          </div>
          <div>
            {otherRooms.map((room) => (
              <ChatItem
                key={room.id}
                room={room}
                href={`${basePath}/${room.id}`}
                isActive={activeRoomId === room.id}
                isPinned={false}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </>
      ) : (
        <div>
          {[...pinnedRooms, ...otherRooms].map((room) => (
            <ChatItem
              key={room.id}
              room={room}
              href={`${basePath}/${room.id}`}
              isActive={activeRoomId === room.id}
              isPinned={isPinned(room)}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

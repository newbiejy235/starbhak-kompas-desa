"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { getChatRoomsForUser } from "@/actions/chat";
import { useChatSSE } from "@/lib/hooks/useChatSSE";
import ChatList from "@/components/shared/chat/ChatList";
import ChatRoomView from "@/components/shared/chat/ChatRoomView";
import { LoadingState } from "@/components/shared/States";
import { MessageCircle } from "lucide-react";

interface ChatRoomItem {
  id: number;
  buyerId: number;
  farmerId: number;
  commodityId: number;
  status: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  buyerName: string;
  farmerName: string;
  commodityName: string;
  commodityPrice: string;
  commodityImage: string | null;
  commodityUnit: string;
  hasDeal?: boolean;
}

export default function UserChatPage() {
  const params = useParams<{ roomId?: string }>();
  const router = useRouter();
  const user = getClientUser();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    params.roomId ? Number(params.roomId) : null,
  );

  const { data: rooms, loading } = useFetch(
    async () => {
      if (!user) return [];
      return getChatRoomsForUser(user.id, "pembeli");
    },
    [user?.id],
  );

  const handleSelectRoom = useCallback((roomId: number) => {
    setSelectedRoomId(roomId);
    router.push(`/user/chat/${roomId}`, { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    setSelectedRoomId(null);
    router.push("/user/chat", { scroll: false });
  }, [router]);

  if (loading) return <LoadingState />;

  const totalRooms = rooms?.length || 0;

  return (
    <div className="flex h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-2rem)] bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden animate-fade-up">
      {/* Panel Kiri — Chat List */}
      <div
        className={`w-full lg:w-[380px] lg:min-w-[380px] border-r border-gray-200 flex-shrink-0 ${
          selectedRoomId ? "hidden lg:flex" : "flex"
        } flex-col`}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#025246] to-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pesan</h1>
              <p className="text-xs text-gray-500">Percakapan dan negosiasi</p>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            rooms={(rooms || []) as ChatRoomItem[]}
            currentUserId={user?.id || 0}
            role="pembeli"
            basePath="/user/chat"
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoomId}
          />
        </div>

        {totalRooms > 0 && (
          <p className="text-center text-[11px] text-gray-400 py-2 border-t border-gray-100">
            {totalRooms} percakapan
          </p>
        )}
      </div>

      {/* Panel Kanan — Chat Room / Placeholder */}
      <div
        className={`flex-1 ${
          !selectedRoomId ? "hidden lg:flex" : "flex"
        } flex-col`}
      >
        {selectedRoomId ? (
          <ChatRoomPanel
            roomId={selectedRoomId}
            userId={user?.id ?? 0}
            userFullName={user?.fullName ?? "Anda"}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#025246]/10 to-emerald-500/10 rounded-3xl flex items-center justify-center mb-5">
              <MessageCircle size={36} className="text-[#025246]/40" />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-2">
              Pilih Percakapan
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Pilih percakapan dari daftar di sebelah kiri untuk mulai mengobrol.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatRoomPanel({
  roomId,
  userId,
  userFullName,
  onBack,
}: {
  roomId: number;
  userId: number;
  userFullName: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const { room, messages, loading, sendMessage, editMessage, deleteMessage, negotiationStatus, refreshNegotiationStatus } =
    useChatSSE(roomId, userId, userFullName);

  const handleOrderCreated = () => {
    router.push("/user/orders");
  };

  if (loading) return <LoadingState />;

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-gray-400 mb-3">Percakapan tidak ditemukan.</p>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Kembali ke daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentUserId={userId}
      currentRole="pembeli"
      onSendMessage={sendMessage}
      onOrderCreated={handleOrderCreated}
      onBack={onBack}
      onEditMessage={editMessage}
      onDeleteMessage={deleteMessage}
      negotiationStatus={negotiationStatus}
      onRefreshNegotiation={refreshNegotiationStatus}
    />
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getClientUser } from "@/lib/auth/client";
import { useChatSSE } from "@/lib/hooks/useChatSSE";
import ChatRoomView from "@/components/shared/chat/ChatRoomView";
import { LoadingState } from "@/components/shared/States";

export default function UserChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [currentUser] = useState(() => getClientUser());
  const userId = currentUser?.id ?? 0;
  const userFullName = currentUser?.fullName ?? "Anda";
  const rid = Number(roomId);

  const { room, messages, loading, sendMessage, editMessage, deleteMessage } = useChatSSE(rid, userId, userFullName);

  const handleOrderCreated = (orderId?: number) => {
    if (orderId && orderId > 0) {
      router.push(`/user/checkout/${orderId}`);
      return;
    }
    router.push("/user/orders");
  };

  if (loading) return <LoadingState />;
  if (!room) return <div className="text-center py-20 text-gray-500">Chat tidak ditemukan.</div>;

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentUserId={userId}
      currentRole="pembeli"
      onSendMessage={sendMessage}
      onOrderCreated={handleOrderCreated}
      onBack={() => router.push("/user/chat")}
      onEditMessage={editMessage}
      onDeleteMessage={deleteMessage}
    />
  );
}
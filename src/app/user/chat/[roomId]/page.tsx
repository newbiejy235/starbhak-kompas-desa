"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getClientUser } from "@/lib/auth/client";
import {
  getChatRoomDetail,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
} from "@/actions/chat";
import { addToCart } from "@/lib/cart";
import ChatRoomView from "@/components/shared/chat/ChatRoomView";
import { LoadingState } from "@/components/shared/States";

interface ChatRoomData {
  id: number;
  buyerId: number;
  farmerId: number;
  commodityId: number;
  status: string;
  commodityName: string;
  commodityPrice: string;
  commodityMinPrice: string | null;
  commodityMaxPrice: string | null;
  commodityStock: string;
  commodityUnit: string;
  commodityImage: string | null;
  commodityDescription: string | null;
  commodityStatus: string;
  buyerName: string;
  buyerFoto: string | null;
  farmerName: string;
  farmerFoto: string | null;
  farmerAddress: string | null;
}

interface ChatMessageData {
  id: number;
  roomId: number;
  senderId: number;
  type: string;
  content: string;
  offerPrice: string | null;
  offerQuantity: string | null;
  isRead: boolean;
  createdAt: Date;
  senderName: string;
  senderFoto: string | null;
}

export default function UserChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const user = getClientUser();
  const [room, setRoom] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoom = useCallback(async () => {
    if (!user || !roomId) return;
    const [roomData, msgs] = await Promise.all([
      getChatRoomDetail(Number(roomId)),
      getChatMessages(Number(roomId)),
    ]);
    setRoom(roomData as ChatRoomData);
    setMessages(msgs as unknown as ChatMessageData[]);
    setLoading(false);
    await markMessagesAsRead(Number(roomId), user.id);
  }, [user, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!user || !roomId) return;
    const interval = setInterval(async () => {
      const msgs = await getChatMessages(Number(roomId));
      setMessages(msgs as unknown as ChatMessageData[]);
      await markMessagesAsRead(Number(roomId), user!.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [user, roomId]);

  const handleSendMessage = async (
    content: string,
    type: string = "text",
    offerPrice?: number,
    offerQuantity?: number,
  ) => {
    if (!user || !roomId) return;
    await sendChatMessage(
      Number(roomId),
      user.id,
      content,
      type as "text" | "offer" | "counter_offer" | "accept" | "reject" | "system",
      offerPrice,
      offerQuantity,
    );
    const msgs = await getChatMessages(Number(roomId));
    setMessages(msgs as unknown as ChatMessageData[]);
  };

  const handleRespondToOffer = async (offerId: number, response: "accepted" | "rejected") => {
    await loadRoom();
  };

  if (loading) return <LoadingState />;
  if (!room) return <div className="text-center py-20 text-gray-500">Chat tidak ditemukan.</div>;

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentUserId={user?.id || 0}
      currentRole="pembeli"
      onSendMessage={handleSendMessage}
      onRespondToOffer={handleRespondToOffer}
      onBack={() => router.push("/user/chat")}
    />
  );
}

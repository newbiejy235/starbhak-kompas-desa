"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getClientUser } from "@/lib/auth/client";
import {
  getChatRoomDetail,
  getChatMessages,
  getNewMessages,
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

const POLL_INTERVAL_MS = 1000;

export default function UserChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [currentUser] = useState(() => getClientUser());
  const userId = currentUser?.id ?? 0;
  const userFullName = currentUser?.fullName ?? "Anda";
  const [room, setRoom] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(true);

  const rid = Number(roomId);
  const requestSeq = useRef(0);
  const tempIdRef = useRef(0);
  const lastMsgIdRef = useRef(0);
  const prevRidRef = useRef(0);

  useEffect(() => {
    if (prevRidRef.current !== rid) {
      prevRidRef.current = rid;
      lastMsgIdRef.current = 0;
      setMessages([]);
    }
  }, [rid]);

  const refresh = useCallback(
    async (showLoading = false) => {
      if (!userId || !rid) return;
      const seq = ++requestSeq.current;
      if (showLoading) setLoading(true);
      try {
        const [roomData, msgs] = await Promise.all([
          getChatRoomDetail(rid),
          getChatMessages(rid),
        ]);
        if (seq !== requestSeq.current) return;
        setRoom(roomData as ChatRoomData);
        setMessages((prev) => {
          const next = msgs as unknown as ChatMessageData[];
          const hasTemp = prev.some((m) => m.id < 0);
          if (!hasTemp) {
            const prevLast = prev[prev.length - 1]?.id;
            const nextLast = next[next.length - 1]?.id;
            if (prev.length === next.length && prevLast === nextLast) return prev;
            return next;
          }
          const pendingTemps = prev.filter(
            (m) =>
              m.id < 0 &&
              !next.some(
                (n) =>
                  n.content === m.content &&
                  n.type === m.type &&
                  n.senderId === m.senderId,
              ),
          );
          return [...next, ...pendingTemps];
        });
        const maxId = msgs.reduce(
          (max, m) => Math.max(max, Number(m.id)),
          0,
        );
        lastMsgIdRef.current = maxId;
        if (roomData) await markMessagesAsRead(rid, userId);
      } catch (e) {
        console.error(e);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [userId, rid],
  );

  const pollNewMessages = useCallback(async () => {
    if (!userId || !rid) return;
    try {
      const newMsgs = await getNewMessages(rid, lastMsgIdRef.current);
      if (!newMsgs || newMsgs.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const add = (newMsgs as unknown as ChatMessageData[]).filter(
          (m) => !seen.has(m.id),
        );
        if (add.length === 0) return prev;
        const real = prev.filter((m) => m.id > 0);
        const temps = prev.filter((m) => m.id < 0);
        return [...real, ...add, ...temps];
      });
      const maxId = newMsgs.reduce(
        (max, m) => Math.max(max, Number(m.id)),
        lastMsgIdRef.current,
      );
      lastMsgIdRef.current = maxId;
      await markMessagesAsRead(rid, userId);
    } catch (e) {
      console.error(e);
    }
  }, [userId, rid]);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  useEffect(() => {
    if (!userId || !rid) return;
    let cancelled = false;
    let inFlight = false;
    const interval = setInterval(async () => {
      if (cancelled || inFlight || document.hidden) return;
      inFlight = true;
      try {
        await pollNewMessages();
      } finally {
        inFlight = false;
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId, rid, pollNewMessages]);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) pollNewMessages();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [pollNewMessages]);

  const handleSendMessage = async (
    content: string,
    type: string = "text",
    offerPrice?: number,
    offerQuantity?: number,
  ) => {
    if (!userId || !rid) return;
    setMessages((prev) => [
      ...prev,
      {
        id: --tempIdRef.current,
        roomId: rid,
        senderId: userId,
        type,
        content,
        offerPrice: offerPrice !== undefined ? String(offerPrice) : null,
        offerQuantity: offerQuantity !== undefined ? String(offerQuantity) : null,
        isRead: true,
        createdAt: new Date(),
        senderName: userFullName,
        senderFoto: null,
      },
    ]);
    await sendChatMessage(
      rid,
      userId,
      content,
      type as "text" | "offer" | "counter_offer" | "accept" | "reject" | "system",
      offerPrice,
      offerQuantity,
    );
    await pollNewMessages();
  };

  const handleAddToCart = (price: number, quantity: number) => {
    if (!room) return;
    addToCart(room.commodityId, quantity, price);
    router.push("/user/cart");
  };

  if (loading) return <LoadingState />;
  if (!room) return <div className="text-center py-20 text-gray-500">Chat tidak ditemukan.</div>;

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentUserId={userId}
      currentRole="pembeli"
      onSendMessage={handleSendMessage}
      onAddToCart={handleAddToCart}
      onBack={() => router.push("/user/chat")}
    />
  );
}
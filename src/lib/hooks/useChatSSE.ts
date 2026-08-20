"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getChatRoomDetail,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
} from "@/actions/chat";

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

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useChatSSE(roomId: number, userId: number, userFullName: string) {
  const [room, setRoom] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  const tempIdRef = useRef(0);
  const lastMsgIdRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connectSSE = useCallback(() => {
    cleanup();
    if (!mountedRef.current || !roomId || !userId) return;

    setConnectionStatus("connecting");
    const url = `/api/chat/stream?roomId=${roomId}&userId=${userId}&lastId=${lastMsgIdRef.current}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setConnectionStatus("connected");
    });

    es.addEventListener("messages", (e) => {
      const newMsgs = JSON.parse(e.data) as ChatMessageData[];
      if (!newMsgs || newMsgs.length === 0) return;

      setMessages((prev) => {
        const temps = prev.filter((m) => m.id < 0);
        const add = newMsgs.filter(
          (m) => !prev.some((p) => p.id === m.id),
        );
        if (add.length === 0) return prev;

        // Match each new real message to a temp, remove matched temp
        const usedTemps = new Set<number>();
        const matchedTemps = new Set<number>();
        for (const msg of add) {
          for (const t of temps) {
            if (usedTemps.has(t.id)) continue;
            if (
              t.senderId === msg.senderId &&
              t.type === msg.type &&
              t.content === msg.content
            ) {
              matchedTemps.add(t.id);
              usedTemps.add(t.id);
              break;
            }
          }
        }

        const remainingTemps = temps.filter((t) => !matchedTemps.has(t.id));
        return [...prev.filter((m) => m.id > 0), ...add, ...remainingTemps];
      });

      const maxId = newMsgs.reduce((max, m) => Math.max(max, m.id), lastMsgIdRef.current);
      lastMsgIdRef.current = maxId;

      markMessagesAsRead(roomId, userId).catch(() => {});
    });

    es.addEventListener("read", (e) => {
      const { messageIds } = JSON.parse(e.data) as { messageIds: number[] };
      if (!messageIds || messageIds.length === 0) return;

      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m.id) ? { ...m, isRead: true } : m)),
      );
    });

    es.addEventListener("error", () => {
      setConnectionStatus("disconnected");
      es.close();
      eventSourceRef.current = null;
      if (mountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => connectSSE(), 3000);
      }
    });
  }, [roomId, userId, cleanup]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    setRoom(null);
    setMessages([]);
    setLoading(true);
    lastMsgIdRef.current = 0;

    if (!roomId || !userId) return;

    let cancelled = false;

    (async () => {
      try {
        const [roomData, msgs] = await Promise.all([
          getChatRoomDetail(roomId),
          getChatMessages(roomId),
        ]);
        if (cancelled) return;
        setRoom(roomData as ChatRoomData);
        setMessages(msgs as unknown as ChatMessageData[]);
        const maxId = msgs.reduce((max, m) => Math.max(max, Number(m.id)), 0);
        lastMsgIdRef.current = maxId;
        if (roomData) await markMessagesAsRead(roomId, userId);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, userId]);

  useEffect(() => {
    if (loading) return;
    connectSSE();
    return () => cleanup();
  }, [loading, connectSSE, cleanup]);

  const sendMessage = useCallback(
    async (content: string, type: string = "text", offerPrice?: number, offerQuantity?: number) => {
      if (!userId || !roomId) return;

      setMessages((prev) => [
        ...prev,
        {
          id: --tempIdRef.current,
          roomId,
          senderId: userId,
          type,
          content,
          offerPrice: offerPrice !== undefined ? String(offerPrice) : null,
          offerQuantity: offerQuantity !== undefined ? String(offerQuantity) : null,
          isRead: false,
          createdAt: new Date(),
          senderName: userFullName,
          senderFoto: null,
        },
      ]);

      await sendChatMessage(
        roomId,
        userId,
        content,
        type as "text" | "offer" | "counter_offer" | "accept" | "reject" | "system",
        offerPrice,
        offerQuantity,
      );
    },
    [roomId, userId, userFullName],
  );

  return { room, messages, loading, connectionStatus, sendMessage };
}

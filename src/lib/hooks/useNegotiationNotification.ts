"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface NegotiationNotification {
  id: number;
  roomId: number;
  commodityName: string;
  price: string;
  quantity: string;
  unit: string;
  otherPartyName: string;
}

export function useNegotiationNotification(userId: number, basePath: string = "/user") {
  const router = useRouter();
  const [notification, setNotification] = useState<NegotiationNotification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const shownIdsRef = useRef<Set<number>>(new Set());
  const lastSeenIdRef = useRef(0);

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

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      cleanup();
      if (!mountedRef.current || !userId) return;

      const url = `/api/chat/negotiation/stream?lastSeenId=${lastSeenIdRef.current}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener("negotiation_accepted", (e) => {
        const data = JSON.parse(e.data) as NegotiationNotification;
        if (!mountedRef.current) return;

        if (shownIdsRef.current.has(data.id)) return;
        shownIdsRef.current.add(data.id);
        lastSeenIdRef.current = Math.max(lastSeenIdRef.current, data.id);

        setNotification(data);
      });

      es.addEventListener("error", () => {
        es.close();
        eventSourceRef.current = null;
        if (mountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => connect(), 3000);
        }
      });
    };

    connect();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [userId, cleanup]);

  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  const goToNegotiation = useCallback(
    (roomId: number) => {
      setNotification(null);
      router.push(`${basePath}/chat/${roomId}`);
    },
    [router, basePath],
  );

  return { notification, dismiss, goToNegotiation };
}

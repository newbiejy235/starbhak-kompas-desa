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

const SHOWN_IDS_KEY = "negotiation_shown_ids";
const LAST_SEEN_ID_KEY = "negotiation_last_seen_id";

function loadShownIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SHOWN_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveShownIds(ids: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SHOWN_IDS_KEY, JSON.stringify([...ids]));
  } catch {}
}

function loadLastSeenId(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(LAST_SEEN_ID_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveLastSeenId(id: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SEEN_ID_KEY, String(id));
  } catch {}
}

export function useNegotiationNotification(userId: number, basePath: string = "/user") {
  const router = useRouter();
  const [notification, setNotification] = useState<NegotiationNotification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const shownIdsRef = useRef<Set<number>>(loadShownIds());
  const lastSeenIdRef = useRef(loadLastSeenId());

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
        saveShownIds(shownIdsRef.current);

        lastSeenIdRef.current = Math.max(lastSeenIdRef.current, data.id);
        saveLastSeenId(lastSeenIdRef.current);

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

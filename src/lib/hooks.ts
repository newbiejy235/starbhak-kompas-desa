"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  getClientUser,
  subscribeToUserChanges,
  getRoleRedirect,
} from "@/lib/auth/client";

export function useAuth(expectedRole?: string) {
  const router = useRouter();
  const user = useSyncExternalStore(subscribeToUserChanges, getClientUser, () => null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated) setHydrated(true); 
  }, []); 

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (expectedRole && user.role !== expectedRole) {
      router.replace(getRoleRedirect(user.role));
    }
  }, [hydrated, user, expectedRole, router]);

  return { user: hydrated ? user : null, loading: !hydrated };
}

const fetchCache = new Map<string, { promise: Promise<unknown>; subscribers: number }>();

function getCacheKey(fn: Function, deps: unknown[]): string {
  return `${fn.toString()}::${JSON.stringify(deps)}`;
}

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let cancelled = false;
    const key = getCacheKey(fnRef.current, deps);

    const cached = fetchCache.get(key);
    if (cached) {
      cached.subscribers++;
      cached.promise.then(
        (res) => {
          if (!cancelled) {
            setData(res as T);
            setError(null);
          }
        },
        (e) => {
          if (!cancelled) {
            console.error(e);
            setError("Gagal memuat data");
          }
        },
      ).finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
        cached.subscribers--;
        if (cached.subscribers <= 0) fetchCache.delete(key);
      };
    }

    const entry = {
      promise: fnRef.current(),
      subscribers: 1,
    };
    fetchCache.set(key, entry);

    entry.promise.then(
      (res) => {
        if (!cancelled) {
          setData(res as T);
          setError(null);
        }
      },
      (e) => {
        if (!cancelled) {
          console.error(e);
          setError("Gagal memuat data");
        }
      },
    ).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      entry.subscribers--;
      if (entry.subscribers <= 0) fetchCache.delete(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = () => {
    setLoading(true);
    const key = getCacheKey(fnRef.current, deps);
    fetchCache.delete(key);
    return fnRef
      .current()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((e) => {
        console.error(e);
        setError("Gagal memuat data");
      })
      .finally(() => setLoading(false));
  };

  return { data, loading, error, reload };
}

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  const genRef = useRef(0);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    const gen = ++genRef.current;
    let active = true;
    setLoading(true);

    fnRef.current().then(
      (res) => {
        if (active && gen === genRef.current) {
          setData(res);
          setError(null);
        }
      },
      (e) => {
        if (active && gen === genRef.current) {
          console.error(e);
          setError("Gagal memuat data");
        }
      },
    ).finally(() => {
      if (active && gen === genRef.current) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => {
    const gen = ++genRef.current;
    setLoading(true);
    return fnRef
      .current()
      .then((res) => {
        if (gen === genRef.current) {
          setData(res);
          setError(null);
        }
      })
      .catch((e) => {
        if (gen === genRef.current) {
          console.error(e);
          setError("Gagal memuat data");
        }
      })
      .finally(() => {
        if (gen === genRef.current) {
          setLoading(false);
        }
      });
  }, []);

  return { data, loading, error, reload };
}

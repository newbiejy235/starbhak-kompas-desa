"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getClientUser,
  getRoleRedirect,
} from "@/lib/auth/client";

export function useAuth(expectedRole?: string) {
  const router = useRouter();
  const user = getClientUser();
  const loading = user === null;

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (expectedRole && user.role !== expectedRole) {
      router.replace(getRoleRedirect(user.role));
    }
  }, [user, expectedRole, router]);

  return { user, loading };
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
    (async () => {
      try {
        const res = await fnRef.current();
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Gagal memuat data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = () => {
    setLoading(true);
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

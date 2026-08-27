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
<<<<<<< HEAD
  const loading = user === undefined;

  useEffect(() => {
    if (loading) return;
=======
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydration detection: mark as hydrated after first client-side effect run
    // This prevents premature redirects during SSR/hydration mismatch
    if (!hydrated) setHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hydrated) return;
>>>>>>> 56d08fccaf481a3e657252f6f2b4600a3e29bbc5
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (expectedRole && user.role !== expectedRole) {
      router.replace(getRoleRedirect(user.role));
    }
<<<<<<< HEAD
  }, [loading, user, expectedRole, router]);

  return { user: user ?? null, loading };
=======
  }, [hydrated, user, expectedRole, router]);

  return { user: hydrated ? user : null, loading: !hydrated };
>>>>>>> 56d08fccaf481a3e657252f6f2b4600a3e29bbc5
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

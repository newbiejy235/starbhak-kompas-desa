"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Search, ShoppingCart, Bell } from "lucide-react";

import { getUnreadNotificationCount } from "@/actions/notification";
import { useAuth, useFetch } from "@/lib/hooks";

import SearchRecommendationDropdown from "@/components/userpage/SearchRecommendationDropdown";

/* ============================================================
   Token desain mengikuti DashboardShell / halaman petani
   ============================================================ */

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const iconBtn = `relative rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-white/80 hover:text-primary active:scale-95 ${focusRing}`;

/* ============================================================
   Pencarian
   ============================================================ */

export function HeaderSearch() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setDropdownOpen(false);

    const q = search.trim();

    if (q) {
      router.push(`/user/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/home");
    }
  };

  const handleChange = (value: string) => {
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const q = value.trim();

    if (q && q.length >= 2) {
      debounceRef.current = setTimeout(() => {
        router.push(`/user/search?q=${encodeURIComponent(q)}`);
      }, 800);
    }
  };

  const handleFocus = () => {
    setDropdownOpen(true);
  };

  const handleSelect = (value: string) => {
    setSearch(value);
    setDropdownOpen(false);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={submitSearch}
      role="search"
      className="hidden flex-1 mx-4 sm:relative sm:block lg:mx-8"
    >
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        placeholder="Cari komoditas atau petani..."
        aria-label="Cari komoditas atau petani"
        className={`h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 ${focusRing}`}
      />

      <SearchRecommendationDropdown
        query={search}
        isOpen={dropdownOpen}
        onClose={handleDropdownClose}
        onSelect={handleSelect}
        inputRef={inputRef}
      />
    </form>
  );
}

/* ============================================================
   Tombol aksi sisi kanan (hanya aksi spesifik pembeli):
   - Keranjang
   - Notifikasi
   Akses akun/profil berada pada dropdown profil di DashboardShell.
   ============================================================ */

export function HeaderActions() {
  const { user } = useAuth();
  const pathname = usePathname();

  const { data: unreadCount } = useFetch(
    () =>
      user
        ? getUnreadNotificationCount(user.id)
        : Promise.resolve(0),
    [user?.id, pathname],
  );

  const unread = Number(unreadCount ?? 0);

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      {/* Keranjang */}
      <Link
        href="/user/cart"
        aria-label="Keranjang belanja"
        aria-current={pathname.startsWith("/user/cart") ? "page" : undefined}
        className={`${iconBtn} ${pathname.startsWith("/user/cart") ? "bg-primary/10 text-primary" : ""
          }`}
      >
        <ShoppingCart size={19} />
      </Link>

      {/* Notifikasi */}
      <Link
        href="/user/notifications"
        aria-label={
          unread > 0 ? `Notifikasi (${unread} belum dibaca)` : "Notifikasi"
        }
        aria-current={
          pathname.startsWith("/user/notifications") ? "page" : undefined
        }
        className={`${iconBtn} ${pathname.startsWith("/user/notifications")
          ? "bg-primary/10 text-primary"
          : ""
          }`}
      >
        <Bell size={19} />

        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </div>
  );
}
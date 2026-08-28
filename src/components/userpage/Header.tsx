"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { getClientUser } from "@/lib/auth/client";
import { getUnreadNotificationCount } from "@/actions/notification";
import { useFetch } from "@/lib/hooks";

/* ============================================================
   Token desain mengikuti DashboardShell / halaman petani
   ============================================================ */
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

const iconBtn =
  `relative rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-white/80 hover:text-primary active:scale-95 ${focusRing}`;

/* ============================================================
   Pencarian — selaras dengan gaya input di dashboard petani
   ============================================================ */
export function HeaderSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/user/home?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/home");
    }
  };

  return (
    <form
      onSubmit={submitSearch}
      role="search"
      className="hidden sm:relative sm:block w-full max-w-xs lg:max-w-sm"
    >
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari komoditas..."
        aria-label="Cari komoditas"
        className={`h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${focusRing}`}
      />
    </form>
  );
}

/* ============================================================
   Tombol aksi: keranjang + notifikasi
   Profil & dropdown ada di DashboardShell.
   ============================================================ */
export function HeaderActions() {
  const pathname = usePathname();
  const user = getClientUser();

  const { data: unreadCount } = useFetch(
    () => (user ? getUnreadNotificationCount(user.id) : Promise.resolve(0)),
    [user?.id, pathname],
  );
  const unread = Number(unreadCount ?? 0);

  return (
    <div className="flex flex-shrink-0 items-center gap-0.5">
      <Link
        href="/user/cart"
        aria-label="Keranjang belanja"
        aria-current={pathname.startsWith("/user/cart") ? "page" : undefined}
        className={`${iconBtn} ${pathname.startsWith("/user/cart")
          ? "bg-primary/10 text-primary"
          : ""
          }`}
      >
        <ShoppingCart size={19} />
      </Link>
    </div>
  );
}

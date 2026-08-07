"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, Bell, LogOut } from "lucide-react";
import { getClientUser, clearSession } from "@/lib/auth/client";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const user = getClientUser();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/user/home?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/home");
    }
  };

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:pl-20 z-10">
      <div className="flex items-center gap-4 w-full">
        <form onSubmit={submitSearch} className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari komoditas..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-full"
          />
        </form>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link
          href="/user/orders"
          className={`relative p-2 rounded-full transition-colors ${
            pathname.startsWith("/user/orders")
              ? "text-[#025246] bg-[#025246]/10"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <ShoppingCart size={20} />
        </Link>
        <Link
          href="/user/notifications"
          className={`relative p-2 rounded-full transition-colors ${
            pathname.startsWith("/user/notifications")
              ? "text-[#025246] bg-[#025246]/10"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Bell size={20} />
        </Link>
        <button
          onClick={logout}
          title="Keluar"
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <LogOut size={20} />
        </button>
        <div className="w-8 h-8 bg-[#025246] rounded-full flex items-center justify-center text-white font-bold text-sm">
          {initial}
        </div>
      </div>
    </header>
  );
}

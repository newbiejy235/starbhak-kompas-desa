"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useActionState } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  LogOut,
  ChevronDown,
  UserRound,
  ShoppingBag,
  Star,
  Sprout,
  X,
  MapPin,
} from "lucide-react";
import { getClientUser, clearSession, updateSessionRole } from "@/lib/auth/client";
import { becomePetaniAction } from "@/actions/auth";
import type { ActionState } from "@/lib/types/auth";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = getClientUser();

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      const res = await becomePetaniAction(prev, data);
      if (res.success) {
        updateSessionRole("petani");
        router.push("/petani/dashboard");
      }
      return res;
    },
    null,
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const menuItems = [
    { href: "/user/profile", label: "Lihat Profil", icon: UserRound },
    { href: "/user/orders", label: "Pesanan Saya", icon: ShoppingBag },
    { href: "/user/reviews", label: "Ulasan Saya", icon: Star },
  ];

  return (
    <>
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
            href="/user/cart"
            className={`relative p-2 rounded-full transition-colors ${
              pathname.startsWith("/user/cart")
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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-[#025246] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {initial}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <nav className="p-2 flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#025246] transition-colors"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#00AA5B] hover:bg-[#00AA5B]/5 transition-colors"
                  >
                    <Sprout size={18} />
                    Daftar Jadi Petani
                  </button>
                </nav>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#025246] to-[#047857] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Sprout size={20} /> Daftar Jadi Petani
                </h2>
                <p className="text-xs text-white/70 mt-0.5">
                  Jual hasil pertanian Anda langsung di Kompas&apos;Desa
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form action={formAction} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={user?.id ?? ""} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Alamat Lahan / Lokasi
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="Contoh: Desa Sukamaju, Kec. Cianjur, Jawa Barat"
                    className="w-full rounded-2xl border border-[#C1C1C1] pl-11 pr-4 py-3 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
                  />
                </div>
              </div>
              {state && !state.success && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
              {state && state.success && (
                <p className="text-sm text-green-600">{state.message}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-bold text-white hover:bg-[#013d34] transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Daftar sebagai Petani"}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                Akun Anda akan otomatis beralih menjadi Petani dan dapat mengelola komoditas.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

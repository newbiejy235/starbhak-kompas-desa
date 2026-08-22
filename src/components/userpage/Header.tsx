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
import { getUnreadNotificationCount } from "@/actions/notification";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const { data: unreadCount } = useFetch(
    () => (user ? getUnreadNotificationCount(user.id) : Promise.resolve(0)),
    [user?.id, pathname],
  );
  const unread = Number(unreadCount ?? 0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Glassmorphism saat scroll (PRD 8.3)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setModalOpen(false);
      setClosingModal(false);
    }, 180);
  };

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
      <header
        className={`fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
          scrolled
            ? "bg-white/70 backdrop-blur-md border-b border-gray-200/60 shadow-sm"
            : "bg-[#F6F6F6] border-b border-transparent"
        }`}
      >
        <div className="flex items-center gap-4 w-full">
          <form onSubmit={submitSearch} className="hidden sm:flex items-center bg-white/80 border border-gray-200 rounded-full px-4 py-2 w-full max-w-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/user/cart"
            aria-label="Keranjang belanja"
            className={`relative p-2 rounded-full transition-all duration-200 active:scale-90 ${
              pathname.startsWith("/user/cart")
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm"
            }`}
          >
            <ShoppingCart size={20} />
          </Link>
          <Link
            href="/user/notifications"
            aria-label="Notifikasi"
            className={`relative p-2 rounded-full transition-all duration-200 active:scale-90 ${
              pathname.startsWith("/user/notifications")
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm"
            }`}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-white transition-colors active:scale-95 duration-150"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {initial}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-300 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-card border border-gray-200/80 shadow-lift overflow-hidden z-50 animate-scale-in origin-top-right">
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
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
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
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-success hover:bg-success/5 transition-colors"
                  >
                    <Sprout size={18} />
                    Daftar Jadi Petani
                  </button>
                </nav>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 w-full transition-colors"
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
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
              closingModal ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={closeModal}
          />
          <div
            className={`relative w-full max-w-md bg-white rounded-card shadow-lift overflow-hidden ${
              closingModal ? "animate-scale-out" : "animate-scale-in"
            }`}
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Sprout size={20} /> Daftar Jadi Petani
                </h2>
                <p className="text-xs text-white/70 mt-0.5">
                  Jual hasil pertanian Anda langsung di Kompas&apos;Desa
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
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
                  <MapPin size={16} className="absolute left-4 top-6 -translate-y-1/2 text-gray-400" />
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="Contoh: Desa Sukamaju, Kec. Cianjur, Jawa Barat"
                    className="w-full rounded-2xl border border-gray-300 pl-11 pr-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>
              </div>
              {state && !state.success && (
                <p className="text-sm text-danger animate-fade-in">{state.message}</p>
              )}
              {state && state.success && (
                <p className="text-sm text-success animate-fade-in">{state.message}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

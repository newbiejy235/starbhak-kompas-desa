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
  LifeBuoy,
} from "lucide-react";
import { clearSession, updateSessionRole } from "@/lib/auth/client";
import { becomePetaniAction } from "@/actions/auth";
import { getUnreadNotificationCount } from "@/actions/notification";
import { useAuth, useFetch } from "@/lib/hooks";
import Avatar from "@/components/ui/Avatar";
import type { ActionState } from "@/lib/types/auth";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/user/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/home");
    }
  };

  const handleChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q) {
      debounceRef.current = setTimeout(() => {
        router.push(`/user/search?q=${encodeURIComponent(q)}`);
      }, 600);
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
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Cari komoditas atau petani..."
        aria-label="Cari komoditas atau petani"
        className={`h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${focusRing}`}
      />
    </form>
  );
}

/* ============================================================
   Aksi kanan: keranjang, notifikasi, menu akun
   ============================================================ */
export function HeaderActions() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setModalOpen(false);
      setClosingModal(false);
    }, 180);
  };

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const menuItems = [
    { href: "/user/profile", label: "Lihat Profil", icon: UserRound },
    { href: "/user/orders", label: "Pesanan Saya", icon: ShoppingBag },
    { href: "/user/reviews", label: "Ulasan Saya", icon: Star },
    { href: "/user/bantuan", label: "Pusat Bantuan", icon: LifeBuoy },
  ];

  return (
    <>
      <div className="flex flex-shrink-0 items-center gap-0.5">
        <Link
          href="/user/cart"
          aria-label="Keranjang belanja"
          aria-current={pathname.startsWith("/user/cart") ? "page" : undefined}
          className={`${iconBtn} ${
            pathname.startsWith("/user/cart") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <ShoppingCart size={19} />
        </Link>
        <Link
          href="/user/notifications"
          aria-label={
            unread > 0 ? `Notifikasi (${unread} belum dibaca)` : "Notifikasi"
          }
          aria-current={
            pathname.startsWith("/user/notifications") ? "page" : undefined
          }
          className={`${iconBtn} ${
            pathname.startsWith("/user/notifications") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Bell size={19} />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <div className="relative ml-1" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`flex items-center gap-2 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-white/80 active:scale-95 ${focusRing}`}
          >
            <Avatar src={user?.fotoProfile} name={user?.fullName || "U"} size="sm" />
            <span className="hidden sm:block max-w-[140px] truncate text-sm font-semibold text-neutral-900">
              {user?.fullName}
            </span>
            <ChevronDown
              size={15}
              aria-hidden
              className={`text-gray-400 transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-64 origin-top-right overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-lift animate-scale-in"
            >
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="truncate text-sm font-bold text-gray-900">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-gray-400">{user?.email}</p>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-primary/5 hover:text-primary ${focusRing}`}
                  >
                    <item.icon size={18} aria-hidden />
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setModalOpen(true);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-success transition-colors duration-150 hover:bg-success/5 ${focusRing}`}
                >
                  <Sprout size={18} aria-hidden />
                  Daftar Jadi Petani
                </button>
              </nav>
              <div className="border-t border-gray-100 p-2">
                <button
                  type="button"
                  onClick={logout}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/5 ${focusRing}`}
                >
                  <LogOut size={18} aria-hidden />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal daftar jadi petani */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
              closingModal ? "animate-fade-out" : "animate-fade-in-fast"
            }`}
            onClick={closeModal}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="become-petani-title"
            className={`relative w-full max-w-md overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-lift ${
              closingModal ? "animate-scale-out" : "animate-scale-in"
            }`}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F7F5] text-primary"
                >
                  <Sprout size={20} strokeWidth={2} />
                </span>
                <div>
                  <h2 id="become-petani-title" className="text-lg font-bold tracking-tight text-gray-900">
                    Daftar Jadi Petani
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Jual hasil pertanian Anda langsung di Kompas&apos;Desa.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup"
                className={`rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 ${focusRing}`}
              >
                <X size={18} />
              </button>
            </div>
            <form action={formAction} className="space-y-4 p-6">
              <input type="hidden" name="userId" value={user?.id ?? ""} />
              <div>
                <label htmlFor="petani-address" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Alamat Lahan / Lokasi
                </label>
                <textarea
                  id="petani-address"
                  name="address"
                  rows={2}
                  placeholder="Contoh: Desa Sukamaju, Kec. Cianjur, Jawa Barat"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              {state && !state.success && (
                <p className="animate-fade-in text-sm text-danger">{state.message}</p>
              )}
              {state && state.success && (
                <p className="animate-fade-in text-sm text-success">{state.message}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                {isPending ? "Memproses..." : "Daftar sebagai Petani"}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                Akun Anda akan otomatis beralih menjadi Petani dan dapat mengelola komoditas.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

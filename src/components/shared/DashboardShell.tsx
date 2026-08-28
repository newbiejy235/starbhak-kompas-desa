"use client";

import { useEffect, useRef, useState, useActionState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  UserRound,
  ShoppingBag,
  Star,
  LifeBuoy,
  Sprout,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import {
  clearSession,
  updateSessionRole,
} from "@/lib/auth/client";
import { becomePetaniAction } from "@/actions/auth";
import type { ActionState } from "@/lib/types/auth";

/* ── Token desain ─────────────────────────────────────────── */
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

/* ── Props ────────────────────────────────────────────────── */
interface DashboardShellProps {
  role: "admin" | "petani" | "pembeli";
  sidebar: ReactNode;
  headerLabel: string;
  /** Kontrol tambahan di sisi kiri header (mis. pencarian). */
  headerLeft?: ReactNode;
  /** Tombol aksi di sisi kanan, ditampilkan sebelum blok profil. */
  headerRight?: ReactNode;
  children: ReactNode;
}

/* ── Component ────────────────────────────────────────────── */
export default function DashboardShell({
  role,
  sidebar,
  headerLabel,
  headerLeft,
  headerRight,
  children,
}: DashboardShellProps) {
  const { user, loading } = useAuth(role);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  /* ── Profile dropdown state ── */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── "Daftar Jadi Petani" modal state (pembeli only) ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);

  const [becomeState, becomeFormAction, becomePending] = useActionState(
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

  /* ── Scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Click-outside to close profile menu ── */
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  /* ── Helpers ── */
  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setModalOpen(false);
      setClosingModal(false);
    }, 180);
  };

  const profileHref = `/${role}/profile`;

  const menuItems = [
    { href: profileHref, label: "Lihat Profil", icon: UserRound },
    ...(role === "pembeli"
      ? [{ href: "/user/orders", label: "Pesanan Saya", icon: ShoppingBag }]
      : []),
    ...(role === "pembeli"
      ? [{ href: "/user/reviews", label: "Ulasan Saya", icon: Star }]
      : []),
    { href: `/${role}/bantuan`, label: "Pusat Bantuan", icon: LifeBuoy },
  ];

  /* ── Loading skeleton ── */
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-8" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </aside>

        {/* Header skeleton */}
        <header className="sticky top-0 z-30 lg:pl-64 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-5 w-36" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-5 w-20 hidden sm:block" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </header>

        <div className="lg:pl-64 p-4 sm:p-6 lg:p-8 pt-4 space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-card" />
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {sidebar}

      {/* Header sticky glassmorphism saat discroll */}
      <header
        className={`sticky top-0 z-30 lg:pl-64 transition-all duration-300 ease-smooth ${scrolled
          ? "bg-white/70 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          : "bg-transparent backdrop-blur-none"
          }`}
      >
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          {/* ── Left side ── */}
          <div className="flex min-w-0 items-center gap-3">
            <p className="text-sm font-semibold text-neutral-900 lg:hidden pl-12">
              KompasDesa
            </p>
            <p className="hidden lg:block text-sm font-semibold text-neutral-500 w-100">
              {headerLabel}
            </p>
            {headerLeft}
          </div>

          {/* ── Right side: action buttons + profile dropdown ── */}
          <div className="flex items-center gap-2.5">
            {headerRight}

            {/* Profile section — always present */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex items-center gap-2 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-white/80 active:scale-95 ${focusRing}`}
              >
                <Avatar
                  src={user.fotoProfile}
                  name={user.fullName}
                  size="sm"
                />
                <span className="hidden sm:block max-w-[140px] truncate text-sm font-semibold text-neutral-900">
                  {user.fullName}
                </span>
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""
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
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user.email}
                    </p>
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
                    {role === "pembeli" && (
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
                    )}
                  </nav>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      role="menuitem"
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
        </div>
      </header>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* ── Modal "Daftar Jadi Petani" (pembeli only) ── */}
      {role === "pembeli" && modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closingModal ? "animate-fade-out" : "animate-fade-in-fast"
              }`}
            onClick={closeModal}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="become-petani-title"
            className={`relative w-full max-w-md overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-lift ${closingModal ? "animate-scale-out" : "animate-scale-in"
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
                  <h2
                    id="become-petani-title"
                    className="text-lg font-bold tracking-tight text-gray-900"
                  >
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
            <form action={becomeFormAction} className="space-y-4 p-6">
              <input type="hidden" name="userId" value={user.id} />
              <div>
                <label
                  htmlFor="petani-address"
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
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
              {becomeState && !becomeState.success && (
                <p className="animate-fade-in text-sm text-danger">
                  {becomeState.message}
                </p>
              )}
              {becomeState && becomeState.success && (
                <p className="animate-fade-in text-sm text-success">
                  {becomeState.message}
                </p>
              )}
              <button
                type="submit"
                disabled={becomePending}
                className={`w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                {becomePending ? "Memproses..." : "Daftar sebagai Petani"}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                Akun Anda akan otomatis beralih menjadi Petani dan dapat
                mengelola komoditas.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

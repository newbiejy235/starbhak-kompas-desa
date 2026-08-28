"use client";

import { useEffect, useRef, useState, useActionState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

          <div className="flex min-w-0 items-center gap-3">
            <p className="text-sm font-semibold text-neutral-900 lg:hidden pl-12">
              KompasDesa
            </p>
            <p className="hidden lg:block text-sm font-semibold text-neutral-500 w-100">
              {headerLabel}
            </p>
            {headerLeft}
          </div>

          <div className="flex items-center gap-2.5">
            {headerRight}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
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
              </button>

            </div>
          </div>
        </div>
      </header>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 sm:p-6 lg:p-8">{children}</main>
      </div>

    </div>
  );
}

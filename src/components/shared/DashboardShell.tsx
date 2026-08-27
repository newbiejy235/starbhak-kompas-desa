"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";

interface DashboardShellProps {
  role: "admin" | "petani" | "pembeli";
  sidebar: ReactNode;
  headerLabel: string;
  /** Kontrol tambahan di sisi kiri header (mis. pencarian). */
  headerLeft?: ReactNode;
  /** Menggantikan blok avatar bawaan di sisi kanan header. */
  headerRight?: ReactNode;
  children: ReactNode;
}

export default function DashboardShell({
  role,
  sidebar,
  headerLabel,
  headerLeft,
  headerRight,
  children,
}: DashboardShellProps) {
  const { user, loading } = useAuth(role);
  // Header berubah blur+shadow saat discroll (glassmorphism ringan, PRD 8.3)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading || !user) {
    // Skeleton loading, bukan spinner polos (PRD 8.3 & 16)
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-8" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </aside>
        <div className="lg:pl-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 space-y-6">
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

      {/* Header sticky glassmorphism saat discroll (PRD 8.3) */}
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
            <p className="hidden lg:block text-sm font-semibold text-neutral-500">
              {headerLabel}
            </p>
            {headerLeft}
          </div>
          {headerRight ?? (
            <div className="flex items-center gap-2.5">
              <Avatar src={user.fotoProfile} name={user.fullName} size="sm" />
              <span className="hidden sm:block text-sm font-semibold text-neutral-900">
                {user.fullName}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

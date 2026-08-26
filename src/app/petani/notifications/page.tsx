"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Info,
  MessageCircle,
  Package,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationsRead,
} from "@/actions/notification";
import { getClientUser } from "@/lib/auth/client";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import type { NotificationRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";


const GREEN = "#025246";
const GREEN_SOFT = "#F0F7F5";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

interface TypeMeta {
  icon: LucideIcon;
  label: string;
  iconClass: string;
  href?: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  order: {
    icon: Package,
    label: "Pesanan",
    iconClass: "bg-blue-50 text-blue-600",
    href: "/petani/orders",
  },
  payment: {
    icon: CreditCard,
    label: "Pembayaran",
    iconClass: "bg-emerald-50 text-emerald-600",
    href: "/petani/orders",
  },
  review: {
    icon: Star,
    label: "Ulasan",
    iconClass: "bg-amber-50 text-amber-600",
    href: "/petani/reviews",
  },
  chat: {
    icon: MessageCircle,
    label: "Chat",
    iconClass: "bg-[#025246]/10 text-[#025246]",
    href: "/petani/chat",
  },
  system: {
    icon: Info,
    label: "Sistem",
    iconClass: "bg-purple-50 text-purple-600",
  },
};

const TYPE_FALLBACK: TypeMeta = {
  icon: Bell,
  label: "Info",
  iconClass: "bg-gray-100 text-gray-500",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "order", label: "Pesanan" },
  { value: "payment", label: "Pembayaran" },
  { value: "review", label: "Ulasan" },
  { value: "chat", label: "Chat" },
  { value: "system", label: "Sistem" },
];

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Prioritaskan kedekatan waktu: "Baru saja", "12 menit lalu",
 * jam untuk hari ini, "Kemarin", lalu tanggal singkat.
 * Waktu eksak tetap tersedia via formatDateTime (tooltip).
 */
function formatRelativeTime(value: Date | string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  if (d >= startToday) {
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (d >= startYesterday) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/* ============================================================
   Skeleton — meniru struktur halaman sesungguhnya
   ============================================================ */
function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3.5 w-60" />
          </div>
        </div>
        <Skeleton className="hidden h-9 w-44 rounded-lg sm:block" />
      </div>
      <Skeleton className="mt-3 h-4 w-48" />

      {/* Filter */}
      <div className="mt-6 flex gap-1.5">
        {[60, 76, 96, 62, 56, 66].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* List */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white">
        <Skeleton className="h-9 w-full rounded-none" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3.5 px-4 py-4 sm:gap-4 sm:px-5 ${i > 0 ? "border-t border-gray-100" : ""
              }`}
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-20 shrink-0" />
              </div>
              <Skeleton className="h-3.5 w-full max-w-md" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Item notifikasi — seluruh permukaan bisa diklik bila rute
   dapat disimpulkan dari tipenya.
   ============================================================ */
function NotificationItem({
  notification,
  index,
}: {
  notification: NotificationRow;
  index: number;
}) {
  const meta = TYPE_META[notification.type] ?? TYPE_FALLBACK;
  const Icon = meta.icon;
  const unread = !notification.isRead;

  const shared = `relative flex gap-3.5 px-4 py-4 transition-colors duration-150 animate-fade-up sm:gap-4 sm:px-5 ${unread ? "bg-[#F5FAF8] hover:bg-[#EDF5F2]" : "hover:bg-gray-50"
    } ${focusRing}`;

  const style = {
    animationDelay: `${Math.min(index * 40, 240)}ms`,
    animationFillMode: "backwards" as const,
  };

  const content = (
    <>
      <span
        aria-hidden
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
      >
        <Icon size={18} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3
            className={`min-w-0 truncate text-sm ${unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
              }`}
          >
            {unread && (
              <>
                <span className="sr-only">Belum dibaca: </span>
                <span
                  aria-hidden
                  className="mr-2 inline-block h-1.5 w-1.5 -translate-y-px rounded-full align-middle"
                  style={{ backgroundColor: GREEN }}
                />
              </>
            )}
            {notification.title}
          </h3>
          <time
            dateTime={new Date(notification.createdAt).toISOString()}
            title={formatDateTime(notification.createdAt)}
            className="shrink-0 text-xs text-gray-400"
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>

        <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
          {notification.message}
        </p>

        <span className="mt-2 inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
          {meta.label}
        </span>
      </div>
    </>
  );

  if (meta.href) {
    return (
      <Link href={meta.href} className={`${shared} block`} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={shared} style={style}>
      {content}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function PetaniNotifications() {
  const user = getClientUser();

  const { data: notifications, loading, reload } = useFetch(
    () =>
      user
        ? getUserNotifications(user.id)
        : Promise.resolve([] as NotificationRow[]),
    [user?.id],
  );

  const [typeFilter, setTypeFilter] = useState("all");
  const [marking, setMarking] = useState(false);

  const list = useMemo(() => notifications ?? [], [notifications]);
  const unread = list.filter((n) => !n.isRead).length;

  const filtered = useMemo(
    () =>
      typeFilter === "all"
        ? list
        : list.filter((n) => n.type === typeFilter),
    [list, typeFilter],
  );

  // Kelompokkan berdasarkan waktu agar mudah dipindai.
  const groups = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);

    const buckets: { key: string; items: NotificationRow[] }[] = [
      { key: "Hari ini", items: [] },
      { key: "Kemarin", items: [] },
      { key: "Sebelumnya", items: [] },
    ];

    for (const n of filtered) {
      const d = new Date(n.createdAt);
      if (d >= startToday) buckets[0].items.push(n);
      else if (d >= startYesterday) buckets[1].items.push(n);
      else buckets[2].items.push(n);
    }

    return buckets.filter((b) => b.items.length > 0);
  }, [filtered]);

  const markAll = async () => {
    if (!user || marking || unread === 0) return;
    setMarking(true);
    try {
      await markNotificationsRead(user.id);
      await reload();
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <NotificationsSkeleton />;

  const activeFilterLabel =
    FILTERS.find((f) => f.value === typeFilter)?.label ?? "Semua";

  // Offset animasi berjenjang antar grup agar urutannya konsisten.
  let cursor = 0;
  const groupsWithOffset = groups.map((g) => {
    const start = cursor;
    cursor += g.items.length;
    return { ...g, start };
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="mx-auto max-w-4xl animate-fade-up px-4 py-6 sm:px-6 sm:py-8 lg:px-0">
        {/* ---------- Header ---------- */}
        <header className="mb-6 sm:mb-7">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: GREEN_SOFT, color: GREEN }}
              >
                <Bell size={20} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Notifikasi
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Pantau pesanan, pembayaran, ulasan, dan aktivitas terbaru.
                </p>
              </div>
            </div>

            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={marking}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
              >
                <CheckCheck
                  size={16}
                  aria-hidden
                  className={marking ? "animate-pulse-soft" : ""}
                />
                {marking ? "Menandai..." : "Tandai semua dibaca"}
              </button>
            )}
          </div>

          <p aria-live="polite" className="mt-2.5 text-sm text-gray-500">
            {unread > 0 ? (
              <>
                <span className="font-semibold" style={{ color: GREEN }}>
                  {unread} notifikasi
                </span>{" "}
                belum dibaca
              </>
            ) : (
              "Semua notifikasi sudah dibaca"
            )}
          </p>
        </header>

        {/* ---------- Filter jenis ---------- */}
        {list.length > 0 && (
          <div
            role="group"
            aria-label="Filter jenis notifikasi"
            className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            <div className="flex gap-1.5">
              {FILTERS.map((f) => {
                const isActive = typeFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setTypeFilter(f.value)}
                    aria-pressed={isActive}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${focusRing} ${isActive
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                      }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- Daftar notifikasi ---------- */}
        {list.length === 0 ? (
          <EmptyState
            title="Belum Ada Notifikasi"
            message="Aktivitas pesanan, pembayaran, ulasan, dan chat akan muncul di sini."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak Ada Notifikasi"
            message={`Tidak ada notifikasi untuk kategori "${activeFilterLabel}".`}
          >
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#025246] transition-colors duration-200 hover:bg-[#F0F7F5] ${focusRing}`}
            >
              Tampilkan Semua
            </button>
          </EmptyState>
        ) : (
          <section
            aria-label="Daftar notifikasi"
            className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white"
          >
            <div className="divide-y divide-gray-100">
              {groupsWithOffset.map((group) => (
                <div key={group.key}>
                  <h2 className="border-b border-gray-100 bg-[#FAFBFA] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:px-5">
                    {group.key}
                  </h2>
                  <div className="divide-y divide-gray-100">
                    {group.items.map((n, i) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        index={group.start + i}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  getUserNotifications,
  markNotificationsRead,
} from "@/actions/notification";
import { formatDateTime } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import { Bell, CheckCheck, Package, CreditCard, Star, Info, MessageCircle, type LucideIcon } from "lucide-react";
import { useAuth, useFetch } from "@/lib/hooks";
import Link from "next/link";
import type { NotificationRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const typeIcon: Record<string, LucideIcon> = {
  order: Package,
  payment: CreditCard,
  review: Star,
  system: Info,
  chat: MessageCircle,
};

const typeColor: Record<string, string> = {
  order: "bg-blue-50 text-blue-600",
  payment: "bg-success/10 text-success",
  review: "bg-amber-50 text-amber-600",
  system: "bg-purple-50 text-purple-600",
  chat: "bg-[#025246]/10 text-[#025246]",
};

function NotificationsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <Skeleton className="h-8 w-44" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-card" />
      ))}
    </div>
  );
}

export default function UserNotifications() {
  const { user } = useAuth();

  const { data: notifications, loading, reload } = useFetch(
    () =>
      user
        ? getUserNotifications(user.id)
        : Promise.resolve([] as NotificationRow[]),
    [user?.id],
  );

  const markAll = async () => {
    if (!user) return;
    await markNotificationsRead(user.id);
    reload();
  };

  if (loading) return <NotificationsSkeleton />;

  const list = notifications ?? [];
  const unread = list.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifikasi</h1>
          <p className="text-sm text-gray-500">
            {unread > 0 ? `${unread} notifikasi belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark active:scale-95 transition-all"
          >
            <CheckCheck size={18} /> Tandai semua dibaca
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Tidak Ada Notifikasi" message="Notifikasi Anda akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {list.map((n, i) => {
            const Icon = typeIcon[n.type] ?? Bell;
            const card = (
              <div
                key={n.id}
                className={`bg-white rounded-card border p-5 flex gap-4 shadow-soft hover:shadow-lift transition-all duration-300 ease-smooth animate-fade-up ${
                  n.isRead ? "border-gray-200/80 opacity-70" : "border-primary/30"
                }`}
                style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, animationFillMode: "backwards" }}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    typeColor[n.type] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 animate-pulse-soft" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.type === "chat" ? (
              <Link key={n.id} href="/user/chat" className="block hover:opacity-90 transition-opacity">
                {card}
              </Link>
            ) : (
              <div key={n.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/format";

/** Notifikasi dan aktivitas terkini milik petani. */
export default function ActivityCard({
  activities,
}: {
  activities: { title: string; timestamp: string }[];
}) {
  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-neutral-900">Aktivitas Terbaru</h2>
        <Link
          href="/petani/notifications"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Lihat Semua
        </Link>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Notifikasi dan aktivitas terkini.
      </p>

      <div className="space-y-0">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Belum ada aktivitas.
          </p>
        ) : (
          activities.map((act, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 60}ms` }}
              className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 opacity-0 animate-fade-up"
            >
              <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bell size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 line-clamp-2">
                  {act.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatDate(act.timestamp, true)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

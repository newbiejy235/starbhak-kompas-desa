"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

type HarvestItem = { name: string; date: string | null };

/** Jadwal panen terdekat berdasarkan estimasi panen pada komoditas. */
export default function HarvestScheduleCard({
  schedule,
}: {
  schedule: HarvestItem[];
}) {
  // Waktu saat ini diambil lewat rAF (bukan langsung saat render) agar render murni.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-neutral-900">Jadwal Panen</h2>
        </div>
        <Link
          href="/petani/kalender-panen"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Kelola Jadwal
        </Link>
      </div>

      {schedule.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Belum ada jadwal panen. Atur estimasi panen lewat halaman Kalender
          Panen.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                >
                  Komoditas
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                >
                  Estimasi Panen
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, i) => {
                const date = item.date ? new Date(item.date) : null;
                const time = now ?? 0;
                const isPast = date && now !== null ? date.getTime() < now : false;
                const isSoon =
                  date && now !== null
                    ? !isPast && date.getTime() - time < WEEK_MS
                    : false;

                return (
                  <tr
                    key={i}
                    className="border-b border-gray-50 last:border-0 transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.date ? formatDate(item.date) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={isPast ? "neutral" : isSoon ? "warning" : "success"}
                      >
                        {isPast ? "Lewat" : isSoon ? "Mendatang" : "Terjadwal"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

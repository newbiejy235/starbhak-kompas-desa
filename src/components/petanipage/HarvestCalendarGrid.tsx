"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { toISODate } from "@/utils/date";
import { DAY_LABELS, MONTH_NAMES } from "@/constants/calendar";
import type { HarvestScheduleRow } from "@/lib/types/market";

interface HarvestCalendarGridProps {
  viewYear: number;
  viewMonth: number;
  /** Jadwal panen per tanggal (kunci "YYYY-MM-DD"). */
  byDay: Map<string, HarvestScheduleRow[]>;
  selectedDate: string | null;
  onSelectDate: (iso: string | null) => void;
  /** delta = -1 bulan sebelumnya, 1 bulan berikutnya. */
  onChangeMonth: (delta: number) => void;
  onGoToToday: () => void;
  todayIso: string;
}

/** Kalender bulanan dengan penanda jadwal panen per tanggal. */
export default function HarvestCalendarGrid({
  viewYear,
  viewMonth,
  byDay,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  onGoToToday,
  todayIso,
}: HarvestCalendarGridProps) {
  // Grid 6×7 hari yang mencakup seluruh bulan tampilan.
  const first = new Date(viewYear, viewMonth, 1);
  const offset = (first.getDay() + 6) % 7; // Senin sebagai awal pekan
  const start = new Date(viewYear, viewMonth, 1 - offset);
  const grid = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <section className="mb-6 overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft">
      {/* Navigasi bulan */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-bold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onGoToToday}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
          >
            Hari ini
          </button>
          <button
            onClick={() => onChangeMonth(1)}
            aria-label="Bulan berikutnya"
            className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Label hari */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/60">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Sel tanggal */}
      <div className="grid grid-cols-7">
        {grid.map((day) => {
          const iso = toISODate(day);
          const inMonth = day.getMonth() === viewMonth;
          const isToday = iso === todayIso;
          const dayItems = byDay.get(iso);
          const isSelected = selectedDate === iso;
          return (
            <button
              key={iso}
              onClick={() => {
                if (!inMonth) return;
                // Pilih tanggal yang punya jadwal; klik ulang / tanggal kosong membersihkan pilihan.
                onSelectDate(dayItems && !isSelected ? iso : null);
              }}
              disabled={!inMonth}
              aria-label={`${day.getDate()} ${MONTH_NAMES[day.getMonth()]}, ${dayItems?.length ?? 0} jadwal panen`}
              aria-pressed={isSelected}
              className={`relative flex min-h-[52px] flex-col items-center justify-start gap-1 border-b border-r border-gray-100 px-1 pt-1.5 transition-colors duration-150 last:border-r-0 sm:min-h-[64px] ${inMonth
                ? isSelected
                  ? "bg-primary/10"
                  : "hover:bg-primary/5"
                : "bg-gray-50/40"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday
                  ? "bg-primary text-white"
                  : inMonth
                    ? "text-gray-700"
                    : "text-gray-300"
                  }`}
              >
                {day.getDate()}
              </span>
              {dayItems && (
                <span className="flex items-center gap-0.5">
                  {dayItems.slice(0, 3).map((it) => (
                    <span
                      key={it.id}
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
} from "lucide-react";
import { getHarvestCalendar, updateHarvestEstimate } from "@/actions/harvest";
import type { HarvestScheduleRow } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, formatImage } from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/format";

import { DAY_LABELS } from "@/app/constants/time_date";
import { MONTH_NAMES } from "@/app/constants/time_date";


function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/* ---------------------- SKELETON ---------------------- */
function CalendarSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-[380px] rounded-card" />
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
      </div>
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function KalenderPanenPage() {
  const user = getClientUser();

  const {
    data: schedules,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user
      ? getHarvestCalendar(user.id)
      : Promise.resolve([] as HarvestScheduleRow[]),
    [user?.id],
  );

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Edit jadwal panen
  const [editTarget, setEditTarget] = useState<HarvestScheduleRow | null>(null);
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<string, HarvestScheduleRow[]>();
    for (const s of schedules ?? []) {
      if (!s.harvestEstimate) continue;
      const key = toISODate(new Date(s.harvestEstimate));
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [schedules]);

  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return [...(schedules ?? [])]
      .filter((s) => s.harvestEstimate && new Date(s.harvestEstimate) >= now)
      .sort(
        (a, b) =>
          new Date(a.harvestEstimate!).getTime() -
          new Date(b.harvestEstimate!).getTime(),
      );
  }, [schedules]);

  const shownList = selectedDate
    ? (byDay.get(selectedDate) ?? [])
    : upcoming;

  const changeMonth = (delta: number) => {
    setSelectedDate(null);
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const openEdit = (item: HarvestScheduleRow) => {
    setEditTarget(item);
    setEditDate(
      item.harvestEstimate ? toISODate(new Date(item.harvestEstimate)) : "",
    );
  };

  const submitEdit = async () => {
    if (!user || !editTarget) return;
    setSaving(true);
    const res = await updateHarvestEstimate(
      user.id,
      editTarget.id,
      editDate || null,
    );
    setSaving(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Jadwal panen diperbarui");
    setEditTarget(null);
    reload();
  };

  if (loading) return <CalendarSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
        <PageHeader
          icon={CalendarDays}
          title="Kalender Panen"
          subtitle="Atur dan pantau jadwal panen komoditas Anda."
        />
        <ErrorState onRetry={() => reload()} />
      </div>
    );
  }

  const selectedLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : null;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={CalendarDays}
        title="Kalender Panen"
        subtitle="Atur dan pantau jadwal panen komoditas Anda."
        action={
          <Link
            href="/petani/commodities/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 ease-smooth hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97]"
          >
            <Plus size={16} />
            Tambah Komoditas
          </Link>
        }
      />

      {/* Kalender bulanan */}
      <section className="mb-6 overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-bold text-gray-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeMonth(-1)}
              aria-label="Bulan sebelumnya"
              className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                setSelectedDate(null);
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
            >
              Hari ini
            </button>
            <button
              onClick={() => changeMonth(1)}
              aria-label="Bulan berikutnya"
              className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const iso = toISODate(day);
            const inMonth = day.getMonth() === viewMonth;
            const isToday = iso === toISODate(today);
            const dayItems = byDay.get(iso);
            const isSelected = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() =>
                  dayItems
                    ? setSelectedDate(isSelected ? null : iso)
                    : setSelectedDate(null)
                }
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
                  <span
                    className={`flex items-center gap-0.5 ${isSelected ? "" : ""}`}
                  >
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

      {/* Daftar jadwal */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {selectedLabel ? `Panen pada ${selectedLabel}` : "Jadwal Terdekat"}
          </h2>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Tampilkan semua
            </button>
          )}
        </div>

        {shownList.length === 0 ? (
          <EmptyState
            title="Belum Ada Jadwal Panen"
            message={
              schedules && schedules.length > 0
                ? "Tidak ada panen pada tanggal ini. Pilih tanggal lain atau tampilkan semua."
                : "Tambahkan perkiraan panen melalui detail komoditas untuk mulai mengatur hasil produksi Anda."
            }
          >
            {(!schedules || schedules.length === 0) && (
              <Link
                href="/petani/commodities/add"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 ease-smooth hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97]"
              >
                <CalendarPlus size={16} />
                Tambah Komoditas
              </Link>
            )}
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {shownList.map((item, i) => {
              const img = formatImage(item.image);
              const dateLabel = item.harvestEstimate
                ? new Date(item.harvestEstimate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                })
                : "-";
              return (
                <article
                  key={item.id}
                  className="group flex gap-3.5 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 hover:shadow-lift"
                  style={{
                    animationDelay: `${Math.min(i * 50, 250)}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.name}
                        fill
                        sizes="52px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Panen diperkirakan{" "}
                      <span className="font-medium text-gray-700">
                        {dateLabel}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Perkiraan jumlah{" "}
                      <span className="font-semibold text-primary">
                        ± {formatNumber(item.stock)} {item.unit}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => openEdit(item)}
                    aria-label={`Ubah jadwal panen ${item.name}`}
                    className="self-start rounded-lg p-1.5 text-gray-400 transition-all duration-150 hover:bg-primary/10 hover:text-primary active:scale-90"
                  >
                    <Pencil size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal ubah jadwal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Ubah Jadwal Panen"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="harvest-date"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Perkiraan Tanggal Panen
            </label>
            <input
              id="harvest-date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Kosongkan untuk menghapus jadwal panen.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
              Batal
            </Button>
            <Button size="sm" loading={saving} onClick={submitEdit}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

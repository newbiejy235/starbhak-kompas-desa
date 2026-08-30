"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowDownUp,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  Pencil,
  Plus,
  Search,
  Sprout,
  Wheat,
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
import { formatDate, formatNumber } from "@/lib/format";
import { DAY_LABELS, MONTH_NAMES } from "@/constants/calendar";

type FilterKey =
  | "semua"
  | "hari-ini"
  | "minggu-ini"
  | "akan-datang"
  | "sudah-lewat";
type SortKey = "terdekat" | "terjauh" | "nama" | "jumlah";
type ViewMode = "kalender" | "daftar";
type RelativeTone = "today" | "soon" | "future" | "past";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "hari-ini", label: "Hari Ini" },
  { key: "minggu-ini", label: "Minggu Ini" },
  { key: "akan-datang", label: "Akan Datang" },
  { key: "sudah-lewat", label: "Sudah Lewat" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "terdekat", label: "Terdekat" },
  { key: "terjauh", label: "Terjauh" },
  { key: "nama", label: "Nama A-Z" },
  { key: "jumlah", label: "Jumlah Terbesar" },
];

const VIEW_OPTIONS: { key: ViewMode; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { key: "kalender", label: "Kalender", icon: CalendarDays },
  { key: "daftar", label: "Daftar", icon: List },
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MS_PER_DAY = 86_400_000;

const RELATIVE_CHIP_TONE: Record<RelativeTone, string> = {
  today: "bg-amber-100 text-amber-700",
  soon: "bg-primary/10 text-primary",
  future: "bg-gray-100 text-gray-500",
  past: "bg-red-50 text-red-500",
};

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function diffInDays(target: Date, from: Date): number {
  return Math.round(
    (startOfDay(target).getTime() - startOfDay(from).getTime()) / MS_PER_DAY,
  );
}

function getRelativeLabel(days: number): { label: string; tone: RelativeTone } {
  if (days === 0) return { label: "Hari ini", tone: "today" };
  if (days === 1) return { label: "Besok", tone: "soon" };
  if (days > 1) {
    return days <= 7
      ? { label: `${days} hari lagi`, tone: "soon" }
      : { label: `${days} hari lagi`, tone: "future" };
  }
  const abs = Math.abs(days);
  return abs === 1
    ? { label: "Kemarin", tone: "past" }
    : { label: `${abs} hari lalu`, tone: "past" };
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: rows * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatFullDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ---------------------- SUBKOMPONEN ---------------------- */

function RelativeChip({ days }: { days: number }) {
  const { label, tone } = getRelativeLabel(days);
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${RELATIVE_CHIP_TONE[tone]}`}
    >
      {label}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  value,
  label,
  className = "",
  delay = 0,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  value: string;
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`border-b border-gray-200 px-1 py-3 animate-fade-up sm:px-2 ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <span className="shrink-0 text-primary">
          <Icon size={15} strokeWidth={2.25} />
        </span>
      </div>
      <p className="mt-1 truncate text-lg font-black leading-tight text-gray-900 sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function HarvestCard({
  item,
  days,
  index = 0,
  featured = false,
  onEdit,
}: {
  item: HarvestScheduleRow;
  days: number;
  index?: number;
  featured?: boolean;
  onEdit: (item: HarvestScheduleRow) => void;
}) {
  const img = formatImage(item.image) ?? formatImage(item.images?.[0] ?? null);
  const harvestDate = new Date(item.harvestEstimate!);
  return (
    <article
      className={`group relative flex gap-3.5 overflow-hidden rounded-card border p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up ${featured
        ? "border-primary/25 bg-primary/[0.04]"
        : "border-gray-200/80 bg-white"
        }`}
      style={{
        animationDelay: `${Math.min(index * 50, 250)}ms`,
        animationFillMode: "backwards",
      }}
    >
      {featured && (
        <span
          aria-hidden
          className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary"
        />
      )}

      <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={item.name}
            fill
            sizes="52px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            {featured && (
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-primary">
                Panen Terdekat
              </span>
            )}
            {item.name}
          </p>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <RelativeChip days={days} />
          <span className="text-xs text-gray-400">
            {formatShortDate(harvestDate)}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Perkiraan jumlah{" "}
          <span className="font-semibold text-primary">
            ± {formatNumber(item.stock)} {item.unit}
          </span>
        </p>
      </div>

      <button
        onClick={() => onEdit(item)}
        aria-label={`Ubah jadwal panen ${item.name}`}
        className="self-start rounded-lg p-1.5 text-gray-400 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary active:scale-90"
      >
        <Pencil size={15} />
      </button>
    </article>
  );
}

function CalendarSkeleton() {
  return (
    <div className="w-full space-y-5 p-4 sm:p-6 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[64px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-[420px] rounded-xl" />
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

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("semua");
  const [sort, setSort] = useState<SortKey>("terdekat");
  const [viewMode, setViewMode] = useState<ViewMode>("kalender");

  // Edit jadwal panen
  const [editTarget, setEditTarget] = useState<HarvestScheduleRow | null>(null);
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<string, HarvestScheduleRow[]>();
    for (const s of schedules ?? []) {
      if (!s.harvestEstimate) continue;
      const key = toISODate(new Date(s.harvestEstimate));
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [schedules]);

  const summary = useMemo(() => {
    const t = startOfDay(today);
    const weekStart = startOfWeek(t);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let hariIni = 0;
    let mingguIni = 0;
    let bulanIni = 0;
    const totalsByUnit = new Map<string, number>();

    for (const s of schedules ?? []) {
      if (!s.harvestEstimate) continue;
      const d = new Date(s.harvestEstimate);
      if (diffInDays(d, t) === 0) hariIni++;
      if (d >= weekStart && d < weekEnd) mingguIni++;
      if (
        d.getMonth() === t.getMonth() &&
        d.getFullYear() === t.getFullYear()
      ) {
        bulanIni++;
      }
      const qty = Number(s.stock);
      if (!Number.isNaN(qty)) {
        totalsByUnit.set(s.unit, (totalsByUnit.get(s.unit) ?? 0) + qty);
      }
    }

    const hasil =
      Array.from(totalsByUnit.entries())
        .map(([unit, total]) => `± ${formatNumber(total)} ${capitalize(unit)}`)
        .join(" · ") || "± 0";

    return {
      total: schedules?.length ?? 0,
      hariIni,
      mingguIni,
      bulanIni,
      hasil,
    };
  }, [schedules, today]);

  const baseList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = startOfDay(today);
    const weekStart = startOfWeek(t);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const list = (schedules ?? []).filter((s) => {
      if (!s.harvestEstimate) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      const d = startOfDay(new Date(s.harvestEstimate));
      switch (filter) {
        case "hari-ini":
          return d.getTime() === t.getTime();
        case "minggu-ini":
          return d >= weekStart && d < weekEnd;
        case "akan-datang":
          return d >= t;
        case "sudah-lewat":
          return d < t;
        default:
          return true;
      }
    });

    const byDateAsc = (a: HarvestScheduleRow, b: HarvestScheduleRow) =>
      new Date(a.harvestEstimate!).getTime() -
      new Date(b.harvestEstimate!).getTime();

    switch (sort) {
      case "terjauh":
        list.sort((a, b) => byDateAsc(b, a));
        break;
      case "nama":
        list.sort((a, b) => a.name.localeCompare(b.name, "id"));
        break;
      case "jumlah":
        list.sort(
          (a, b) =>
            (Number(b.stock) || 0) - (Number(a.stock) || 0),
        );
        break;
      default:
        list.sort(byDateAsc);
    }
    return list;
  }, [schedules, query, filter, sort, today]);

  const shownList = useMemo(() => {
    if (selectedDate) return byDay.get(selectedDate) ?? [];
    if (viewMode === "daftar") return baseList;
    return baseList.filter(
      (s) => diffInDays(new Date(s.harvestEstimate!), today) >= 0,
    );
  }, [selectedDate, byDay, viewMode, baseList, today]);

  const dateGroups = useMemo(() => {
    if (viewMode !== "daftar") return null;
    if (sort !== "terdekat" && sort !== "terjauh") return null;
    const grouped = new Map<string, HarvestScheduleRow[]>();
    for (const s of shownList) {
      const key = toISODate(new Date(s.harvestEstimate!));
      const arr = grouped.get(key);
      if (arr) arr.push(s);
      else grouped.set(key, [s]);
    }
    return Array.from(grouped.entries());
  }, [shownList, viewMode, sort]);

  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthScheduleCount = useMemo(() => {
    let n = 0;
    for (const s of schedules ?? []) {
      if (!s.harvestEstimate) continue;
      const d = new Date(s.harvestEstimate);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) n++;
    }
    return n;
  }, [schedules, viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    setSelectedDate(null);
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(null);
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

  const resetFilters = () => {
    setQuery("");
    setFilter("semua");
  };

  if (loading) return <CalendarSkeleton />;

  if (error) {
    return (
      <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
        <PageHeader
          icon={CalendarDays}
          title="Kalender Panen"
          subtitle="Atur dan pantau jadwal panen komoditas Anda."
        />
        <ErrorState onRetry={() => reload()} />
      </div>
    );
  }

  const hasAnySchedules = (schedules?.length ?? 0) > 0;
  const filtersActive = query.trim() !== "" || filter !== "semua";

  const listTitle = selectedDate
    ? `Panen pada ${formatFullDate(new Date(selectedDate))}`
    : viewMode === "daftar"
      ? "Daftar Jadwal Panen"
      : "Jadwal Terdekat";

  const listSubtitle = selectedDate
    ? `${shownList.length} komoditas siap panen`
    : `${shownList.length} jadwal`;

  const renderCards = (items: HarvestScheduleRow[], featuredFirst = false) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <HarvestCard
          key={item.id}
          item={item}
          index={i}
          featured={featuredFirst && i === 0}
          days={diffInDays(new Date(item.harvestEstimate!), today)}
          onEdit={openEdit}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
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

      {/* Ringkasan */}
      <section
        aria-label="Ringkasan panen"
        className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <SummaryCard
          icon={Sprout}
          value={`${summary.total}`}
          label="Total Komoditas"
        />
        <SummaryCard
          icon={CalendarCheck2}
          value={`${summary.hariIni}`}
          label="Panen Hari Ini"
          delay={50}
        />
        <SummaryCard
          icon={CalendarRange}
          value={`${summary.mingguIni}`}
          label="Panen Minggu Ini"
          delay={100}
        />
        <SummaryCard
          icon={CalendarDays}
          value={`${summary.bulanIni}`}
          label="Panen Bulan Ini"
          delay={150}
        />
        <SummaryCard
          icon={Wheat}
          value={summary.hasil}
          label="Perkiraan Hasil"
          className="col-span-2 sm:col-span-1"
          delay={200}
        />
      </section>

      {/* Toolbar pencarian, filter, urutan & mode tampilan */}
      <section className="mb-5 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 xl:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari komoditas..."
              aria-label="Cari komoditas"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-col gap-2.5 xl:flex-1 xl:flex-row xl:items-center xl:justify-end">
            <div
              role="group"
              aria-label="Filter jadwal"
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5"
            >
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary ${filter === f.key
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center">
                <span className="sr-only">Urutkan jadwal</span>
                <ArrowDownUp
                  size={14}
                  className="pointer-events-none absolute left-3 text-gray-400"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-1.5 pl-8 pr-8 text-xs font-semibold text-gray-600 transition-colors duration-150 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 text-gray-400"
                />
              </label>

              <div
                role="group"
                aria-label="Mode tampilan"
                className="flex rounded-xl border border-gray-200 bg-gray-50 p-1"
              >
                {VIEW_OPTIONS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setViewMode(v.key)}
                    aria-pressed={viewMode === v.key}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary ${viewMode === v.key
                      ? "bg-white text-primary shadow-soft"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <v.icon size={14} />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kalender bulanan */}
      {viewMode === "kalender" && (
        <section className="mb-6 overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
              <p className="text-[11px] text-gray-400">
                {monthScheduleCount} jadwal bulan ini
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Bulan sebelumnya"
                className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToToday}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                Hari ini
              </button>
              <button
                onClick={() => changeMonth(1)}
                aria-label="Bulan berikutnya"
                className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
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

          <div className="grid grid-cols-7 gap-px">
            {grid.map((day) => {
              const iso = toISODate(day);
              const inMonth = day.getMonth() === viewMonth;
              const isToday = iso === toISODate(today);
              const dayItems = byDay.get(iso);
              const count = dayItems?.length ?? 0;
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
                  aria-label={`${day.getDate()} ${MONTH_NAMES[day.getMonth()]} ${day.getFullYear()}, ${count} jadwal panen`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  title={
                    count > 0 ? `${count} jadwal pada tanggal ini` : undefined
                  }
                  className={`group relative flex min-h-[56px] cursor-pointer flex-col items-center gap-1 px-0.5 pb-1 pt-1.5 transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:min-h-[68px] sm:gap-1.5 sm:pt-2 ${inMonth
                    ? isSelected
                      ? "bg-primary/10"
                      : "bg-white hover:bg-primary/[0.06]"
                    : "cursor-default bg-gray-50/70"
                    }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-7 sm:w-7 sm:text-[13px] ${isToday
                      ? "bg-primary text-white shadow-soft"
                      : isSelected
                        ? "text-primary ring-2 ring-primary ring-offset-1"
                        : inMonth
                          ? "text-gray-700 group-hover:text-primary"
                          : "text-gray-300"
                      }`}
                  >
                    {day.getDate()}
                  </span>
                  <span className="flex h-1.5 items-center gap-[3px]">
                    {count > 0 && (
                      <>
                        {dayItems!.slice(0, 3).map((it) => (
                          <span
                            key={it.id}
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        ))}
                        {count > 3 && (
                          <span className="text-[9px] font-bold leading-none text-primary">
                            +{count - 3}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Daftar jadwal */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">{listTitle}</h2>
              {selectedDate && (
                <RelativeChip days={diffInDays(new Date(selectedDate), today)} />
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-400" aria-live="polite">
              {listSubtitle}
            </p>
          </div>
          {selectedDate && viewMode === "kalender" && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Tampilkan semua
            </button>
          )}
        </div>

        {!hasAnySchedules ? (
          <EmptyState
            title="Belum Ada Jadwal Panen"
            message="Tambahkan perkiraan panen melalui detail komoditas untuk mulai mengatur hasil produksi Anda."
          >
            <Link
              href="/petani/commodities/add"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 ease-smooth hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97]"
            >
              <CalendarPlus size={16} />
              Tambah Komoditas
            </Link>
          </EmptyState>
        ) : shownList.length === 0 ? (
          <EmptyState
            title={
              selectedDate
                ? "Belum Ada Panen di Tanggal Ini"
                : filtersActive
                  ? "Tidak Ada Hasil"
                  : "Belum Ada Jadwal Terdekat"
            }
            message={
              selectedDate
                ? "Tidak ada panen pada tanggal ini. Pilih tanggal lain atau tampilkan semua."
                : filtersActive
                  ? "Tidak ada jadwal yang cocok dengan pencarian atau filter. Coba ubah kata kunci atau filter."
                  : "Semua jadwal panen sudah lewat. Cek menu Daftar untuk melihat seluruh riwayat jadwal."
            }
          >
            {filtersActive && (
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={resetFilters}
              >
                Hapus Pencarian & Filter
              </Button>
            )}
          </EmptyState>
        ) : dateGroups ? (
          <div className="space-y-6">
            {dateGroups.map(([iso, items]) => {
              const d = new Date(iso);
              const days = diffInDays(d, today);
              return (
                <div key={iso}>
                  <div className="mb-2.5 flex items-center gap-2 px-1">
                    <h3 className="shrink-0 text-sm font-bold text-gray-900">
                      {formatFullDate(d)}
                    </h3>
                    <RelativeChip days={days} />
                    <span aria-hidden className="h-px flex-1 bg-gray-100" />
                    <span className="shrink-0 text-xs text-gray-400">
                      {items.length} jadwal
                    </span>
                  </div>
                  {renderCards(items)}
                </div>
              );
            })}
          </div>
        ) : (
          renderCards(shownList, viewMode === "kalender" && !selectedDate)
        )}
      </section>

      {/* Modal ubah jadwal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Ubah Jadwal Panen"
      >
        {editTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {formatImage(editTarget.image) ? (
                  <Image
                    src={formatImage(editTarget.image)!}
                    alt={editTarget.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-base font-black text-white">
                    {editTarget.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {editTarget.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Jadwal saat ini:{" "}
                  <span className="font-medium text-gray-700">
                    {editTarget.harvestEstimate
                      ? formatDate(editTarget.harvestEstimate)
                      : "-"}
                  </span>
                </p>
              </div>
              <StatusBadge status={editTarget.status} />
            </div>

            <div>
              <label
                htmlFor="harvest-date"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Perkiraan Tanggal Panen Baru
              </label>
              <input
                id="harvest-date"
                type="date"
                value={editDate}
                autoFocus
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Kosongkan untuk menghapus jadwal panen.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditTarget(null)}
              >
                Batal
              </Button>
              <Button size="sm" loading={saving} onClick={submitEdit}>
                Simpan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

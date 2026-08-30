"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  NotebookPen,
  Plus,
  Trash2,
  Search,
  Pencil,
  Sprout,
  StickyNote,
  MapPin,
  CloudSun,
  Tag,
  Filter,
} from "lucide-react";
import {
  addFarmerNote,
  updateFarmerNote,
  deleteFarmerNote,
  getFarmerNotes,
} from "@/actions/notes";
import type { FarmerNoteRow } from "@/lib/types/market";
import { getFarmerCommodities } from "@/actions/commodity";
import type { FarmerCommodity } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { toISODate } from "@/utils/date";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 20;
// Ambang untuk menampilkan tombol "Lihat selengkapnya".
const NOTE_CLAMP_CHARS = 180;

const CATEGORIES: { value: string; label: string }[] = [
  { value: "kegiatan", label: "Kegiatan" },
  { value: "pengamatan", label: "Pengamatan" },
  { value: "perawatan", label: "Perawatan" },
  { value: "masalah", label: "Masalah" },
  { value: "perkembangan", label: "Perkembangan" },
  { value: "rencana", label: "Rencana" },
  { value: "keuangan", label: "Keuangan" },
  { value: "pemasaran", label: "Pemasaran" },
  { value: "cuaca", label: "Cuaca" },
  { value: "lainnya", label: "Lainnya" },
];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/* ---------------------- UTIL ---------------------- */

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const idx = Number(month) - 1;
  return `${MONTH_NAMES[idx] ?? month} ${year}`;
}

function prettyDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function shortDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = startOfToday();
  const day = d.getDay(); // 0=Minggu
  const diff = day === 0 ? -6 : 1 - day; // Senin sebagai awal minggu
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(): Date {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none";

/* ---------------------- SKELETON ---------------------- */
function JournalSkeleton() {
  return (
    <div className="w-full space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-1.5 border-b border-gray-200 pb-5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3.5 w-56" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="max-w-4xl space-y-7">
        <Skeleton className="h-3.5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 border-b border-gray-100 py-6 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-6"
          >
            <Skeleton className="h-3 w-16" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- EXPANDABLE CONTENT ---------------------- */
function ExpandableContent({ text }: { text: string }) {
  const long = text.length > NOTE_CLAMP_CHARS;
  const [expanded, setExpanded] = useState(false);

  if (!long) {
    return (
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-800">
        {text}
      </p>
    );
  }

  return (
    <div>
      <p
        className={`whitespace-pre-line text-[15px] leading-relaxed text-gray-800 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
      >
        {expanded ? "Sembunyikan" : "Lihat selengkapnya"}
      </button>
    </div>
  );
}

/* ---------------------- NOTE ENTRY ---------------------- */
function JournalEntry({
  note,
  deleting,
  onEdit,
  onDelete,
}: {
  note: FarmerNoteRow;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tags = parseTags(note.tags);

  return (
    <article className="group relative grid grid-cols-1 gap-2 border-b border-gray-100 py-5 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-6 sm:py-6">
      {/* Tanggal */}
      <div className="sm:pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {shortDate(note.noteDate)}
        </p>
      </div>

      <div className="min-w-0">
        {/* Judul + aksi */}
        <div className="flex items-start gap-1.5">
          <div className="min-w-0">
            {note.title ? (
              <p className="text-[15px] font-bold leading-snug text-gray-900">
                {note.title}
              </p>
            ) : (
              <p className="text-[15px] font-bold leading-snug text-gray-900">
                {categoryLabel(note.category)}
              </p>
            )}
            <p className="mt-0.5 text-xs text-gray-400">
              {categoryLabel(note.category)}
              {note.commodityName ? ` · ${note.commodityName}` : ""}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <button
              onClick={onEdit}
              aria-label={`Edit catatan ${note.title ?? "tanpa judul"}`}
              className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-primary/10 hover:text-primary active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              aria-label={`Hapus catatan ${note.title ?? "tanpa judul"}`}
              className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Isi catatan (fokus utama) */}
        <div className="mt-2">
          <ExpandableContent text={note.content} />
        </div>

        {/* Metadata pendukung */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {note.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              {note.location}
            </span>
          )}
          {note.weather && (
            <span className="inline-flex items-center gap-1">
              <CloudSun size={13} className="text-gray-400" />
              {note.weather}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag size={12} className="text-gray-400" />
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------------------- NOTE COMPOSER (modal) ---------------------- */
function NoteComposer({
  open,
  onClose,
  commodities,
  editing,
  saving,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  commodities: FarmerCommodity[];
  editing: FarmerNoteRow | null;
  saving: boolean;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    noteDate: string;
    commodityId: string;
    location: string;
    weather: string;
    tags: string;
  }) => void;
}) {
  const [title, setTitle] = useState<string>(editing?.title ?? "");
  const [content, setContent] = useState(editing?.content ?? "");
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[0].value);
  const [noteDate, setNoteDate] = useState(
    editing ? toISODate(new Date(editing.noteDate)) : toISODate(new Date()),
  );
  const [commodityId, setCommodityId] = useState(
    editing?.commodityId ? String(editing.commodityId) : "",
  );
  const [location, setLocation] = useState(editing?.location ?? "");
  const [weather, setWeather] = useState(editing?.weather ?? "");
  const [tags, setTags] = useState(editing?.tags ?? "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Catatan" : "Tulis Catatan"}
    >
      <p className="-mt-2 mb-5 text-sm text-gray-500">
        {editing
          ? "Perbarui isi catatan kegiatan atau hasil usaha tani Anda."
          : "Dokumentasikan kegiatan, pengamatan, perkembangan, atau hal penting lainnya."}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            title,
            content,
            category,
            noteDate,
            commodityId,
            location,
            weather,
            tags,
          });
        }}
        className="space-y-6"
      >
        {/* CATATAN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <StickyNote size={15} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Catatan
            </h3>
          </div>

          <div>
            <label
              htmlFor="note-title"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Judul{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kondisi tanaman setelah hujan deras"
              className={inputCls}
            />
          </div>

          <div>
            <label
              htmlFor="note-content"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Isi Catatan
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              placeholder="Tulis kegiatan, pengamatan, masalah, perkembangan, atau hal penting lainnya..."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* KONTEKS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Sprout size={15} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Konteks
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="note-category"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Kategori
              </label>
              <select
                id="note-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="note-date"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Tanggal
              </label>
              <input
                id="note-date"
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="note-commodity"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Komoditas{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <select
              id="note-commodity"
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className={inputCls}
            >
              <option value="">Tidak terkait komoditas tertentu</option>
              {commodities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="note-location"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Lokasi{" "}
                <span className="font-normal text-gray-400">(opsional)</span>
              </label>
              <input
                id="note-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Lahan belakang"
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="note-weather"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Cuaca{" "}
                <span className="font-normal text-gray-400">(opsional)</span>
              </label>
              <input
                id="note-weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="Contoh: Hujan ringan"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="note-tags"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Tag{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              id="note-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Contoh: pupuk, cabai, hama"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">
              Pisahkan dengan koma.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" loading={saving} type="submit">
            {editing ? "Simpan Perubahan" : "Simpan Catatan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function CatatanPanenPage() {
  const user = getClientUser();

  const {
    data: notes,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user ? getFarmerNotes(user.id) : Promise.resolve([] as FarmerNoteRow[]),
    [user?.id],
  );

  const { data: commodities } = useFetch(
    () =>
      user
        ? getFarmerCommodities(user.id)
        : Promise.resolve([] as FarmerCommodity[]),
    [user?.id],
  );

  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<FarmerNoteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FarmerNoteRow | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [commodityFilter, setCommodityFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { filteredCount, groups, lastDate } = useMemo(() => {
    const sorted = [...(notes ?? [])];
    const q = query.trim().toLowerCase();

    const matchesTime = (note: FarmerNoteRow): boolean => {
      if (!timeFilter) return true;
      const d = note.noteDate ? new Date(note.noteDate) : null;
      if (!d || Number.isNaN(d.getTime())) return false;
      if (timeFilter === "today") return d >= startOfToday();
      if (timeFilter === "week") return d >= startOfWeek();
      if (timeFilter === "month") return d >= startOfMonth();
      return true;
    };

    let filtered = sorted.filter((note) => {
      if (categoryFilter && note.category !== categoryFilter) return false;
      if (
        commodityFilter &&
        String(note.commodityId ?? "") !== commodityFilter
      ) {
        return false;
      }
      if (!matchesTime(note)) return false;
      if (q) {
        const haystack = [
          note.title,
          note.content,
          categoryLabel(note.category),
          note.commodityName,
          note.location,
          note.weather,
          note.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    filtered = filtered.slice(0, visibleCount);
    const groups = new Map<string, FarmerNoteRow[]>();
    for (const note of filtered) {
      const d = note.noteDate ? new Date(note.noteDate) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = groups.get(key) ?? [];
      arr.push(note);
      groups.set(key, arr);
    }
    const grouped = [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

    const last = sorted.length > 0 ? sorted[0].noteDate : null;

    return {
      filteredCount: filtered.length,
      groups: grouped,
      lastDate: last ? prettyDate(last) : null,
    };
  }, [notes, query, categoryFilter, commodityFilter, timeFilter, visibleCount]);

  const openCreate = () => {
    setEditing(null);
    setComposerOpen(true);
  };

  const openEdit = (note: FarmerNoteRow) => {
    setEditing(note);
    setComposerOpen(true);
  };

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    noteDate: string;
    commodityId: string;
    location: string;
    weather: string;
    tags: string;
  }) => {
    if (!user) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("content", data.content);
    formData.set("category", data.category);
    formData.set("noteDate", data.noteDate);
    formData.set("commodityId", data.commodityId);
    formData.set("location", data.location);
    formData.set("weather", data.weather);
    formData.set("tags", data.tags);

    const res = editing
      ? await updateFarmerNote(user.id, editing.id, formData)
      : await addFarmerNote(user.id, formData);
    setSaving(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setComposerOpen(false);
    setEditing(null);
    reload();
    setVisibleCount(PAGE_SIZE);
  };

  const handleDelete = async (note: FarmerNoteRow) => {
    if (!user) return;
    setDeletingId(note.id);
    const res = await deleteFarmerNote(user.id, note.id);
    setDeletingId(null);
    setDeleteTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Catatan berhasil dihapus");
    reload();
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("");
    setCommodityFilter("");
    setTimeFilter("");
    setVisibleCount(PAGE_SIZE);
  };

  const hasActiveFilters =
    query.trim().length > 0 ||
    categoryFilter ||
    commodityFilter ||
    timeFilter;

  if (loading) return <JournalSkeleton />;

  const hasMore = visibleCount < filteredCount;

  return (
    <div className="w-full animate-fade-up px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={NotebookPen}
        title="Catatan"
        subtitle="Dokumentasikan kegiatan, hasil, dan perkembangan usaha tani Anda."
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} />
            Tulis Catatan
          </Button>
        }
      />

      {/* Ringkasan ringan */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900">{notes?.length ?? 0}</span>{" "}
          catatan
        </p>
        {lastDate && (
          <p className="mt-0.5 text-xs text-gray-400">
            Terakhir diperbarui {lastDate}
          </p>
        )}
      </div>

      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : (notes ?? []).length === 0 ? (
        <EmptyState
          title="Belum ada catatan"
          message="Mulai dokumentasikan kegiatan, pengamatan, perkembangan, atau hal penting lainnya dalam usaha tani Anda."
        >
          <Button size="sm" className="mt-5" onClick={openCreate}>
            <Plus size={16} />
            Tulis Catatan Pertama
          </Button>
        </EmptyState>
      ) : (
        <div className="max-w-4xl">
          {/* Cari & filter */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Cari catatan..."
                aria-label="Cari catatan"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter size={15} className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Filter kategori"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="">Semua kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={commodityFilter}
                onChange={(e) => {
                  setCommodityFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Filter komoditas"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="">Semua komoditas</option>
                {(commodities ?? []).map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Filter waktu"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="">Semua waktu</option>
                <option value="today">Hari ini</option>
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
              </select>
            </div>
          </div>

          {/* Daftar catatan */}
          {groups.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-10">
              <p className="text-sm text-gray-500">
                {hasActiveFilters
                  ? "Tidak ada catatan yang cocok."
                  : "Tidak ada catatan."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {groups.map(([monthKey, monthNotes]) => (
                <section key={monthKey} aria-label={monthLabel(monthKey)}>
                  <div className="flex items-center gap-4">
                    <h3 className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                      {monthLabel(monthKey)}
                    </h3>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="mt-1">
                    {monthNotes.map((note) => (
                      <JournalEntry
                        key={note.id}
                        note={note}
                        deleting={deletingId === note.id}
                        onEdit={() => openEdit(note)}
                        onDelete={() => setDeleteTarget(note)}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Muat lebih banyak (
                    {formatNumber(filteredCount - visibleCount)} tersisa)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Konfirmasi hapus */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Catatan?"
        message={
          deleteTarget?.title
            ? `Catatan "${deleteTarget.title}" akan dihapus secara permanen.`
            : `Catatan pada ${deleteTarget ? prettyDate(deleteTarget.noteDate) : "-"} akan dihapus secara permanen.`
        }
        confirmLabel="Hapus"
        onConfirm={() => {
          if (deleteTarget) return handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
        isPending={deletingId !== null}
      />

      {/* Modal tulis/edit catatan */}
      {composerOpen && (
        <NoteComposer
          key={editing?.id ?? "new"}
          open={composerOpen}
          onClose={() => {
            setComposerOpen(false);
            setEditing(null);
          }}
          commodities={commodities ?? []}
          editing={editing}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

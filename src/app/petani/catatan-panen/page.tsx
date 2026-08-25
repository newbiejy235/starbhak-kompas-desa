"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NotebookPen, Plus, Sprout, Trash2 } from "lucide-react";
import {
  addHarvestRecord,
  deleteHarvestRecord,
  getHarvestRecords,
} from "@/actions/harvest";
import type { HarvestRecordRow } from "@/lib/types/market";
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
import { formatDate, formatNumber } from "@/lib/format";

const QUALITY_OPTIONS = ["A", "B", "C"];

/* ---------------------- SKELETON ---------------------- */
function NotesSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
      </div>
      <Skeleton className="h-[88px] rounded-card" />
      <Skeleton className="h-[88px] rounded-card" />
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function CatatanPanenPage() {
  const user = getClientUser();

  const {
    data: records,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user
      ? getHarvestRecords(user.id)
      : Promise.resolve([] as HarvestRecordRow[]),
    [user?.id],
  );

  const { data: commodities } = useFetch(
    () =>
      user
        ? getFarmerCommodities(user.id)
        : Promise.resolve([] as FarmerCommodity[]),
    [user?.id],
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Konfirmasi hapus memakai dialog (bukan window.confirm) agar konsisten.
  const [deleteTarget, setDeleteTarget] = useState<HarvestRecordRow | null>(null);

  const totals = useMemo(() => {
    const list = records ?? [];
    return {
      count: list.length,
      quantity: list.reduce((acc, r) => acc + Number(r.quantity), 0),
      commodities: new Set(list.map((r) => r.commodityId)).size,
    };
  }, [records]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    const res = await addHarvestRecord(user.id, formData);
    setSaving(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Catatan panen berhasil disimpan");
    setOpen(false);
    reload();
  };

  const handleDelete = async (record: HarvestRecordRow) => {
    if (!user) return;
    setDeletingId(record.id);
    const res = await deleteHarvestRecord(user.id, record.id);
    setDeletingId(null);
    setDeleteTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Catatan panen dihapus");
    reload();
  };

  if (loading) return <NotesSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={NotebookPen}
        title="Catatan Panen"
        subtitle="Catat hasil panen dan perkembangan produksi Anda."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Catat Panen
          </Button>
        }
      />

      {/* Mini stats */}
      <section className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Total Catatan</p>
          <p className="mt-0.5 text-xl font-black text-gray-900">
            {totals.count}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Total Hasil</p>
          <p className="mt-0.5 text-xl font-black text-gray-900">
            {formatNumber(totals.quantity)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Komoditas Tercatat</p>
          <p className="mt-0.5 text-xl font-black text-gray-900">
            {totals.commodities}
          </p>
        </div>
      </section>

      {/* Daftar catatan */}
      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : (records ?? []).length === 0 ? (
        <EmptyState
          title="Belum Ada Catatan Panen"
          message="Catat hasil panen pertama Anda untuk mulai memantau perkembangan produksi."
        >
          <Button
            size="sm"
            className="mt-5"
            onClick={() => setOpen(true)}
          >
            <Plus size={16} />
            Catat Panen Pertama
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-2.5">
          {(records ?? []).map((r, i) => (
            <article
              key={r.id}
              className="flex items-start gap-3.5 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 hover:shadow-lift"
              style={{
                animationDelay: `${Math.min(i * 40, 240)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sprout size={19} strokeWidth={2.25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[15px] font-semibold text-gray-900">
                    {r.commodityName}
                  </p>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    Kualitas {r.quality}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {formatNumber(r.quantity)} {r.unit}
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    · dipanen {formatDate(r.harvestDate)}
                  </span>
                </p>
                {r.notes && (
                  <p className="mt-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                    {r.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => setDeleteTarget(r)}
                disabled={deletingId === r.id}
                aria-label={`Hapus catatan panen ${r.commodityName}`}
                className="self-start rounded-lg p-1.5 text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Modal catat panen */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Catatan Panen?"
        message={`Catatan panen ${deleteTarget?.commodityName ?? ""} akan dihapus permanen dari riwayat Anda.`}
        confirmLabel="Hapus"
        onConfirm={() => {
          if (deleteTarget) return handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
        isPending={deletingId !== null}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Catat Hasil Panen">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="record-commodity"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Komoditas
            </label>
            <select
              id="record-commodity"
              name="commodityId"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
            >
              <option value="" disabled>
                Pilih komoditas
              </option>
              {(commodities ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {(commodities ?? []).length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                Anda belum memiliki komoditas. Tambahkan komoditas terlebih
                dahulu.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="record-date"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Tanggal Panen
              </label>
              <input
                id="record-date"
                name="harvestDate"
                type="date"
                required
                defaultValue={toISODate(new Date())}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="record-quality"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Kualitas
              </label>
              <select
                id="record-quality"
                name="quality"
                defaultValue="A"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              >
                {QUALITY_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="record-quantity"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Jumlah Hasil
              </label>
              <input
                id="record-quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="cth. 80"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="record-unit"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Satuan
              </label>
              <input
                id="record-unit"
                name="unit"
                defaultValue="kg"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="record-notes"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Catatan{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <textarea
              id="record-notes"
              name="notes"
              rows={3}
              placeholder="cth. Panen pagi, kualitas terjaga, sebagian disalurkan ke pasar..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button size="sm" loading={saving} type="submit">
              Simpan Catatan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

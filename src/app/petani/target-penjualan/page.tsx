"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarRange, Target, Wallet } from "lucide-react";
import {
  getSalesTargetOverview,
  saveSalesTarget,
} from "@/actions/target";
import type { SalesTargetOverview } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import CountUp from "@/components/ui/CountUp";
import { formatDate, formatRupiah } from "@/lib/format";

/* ---------------------- HELPER DATES ---------------------- */
function toISODate(dateVal: Date | string | number): string {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------------------- SKELETON ---------------------- */
function TargetSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-52 rounded-card" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
      </div>
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function TargetPenjualanPage() {
  const user = getClientUser();

  const {
    data: overview,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user
      ? getSalesTargetOverview(user.id)
      : Promise.resolve({
        target: null,
        achievedAmount: 0,
        percent: 0,
        remaining: 0,
      } as SalesTargetOverview),
    [user?.id],
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Default periode: Awal bulan s.d. Akhir bulan saat ini
  const now = new Date();
  const defaultStart = toISODate(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const defaultEnd = toISODate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    setSaving(true);

    const res = await saveSalesTarget(user.id, formData);
    setSaving(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Target penjualan berhasil disimpan");
    setOpen(false);
    reload();
  };

  if (loading) return <TargetSkeleton />;

  const target = overview?.target ?? null;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={Target}
        title="Target Penjualan"
        subtitle="Tetapkan target dan pantau pencapaian penjualan Anda."
        action={
          <Button
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Target size={16} />
            {target ? "Ubah Target" : "Atur Target"}
          </Button>
        }
      />

      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : !target ? (
        <EmptyState
          title="Belum Ada Target Penjualan"
          message="Tetapkan target pendapatan pertama Anda. Pencapaian akan dihitung otomatis dari transaksi yang sudah dibayar."
        >
          <Button
            size="sm"
            className="mt-5"
            onClick={() => setOpen(true)}
          >
            <Target size={16} />
            Atur Target Pertama
          </Button>
        </EmptyState>
      ) : (
        <>
          {/* Kartu Utama Target */}
          <section className="relative mb-4 overflow-hidden rounded-card bg-gradient-to-br from-primary to-primary-dark p-6 shadow-lift sm:p-8">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5"
            />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
                    <Wallet size={14} />
                    Target Pendapatan
                  </p>
                  <CountUp
                    value={Number(target.targetAmount)}
                    prefix="Rp "
                    className="mt-1 block text-3xl font-black tracking-tight text-white sm:text-4xl"
                  />
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-white/60">
                    <CalendarRange size={12} />
                    {formatDate(target.startDate)} — {formatDate(target.endDate)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                    Tercapai
                  </p>
                  <p className="text-lg font-extrabold text-white">
                    {formatRupiah(overview?.achievedAmount ?? 0)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div
                  role="progressbar"
                  aria-valuenow={overview?.percent ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progres pencapaian target"
                  className="h-3 w-full overflow-hidden rounded-full bg-white/15"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-emerald-300 transition-all duration-700 ease-smooth animate-grow-x"
                    style={{ width: `${overview?.percent ?? 0}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                  <span className="font-bold text-white">
                    {overview?.percent ?? 0}% tercapai
                  </span>
                  <span>
                    Sisa{" "}
                    <span className="font-semibold text-white">
                      {formatRupiah(overview?.remaining ?? 0)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Rincian */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Nominal Target</p>
              <p className="mt-0.5 text-lg font-black text-gray-900">
                {formatRupiah(target.targetAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Sudah Tercapai</p>
              <p className="mt-0.5 text-lg font-black text-primary">
                {formatRupiah(overview?.achievedAmount ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Periode Berakhir</p>
              <p className="mt-0.5 text-base font-black text-gray-900">
                {formatDate(target.endDate)}
              </p>
            </div>
          </section>

          <p className="mt-3 px-1 text-xs text-gray-400">
            Pencapaian dihitung dari transaksi lunas pada periode target berjalan.
          </p>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Atur Target Penjualan">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="target-amount"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Nominal Target (Rp)
            </label>
            <input
              id="target-amount"
              name="targetAmount"
              type="number"
              min="1"
              step="any"
              required
              placeholder="cth. 10000000"
              defaultValue={
                target && target.targetAmount && !isNaN(Number(target.targetAmount))
                  ? Number(target.targetAmount)
                  : ""
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="target-start"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Tanggal Mulai
              </label>
              <input
                id="target-start"
                name="startDate"
                type="date"
                required
                defaultValue={
                  target ? toISODate(target.startDate) : defaultStart
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="target-end"
                className="mb-1.5 block text-sm font-medium text-neutral-900"
              >
                Tanggal Selesai
              </label>
              <input
                id="target-end"
                name="endDate"
                type="date"
                required
                defaultValue={
                  target ? toISODate(target.endDate) : defaultEnd
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" loading={saving} type="submit">
              Simpan Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
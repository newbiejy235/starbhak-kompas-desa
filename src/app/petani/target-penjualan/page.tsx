"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  getSalesTargetOverview,
  saveSalesTarget,
} from "@/actions/target";
import type { SalesTargetOverview } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { toISODate } from "@/utils/date";
import PageHeader from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import CountUp from "@/components/ui/CountUp";
import { formatDate, formatRupiah } from "@/lib/format";

/* ---------------------- HELPERS ---------------------- */
function safePercent(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function getStatusInfo(percent: number, endDate: Date, now: Date) {
  if (percent >= 100) {
    return {
      label: "Target Tercapai",
      description: "Selamat! Target penjualan Anda sudah tercapai.",
      color: "text-success",
      bgColor: "bg-success/10",
      icon: CheckCircle2,
    };
  }

  const isEnded = now > endDate;

  if (isEnded) {
    return {
      label: "Periode Berakhir",
      description: `Target tercapai ${percent}% dari yang ditetapkan.`,
      color: "text-warning",
      bgColor: "bg-warning/10",
      icon: Clock,
    };
  }

  if (percent >= 75) {
    return {
      label: "Hampir Tercapai",
      description: `Sangat baik! Anda sudah mencapai ${percent}% dari target.`,
      color: "text-success",
      bgColor: "bg-success/10",
      icon: TrendingUp,
    };
  }

  if (percent > 0) {
    return {
      label: "Sedang Berjalan",
      description: `Target Anda sedang berjalan, ${percent}% sudah tercapai.`,
      color: "text-primary",
      bgColor: "bg-primary/10",
      icon: Target,
    };
  }

  return {
    label: "Belum Ada Pencapaian",
    description: "Target penjualan sudah aktif. Mulai capai dari transaksi pertama Anda.",
    color: "text-neutral-500",
    bgColor: "bg-neutral-100",
    icon: Target,
  };
}

function getRemainingDays(endDate: Date, now: Date): number {
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ---------------------- SKELETON ---------------------- */
function TargetSkeleton() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-56 rounded-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-[64px] rounded-xl" />
        <Skeleton className="h-[64px] rounded-xl" />
        <Skeleton className="h-[64px] rounded-xl" />
        <Skeleton className="h-[64px] rounded-xl" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = mounted ? new Date() : new Date(0);

  const defaultStart = toISODate(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const defaultEnd = toISODate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const targetAmount = Number(formData.get("targetAmount"));
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");

    if (!targetAmount || targetAmount <= 0) {
      toast.error("Nominal target harus lebih dari 0");
      return;
    }
    if (!startDate) {
      toast.error("Tanggal mulai wajib diisi");
      return;
    }
    if (!endDate) {
      toast.error("Tanggal selesai wajib diisi");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Tanggal selesai harus setelah tanggal mulai");
      return;
    }

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
  const achievedAmount = Number(overview?.achievedAmount ?? 0);
  const percent = safePercent(overview?.percent);
  const remaining = Number(overview?.remaining ?? 0);
  const targetAmount = target ? Number(target.targetAmount) : 0;
  const visualPercent = Math.min(percent, 100);

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <PageHeader
        icon={Target}
        title="Target Penjualan"
        subtitle="Tetapkan target penjualan dan pantau pencapaiannya dalam satu periode."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
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
          {/* ---- MAIN TARGET OVERVIEW ---- */}
          <section className="rounded-card border border-gray-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: Target amount */}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                  <Wallet size={14} className="text-primary" />
                  Target Pendapatan
                </p>
                <CountUp
                  value={targetAmount}
                  prefix="Rp "
                  className="mt-2 block text-3xl font-black tracking-tight text-gray-900 sm:text-4xl"
                />
                <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                  <CalendarRange size={12} />
                  {formatDate(target.startDate)} — {formatDate(target.endDate)}
                </p>
              </div>

              {/* Right: Percentage circle-style display */}
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                  {/* Background circle */}
                  <svg
                    className="h-20 w-20 -rotate-90"
                    viewBox="0 0 80 80"
                    aria-hidden
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-gray-100"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - visualPercent / 100)}`}
                      className="text-primary transition-all duration-700 ease-smooth"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold text-gray-900">
                    {percent}%
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    Pencapaian
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(achievedAmount)} tercapai
                  </p>
                </div>
              </div>
            </div>

            {/* ---- PROGRESS BAR ---- */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  Progres Pencapaian
                </span>
                <span className="font-semibold text-gray-900">
                  {formatRupiah(achievedAmount)} dari{" "}
                  {formatRupiah(targetAmount)}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progres pencapaian target"
                className="h-3 w-full overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-smooth animate-grow-x"
                  style={{ width: `${visualPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {percent >= 100 ? (
                  <span className="font-medium text-success">
                    Target penjualan Anda sudah tercapai.
                  </span>
                ) : remaining > 0 ? (
                  <>
                    Masih ada{" "}
                    <span className="font-medium text-gray-700">
                      {formatRupiah(remaining)}
                    </span>{" "}
                    untuk mencapai target.
                  </>
                ) : (
                  "Belum ada transaksi yang masuk dalam perhitungan target."
                )}
              </p>
            </div>
          </section>

          {/* ---- SUPPORTING STATISTICS ---- */}
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Target"
              value={formatRupiah(targetAmount)}
              icon={<Wallet size={14} className="text-primary" />}
            />
            <StatCard
              label="Tercapai"
              value={formatRupiah(achievedAmount)}
              icon={<TrendingUp size={14} className="text-success" />}
              valueColor="text-success"
            />
            <StatCard
              label="Sisa"
              value={formatRupiah(remaining)}
              icon={<Target size={14} className="text-warning" />}
              valueColor={percent >= 100 ? "text-success" : "text-gray-900"}
            />
            <StatCard
              label="Persentase"
              value={`${percent}%`}
              icon={<CheckCircle2 size={14} className="text-secondary" />}
              valueColor="text-gray-900"
            />
          </section>

          {/* ---- STATUS + PERIOD ---- */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Status card */}
            <StatusCard
              percent={percent}
              endDate={
                target?.endDate ? new Date(target.endDate) : new Date()
              }
              now={now}
            />

            {/* Period card */}
            <div className="border-b border-gray-200 px-1 py-4 sm:px-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                Periode Target
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tanggal Mulai</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(target.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tanggal Selesai</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(target.endDate)}
                  </span>
                </div>
                {mounted && (
                  <>
                    <div className="border-t border-gray-100 pt-2">
                      {now > new Date(target.endDate) ? (
                        <p className="text-xs font-medium text-warning">
                          Periode sudah berakhir
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Sisa waktu:{" "}
                          <span className="font-semibold text-gray-900">
                            {getRemainingDays(
                              new Date(target.endDate),
                              now,
                            )}{" "}
                            hari
                          </span>
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ---- FOOTER NOTE ---- */}
          <p className="mt-3 px-1 text-xs text-gray-400">
            Pencapaian dihitung dari transaksi lunas pada periode target berjalan.
          </p>
        </>
      )}

      {/* ---- MODAL ---- */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Atur Target Penjualan"
      >
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

/* ---------------------- STAT CARD ---------------------- */
function StatCard({
  label,
  value,
  icon,
  valueColor = "text-gray-900",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="border-b border-gray-200 px-1 py-3 sm:px-2">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <p className={`mt-1 text-lg font-black ${valueColor} sm:text-xl`}>{value}</p>
    </div>
  );
}

/* ---------------------- STATUS CARD ---------------------- */
function StatusCard({
  percent,
  endDate,
  now,
}: {
  percent: number;
  endDate: Date;
  now: Date;
}) {
  const status = getStatusInfo(percent, endDate, now);
  const StatusIcon = status.icon;

  return (
    <div className="border-b border-gray-200 px-1 py-4 sm:px-2">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
        Status Target
      </p>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${status.bgColor}`}
        >
          <StatusIcon size={18} className={status.color} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${status.color}`}>
            {status.label}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            {status.description}
          </p>
        </div>
      </div>
    </div>
  );
}

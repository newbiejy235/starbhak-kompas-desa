"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, SlidersHorizontal, MapPin, Store } from "lucide-react";
import { getFarmerOrders, updateOrderStatus } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import { EmptyState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/format";
import type { FarmerOrder } from "@/lib/types/market";
import OrderCard from "@/components/petanipage/orders/OrderCard";
import OrderDetailDrawer from "@/components/petanipage/orders/OrderDetailDrawer";
import CancelDialog from "@/components/petanipage/orders/CancelDialog";

function OrdersSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-1 mb-5 h-4 w-72" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 border-b border-gray-200" />
        ))}
      </div>

      <Skeleton className="mb-6 h-11 w-full" />

      <div className="hidden border-b border-gray-200 px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_150px_150px] sm:items-center sm:gap-5">
        <span>Komoditas</span>
        <span>Pembeli</span>
        <span>Status</span>
        <span className="text-right">Total / Aksi</span>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="hidden h-8 w-24 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="border-b border-gray-200 px-1 py-3 sm:px-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={`mt-1 text-xl font-black ${accent ? "text-primary" : "text-gray-900"
          }`}
      >
        {value}
      </p>
    </div>
  );
}

const selectClass =
  "rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none";

export default function PetaniOrders() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const user = getClientUser();
  const searchParams = useSearchParams();

  const { data, loading, reload } = useFetch(
    () =>
      user ? getFarmerOrders(user.id) : Promise.resolve([] as FarmerOrder[]),
    [user?.id],
  );
  const orders = useMemo(() => data ?? [], [data]);

  const urlStatus = searchParams.get("status");
  const [statusFilter, setStatusFilter] = useState(() =>
    urlStatus && urlStatus in ORDER_STATUS_LABEL ? urlStatus : "all",
  );
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<FarmerOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<FarmerOrder | null>(null);
  const [advancingKey, setAdvancingKey] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.commodityName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (paymentFilter !== "all")
      list = list.filter((o) => (o.paymentStatus ?? "pending") === paymentFilter);
    if (deliveryFilter !== "all")
      list = list.filter((o) => o.deliveryMethod === deliveryFilter);
    list.sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return list;
  }, [orders, query, statusFilter, paymentFilter, deliveryFilter, sort]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) =>
        ["confirmed", "processing", "shipped"].includes(o.status),
      ).length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders],
  );

  const handleAdvance = async (id: number, status: string) => {
    if (!user || advancingKey) return;
    setAdvancingKey(`${id}-${status}`);
    try {
      const res = await updateOrderStatus(id, status, user.id);
      if (!res.success) {
        toast.error(res.message);
      }
      await reload();
      setVersion((v) => v + 1);
    } catch {
      toast.error("Gagal memperbarui pesanan. Silakan coba lagi.");
    } finally {
      setAdvancingKey(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await handleAdvance(cancelTarget.id, "cancelled");
    setCancelTarget(null);
  };

  if (loading && orders.length === 0) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen animate-fade-up">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Pesanan Masuk
        </h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Kelola pesanan, pembayaran, pengiriman, dan komunikasi dengan pembeli.
        </p>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <StatPill label="Total Pesanan" value={stats.total} />
          <StatPill label="Menunggu" value={stats.pending} />
          <StatPill label="Diproses" value={stats.processing} />
          <StatPill label="Selesai" value={stats.completed} accent />
        </div>

        {/* Filter bar */}
        <section className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode pesanan, pembeli, atau komoditas..."
                aria-label="Cari pesanan"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Tampilkan filter"
              aria-expanded={showFilters}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors sm:hidden ${showFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 text-gray-700"
                }`}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          <div
            className={`${showFilters ? "grid" : "hidden"
              } mt-3 grid-cols-2 gap-2 sm:grid sm:grid-cols-4`}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status pesanan"
              className={selectClass}
            >
              <option value="all">Semua Status</option>
              {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              aria-label="Filter status pembayaran"
              className={selectClass}
            >
              <option value="all">Semua Pembayaran</option>
              {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              aria-label="Filter metode penerimaan"
              className={selectClass}
            >
              <option value="all">Semua Pengiriman</option>
              <option value="pickup">Ambil Sendiri</option>
              <option value="expedition">Ekspedisi</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Urutkan pesanan"
              className={selectClass}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </section>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            title={orders.length === 0 ? "Belum Ada Pesanan" : "Tidak Ada Pesanan"}
            message={
              orders.length === 0
                ? "Pesanan dari pembeli akan muncul di sini."
                : "Tidak ada pesanan yang cocok dengan filter saat ini."
            }
          />
        ) : (
          <div className="rounded-2xl border border-gray-200/80 bg-white">
            {/* Header desktop */}
            <div className="hidden border-b border-gray-200 px-3 pb-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_150px_150px] sm:items-center sm:gap-5">
              <span>Komoditas</span>
              <span>Pembeli</span>
              <span>Status</span>
              <span className="text-right">Total / Aksi</span>
            </div>
            <div className="divide-y divide-gray-100 px-3">
              {filtered.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  advancingKey={advancingKey}
                  onOpen={setSelected}
                  onAdvance={handleAdvance}
                  onCancelRequest={setCancelTarget}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <OrderDetailDrawer
          key={`${selected.id}-${version}`}
          orderId={selected.id}
          summary={selected}
          version={version}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
          onCancelRequest={setCancelTarget}
          advancingKey={advancingKey}
        />
      )}

      {/* Cancel confirmation */}
      {cancelTarget && (
        <CancelDialog
          orderCode={cancelTarget.orderCode}
          onConfirm={confirmCancel}
          onDismiss={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
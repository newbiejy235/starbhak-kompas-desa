"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDistribution, countAdminDistribution } from "@/actions/admin";
import {
  formatRupiah,
  formatDateTime,
  ORDER_STATUS_LABEL,
  DELIVERY_METHOD_LABEL,
} from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import AdminPagination from "@/components/adminpage/Pagination";
import { Search, Truck, MapPin, Store, UserRound, ArrowUpRight } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminDistributionRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 20;

const METHOD_TABS = [
  { id: "all", label: "Semua Metode" },
  { id: "pickup", label: "Pickup" },
  { id: "expedition", label: "Ekspedisi" },
];

const STATUS_OPTIONS = [
  { id: "all", label: "Semua Status" },
  { id: "pending", label: "Menunggu" },
  { id: "confirmed", label: "Dikonfirmasi" },
  { id: "processing", label: "Diproses" },
  { id: "shipped", label: "Dikirim" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminDistributionPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () =>
      Promise.all([
        getAdminDistribution({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          deliveryMethod: method,
          status,
        }),
        countAdminDistribution({
          search: debouncedSearch || undefined,
          deliveryMethod: method,
          status,
        }),
      ]),
    [page, debouncedSearch, method, status],
  );

  const rows: AdminDistributionRow[] = data?.[0] ?? [];
  const total = data?.[1] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Monitoring Distribusi
        </h1>
        <p className="text-sm text-gray-500">
          Pantau pengiriman dan pengambilan pesanan antara petani dan pembeli.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode pesanan, pembeli, petani, atau alamat..."
            aria-label="Cari distribusi"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {METHOD_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setMethod(t.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                method === t.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-card" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan Distribusi"
          message={
            search || method !== "all" || status !== "all"
              ? "Tidak ada pesanan yang cocok dengan filter."
              : "Belum ada pesanan dengan informasi pengiriman."
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-4 font-medium">Pesanan</th>
                  <th className="px-5 py-4 font-medium">Pembeli / Petani</th>
                  <th className="px-5 py-4 font-medium">Metode</th>
                  <th className="px-5 py-4 font-medium">Alamat</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const address =
                    o.deliveryAddress ||
                    [o.addressStreet, o.addressCity, o.addressProvince]
                      .filter(Boolean)
                      .join(", ") ||
                    "-";
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 hover:bg-primary/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-primary transition-colors"
                        >
                          {o.orderCode}
                          <ArrowUpRight size={12} className="text-gray-300" />
                        </Link>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(o.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1 text-xs text-gray-600">
                          <UserRound size={12} /> {o.buyerName}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Store size={12} /> {o.farmerName}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Truck size={13} className="text-gray-400" />
                          {DELIVERY_METHOD_LABEL[o.deliveryMethod] ?? o.deliveryMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="flex items-start gap-1 text-xs text-gray-500 max-w-[220px]">
                          <MapPin size={12} className="shrink-0 mt-0.5" />
                          <span className="truncate">{address}</span>
                        </p>
                        {o.recipientName && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {o.recipientName}
                            {o.recipientPhone ? ` · ${o.recipientPhone}` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-primary">
                        {formatRupiah(o.totalPrice)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={o.status}
                          label={ORDER_STATUS_LABEL[o.status] ?? o.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="pesanan"
          />
        </>
      )}
    </div>
  );
}
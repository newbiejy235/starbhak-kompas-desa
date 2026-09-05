"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminPayments, countAdminPayments } from "@/actions/admin";
import { formatRupiah, formatDateTime, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import AdminPagination from "@/components/adminpage/Pagination";
import { Search, CreditCard, ArrowUpRight } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminPaymentRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "paid", label: "Lunas" },
  { id: "failed", label: "Gagal" },
  { id: "refunded", label: "Dikembalikan" },
];

const METHOD_OPTIONS = [
  { id: "all", label: "Semua Metode" },
  { id: "bank_transfer", label: "Transfer Bank" },
  { id: "virtual_account", label: "Virtual Account" },
  { id: "ewallet", label: "E-Wallet" },
  { id: "qris", label: "QRIS" },
  { id: "cod", label: "COD" },
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () =>
      Promise.all([
        getAdminPayments({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          status,
          method,
        }),
        countAdminPayments({
          search: debouncedSearch || undefined,
          status,
          method,
        }),
      ]),
    [page, debouncedSearch, status, method],
  );

  const payments: AdminPaymentRow[] = data?.[0] ?? [];
  const total = data?.[1] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totalAmount = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Monitoring Pembayaran
        </h1>
        <p className="text-sm text-gray-500">
          Pantau status pembayaran seluruh pesanan. Status dikelola sistem
          pembayaran — admin tidak mengubahnya secara manual.
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
            placeholder="Cari berdasarkan referensi, kode pesanan, atau nama pembeli..."
            aria-label="Cari pembayaran"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setStatus(t.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                status === t.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
            className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-card" />
      ) : payments.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pembayaran"
          message={
            search || status !== "all" || method !== "all"
              ? "Tidak ada pembayaran yang cocok dengan filter."
              : "Belum ada data pembayaran."
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-4 font-medium">Referensi</th>
                  <th className="px-5 py-4 font-medium">Pesanan</th>
                  <th className="px-5 py-4 font-medium">Pembeli</th>
                  <th className="px-5 py-4 font-medium">Metode</th>
                  <th className="px-5 py-4 font-medium">Jumlah</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-primary/[0.03] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {p.referenceCode ?? "-"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(p.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${p.orderId}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-primary transition-colors"
                      >
                        {p.orderCode}
                        <ArrowUpRight size={12} className="text-gray-300" />
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{p.buyerName}</td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <CreditCard size={13} className="text-gray-400" />
                        {PAYMENT_METHOD_LABEL[p.method] ?? p.method}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-primary">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {p.paidAt ? formatDateTime(p.paidAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Total nilai halaman ini:{" "}
              <span className="font-extrabold text-primary">
                {formatRupiah(totalAmount)}
              </span>
            </p>
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="pembayaran"
            />
          </div>
        </>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { getAllTransactions } from "@/actions/admin";
import {
  formatRupiah,
  formatDateTime,
  PAYMENT_METHOD_LABEL,
} from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { Download } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { TransactionRow } from "@/lib/types/market";

export default function AdminTransactions() {
  const [filter, setFilter] = useState("all");

  const { data: transactions, loading } = useFetch(
    () => getAllTransactions(),
    [],
  );

  if (loading) return <LoadingState />;

  const list: TransactionRow[] = transactions ?? [];
  const filtered = list.filter((t) => filter === "all" || t.status === filter);

  const totalAmount = filtered.reduce((a, t) => a + Number(t.amount), 0);
  const totalFee = filtered.reduce((a, t) => a + Number(t.fee), 0);

  const exportCSV = () => {
    const header = [
      "Referensi",
      "Kode Pesanan",
      "Komoditas",
      "Pembeli",
      "Metode",
      "Jumlah",
      "Fee",
      "Status",
      "Waktu",
    ];
    const rows = filtered.map((t) => [
      t.referenceCode,
      t.orderCode,
      t.commodityName,
      t.buyerName,
      PAYMENT_METHOD_LABEL[t.method] ?? t.method,
      Number(t.amount).toFixed(2),
      Number(t.fee).toFixed(2),
      t.status,
      new Date(t.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-transaksi-kompas-desa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] mb-1">Data Transaksi</h1>
          <p className="text-sm text-gray-500">
            Seluruh transaksi penjualan hasil panen di platform.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-[#025246] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#024036] transition-colors"
        >
          <Download size={18} /> Unduh Laporan (Excel/CSV)
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6 mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Nilai Transaksi</p>
          <p className="text-2xl font-extrabold text-[#025246]">{formatRupiah(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Fee Platform</p>
          <p className="text-2xl font-extrabold text-gray-800">{formatRupiah(totalFee)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">Jumlah Transaksi</p>
          <p className="text-2xl font-extrabold text-gray-800">{filtered.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: "Semua" },
          { id: "pending", label: "Menunggu" },
          { id: "paid", label: "Lunas" },
          { id: "failed", label: "Gagal" },
          { id: "refunded", label: "Dikembalikan" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f.id
                ? "bg-[#025246] text-white border-[#025246]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#025246]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Transaksi" message="Tidak ada transaksi yang cocok dengan filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-4 font-medium">Referensi</th>
                <th className="px-5 py-4 font-medium">Pesanan</th>
                <th className="px-5 py-4 font-medium">Komoditas</th>
                <th className="px-5 py-4 font-medium">Pembeli</th>
                <th className="px-5 py-4 font-medium">Metode</th>
                <th className="px-5 py-4 font-medium">Jumlah</th>
                <th className="px-5 py-4 font-medium">Fee</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-semibold text-gray-800">{t.referenceCode}</td>
                  <td className="px-5 py-4 text-gray-600">{t.orderCode}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{t.commodityName}</td>
                  <td className="px-5 py-4 text-gray-600">{t.buyerName}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {PAYMENT_METHOD_LABEL[t.method] ?? t.method}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-[#025246]">{formatRupiah(t.amount)}</td>
                  <td className="px-5 py-4 text-gray-600">{formatRupiah(t.fee)}</td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

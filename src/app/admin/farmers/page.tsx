"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminFarmers,
  countAdminFarmers,
  suspendUserAccount,
  restoreUserAccount,
} from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import { formatDate, formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import AdminPagination from "@/components/adminpage/Pagination";
import ReasonDialog from "@/components/adminpage/ReasonDialog";
import { Search, Ban, RotateCcw, Eye } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminFarmerRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "verified", label: "Terverifikasi" },
  { id: "rejected", label: "Ditolak" },
  { id: "suspended", label: "Ditangguhkan" },
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminFarmersPage() {
  const admin = getClientUser();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, loading, reload } = useFetch(
    () =>
      Promise.all([
        getAdminFarmers({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
          status,
        }),
        countAdminFarmers({
          search: debouncedSearch || undefined,
          status,
        }),
      ]),
    [page, debouncedSearch, status],
  );

  const [action, setAction] = useState<
    | null
    | { type: "suspend"; farmer: AdminFarmerRow }
    | { type: "restore"; farmer: AdminFarmerRow }
  >(null);
  const [pending, setPending] = useState(false);

  const farmers: AdminFarmerRow[] = data?.[0] ?? [];
  const total = data?.[1] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const runSuspend = async (reason?: string) => {
    if (!admin || !action || action.type !== "suspend") return;
    setPending(true);
    try {
      const res = await suspendUserAccount(action.farmer.id, reason ?? null, admin.id);
      if (!res.success) toast.error(res.message);
      else {
        toast.success(res.message);
        setAction(null);
        reload();
      }
    } finally {
      setPending(false);
    }
  };

  const runRestore = async () => {
    if (!admin || !action || action.type !== "restore") return;
    setPending(true);
    try {
      const res = await restoreUserAccount(action.farmer.id, admin.id);
      if (!res.success) toast.error(res.message);
      else {
        toast.success(res.message);
        setAction(null);
        reload();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Manajemen Petani
        </h1>
        <p className="text-sm text-gray-500">
          Kelola akun petani, status verifikasi, dan komoditasnya.
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
            placeholder="Cari petani berdasarkan nama, email, nomor, atau wilayah..."
            aria-label="Cari petani"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-card" />
          ))}
        </div>
      ) : farmers.length === 0 ? (
        <EmptyState
          title="Tidak Ada Petani"
          message={
            search || status !== "all"
              ? "Tidak ada petani yang cocok dengan pencarian/filter."
              : "Belum ada petani terdaftar."
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {farmers.map((f) => (
                <li key={f.id}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-primary/[0.02] transition-colors">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden">
                      {f.fotoProfile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.fotoProfile} alt={f.fullName} className="h-full w-full object-cover" />
                      ) : (
                        f.fullName?.charAt(0)?.toUpperCase() ?? "?"
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {f.fullName}
                        </span>
                        <span className="hidden sm:inline text-xs text-gray-400">
                          @{f.username}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {f.email} · {f.noTelp} · {f.village || "-"}
                      </span>
                      <span className="block truncate text-[11px] text-gray-300">
                        {formatNumber(f.commodityCount)} komoditas · Terdaftar{" "}
                        {formatDate(f.createdAt)}
                      </span>
                    </span>

                    <span className="hidden md:block">
                      <StatusBadge status={f.status} />
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {f.status === "pending" && (
                        <Link
                          href={`/admin/verification/farmers/${f.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success hover:bg-success hover:text-white transition"
                        >
                          <Eye size={13} /> Review
                        </Link>
                      )}
                      <Link
                        href={`/admin/farmers/${f.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition"
                      >
                        <Eye size={13} /> Detail
                      </Link>
                      {f.status === "verified" && (
                        <button
                          type="button"
                          onClick={() => setAction({ type: "suspend", farmer: f })}
                          title="Tangguhkan"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition"
                        >
                          <Ban size={14} />
                        </button>
                      )}
                      {f.status === "suspended" && (
                        <button
                          type="button"
                          onClick={() => setAction({ type: "restore", farmer: f })}
                          title="Pulihkan"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="petani"
          />
        </>
      )}

      <ReasonDialog
        open={action?.type === "suspend"}
        title={`Tangguhkan petani "${action?.type === "suspend" ? action.farmer.fullName : ""}"?`}
        message="Akun petani tidak dapat login dan komoditasnya tidak aktif. Anda dapat memulihkannya kapan saja."
        confirmLabel="Tangguhkan"
        tone="danger"
        requireReason
        reasonPlaceholder="Contoh: Melanggar aturan platform..."
        isPending={pending}
        onConfirm={runSuspend}
        onCancel={() => setAction(null)}
      />

      <ReasonDialog
        open={action?.type === "restore"}
        title={`Pulihkan petani "${action?.type === "restore" ? action.farmer.fullName : ""}"?`}
        message="Akun akan kembali aktif dan dapat login kembali."
        confirmLabel="Pulihkan"
        tone="success"
        isPending={pending}
        onConfirm={runRestore}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}
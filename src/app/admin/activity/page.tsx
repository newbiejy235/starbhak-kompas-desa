"use client";

import { useState } from "react";
import { getAdminAuditLogs, countAdminAuditLogs } from "@/actions/admin";
import { formatDateTime, ADMIN_ACTION_LABEL } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import AdminPagination from "@/components/adminpage/Pagination";
import { ScrollText, ShieldAlert } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminAuditLogRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 20;

const ACTION_TABS = [
  { id: "all", label: "Semua" },
  { id: "APPROVE", label: "Approve" },
  { id: "REJECT", label: "Reject" },
  { id: "SUSPEND", label: "Suspend" },
  { id: "RESTORE", label: "Restore" },
];

const ENTITY_OPTIONS = [
  { id: "all", label: "Semua Entitas" },
  { id: "user", label: "User" },
  { id: "farmer", label: "Petani" },
  { id: "commodity", label: "Komoditas" },
  { id: "order", label: "Pesanan" },
];

const ACTION_TONE: Record<string, string> = {
  APPROVE: "bg-success/10 text-success border-success/30",
  REJECT: "bg-danger/10 text-danger border-danger/30",
  SUSPEND: "bg-red-50 text-red-700 border-red-200",
  RESTORE: "bg-green-50 text-green-700 border-green-200",
};

function entityLabel(row: AdminAuditLogRow): string {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  if (typeof meta.entityLabel === "string" && meta.entityLabel) {
    return meta.entityLabel;
  }
  return `${row.entityType} #${row.entityId}`;
}

function entityTypeLabel(type: string): string {
  if (type === "farmer") return "Petani";
  if (type === "commodity") return "Komoditas";
  if (type === "order") return "Pesanan";
  return type;
}

export default function AdminActivityPage() {
  const [action, setAction] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () =>
      Promise.all([
        getAdminAuditLogs({
          page,
          pageSize: PAGE_SIZE,
          action,
          entityType,
        }),
        countAdminAuditLogs({ action, entityType }),
      ]),
    [page, action, entityType],
  );

  const logs: AdminAuditLogRow[] = data?.[0] ?? [];
  const total = data?.[1] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
            <ScrollText size={22} className="text-primary" />
            Activity Logs
          </h1>
          <p className="text-sm text-gray-500">
            Jejak aksi admin di platform (approve, reject, suspend, restore).
            Log tidak dapat dihapus dari UI.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700">
          <ShieldAlert size={13} /> Tidak dapat dimanipulasi pengguna
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {ACTION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setAction(t.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                action === t.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
          >
            {ENTITY_OPTIONS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-card" />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Belum Ada Aktivitas"
          message="Aksi admin seperti approve, reject, suspend, atau restore akan tercatat di sini."
        />
      ) : (
        <>
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-4 font-medium">Admin</th>
                  <th className="px-5 py-4 font-medium">Aksi</th>
                  <th className="px-5 py-4 font-medium">Target</th>
                  <th className="px-5 py-4 font-medium">Alasan</th>
                  <th className="px-5 py-4 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-primary/[0.03] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-700 overflow-hidden">
                          {log.adminFotoProfile ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={log.adminFotoProfile}
                              alt={log.adminName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            log.adminName?.charAt(0)?.toUpperCase() ?? "?"
                          )}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {log.adminName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          ACTION_TONE[log.action] ??
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {ADMIN_ACTION_LABEL[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {entityLabel(log)}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {entityTypeLabel(log.entityType)} · ID #{log.entityId}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {log.reason ? (
                        <span className="line-clamp-2 max-w-[280px]">
                          {log.reason}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="log"
          />
        </>
      )}
    </div>
  );
}
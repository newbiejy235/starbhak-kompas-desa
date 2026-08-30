"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from "@/actions/contact";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Mail,
  Phone,
  Trash2,
  CheckCheck,
  MailOpen,
  X,
  UserRound,
} from "lucide-react";
import type { ContactMessage } from "@/actions/contact";

const SUBJECT_LABEL: Record<string, string> = {
  petani: "Saya seorang petani",
  pembeli: "Saya seorang pembeli",
  mitra: "Ingin menjadi mitra",
  lainnya: "Pertanyaan lainnya",
};

type StatusFilter = "all" | "unread" | "read";

const FILTERS: { id: StatusFilter; label: (t: number, u: number) => string }[] =
  [
    { id: "all", label: (t) => `All (${t})` },
    { id: "unread", label: (_t, u) => `Unread (${u})` },
    { id: "read", label: () => "Read" },
  ];

function MessagesSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  );
}

const chipCls = (active: boolean) =>
  `px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 whitespace-nowrap ${active
    ? "bg-primary text-white border-primary shadow-sm"
    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
  }`;

export default function AdminMessages() {
  const admin = getClientUser();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data: messages, loading, reload } = useFetch(
    () => getContactMessages(),
    [],
  );

  const list = useMemo(() => messages ?? [], [messages]);

  const filtered = useMemo(
    () =>
      filter === "all" ? list : list.filter((m) => m.status === filter),
    [list, filter],
  );

  const totalCount = list.length;
  const unreadCount = list.filter((m) => m.status === "unread").length;

  const markRead = async (id: number) => {
    if (!admin) return;
    const res = await markContactMessageRead(id, admin.id);
    if (!res.success) toast.error(res.message);
    await reload();
    if (selected && selected.id === id) {
      setSelected((prev) =>
        prev ? { ...prev, status: "read" as const } : prev,
      );
    }
  };

  const remove = async (id: number) => {
    if (!admin) return;
    if (!confirm("Yakin ingin menghapus pesan ini?")) return;
    const res = await deleteContactMessage(id, admin.id);
    if (!res.success) toast.error(res.message);
    else toast.success(res.message);
    if (selected && selected.id === id) setSelected(null);
    await reload();
  };

  if (loading) return <MessagesSkeleton />;

  return (
    <div className="w-full animate-fade-up px-4 sm:px-6 lg:px-8 xl:px-10">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1 py-5 sm:py-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Pesan Masuk
        </h1>
        <p className="text-sm text-gray-500">
          Kelola pesan yang dikirim pengunjung melalui formulir kontak.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 pb-5">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={chipCls(active)}
            >
              {f.label(totalCount, unreadCount)}
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <EmptyState
          title={list.length === 0 ? "Belum Ada Pesan" : "Tidak Ada Pesan"}
          message={
            list.length === 0
              ? "Pesan dari formulir kontak akan muncul di sini."
              : "Tidak ada pesan yang cocok dengan filter saat ini."
          }
        />
      ) : (
        <div className="w-full overflow-x-auto rounded-card border border-gray-200/80 bg-white shadow-soft">
          <table className="w-full min-w-[960px] text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="w-[22%] px-5 py-4 font-semibold">Pengirim</th>
                <th className="w-[16%] px-5 py-4 font-semibold">Kebutuhan</th>
                <th className="px-5 py-4 font-semibold">Pesan</th>
                <th className="w-[12%] px-5 py-4 font-semibold">Status</th>
                <th className="w-[15%] px-5 py-4 font-semibold">Diterima</th>
                <th className="w-[14%] px-5 py-4 text-right font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-100 transition-colors last:border-b-0 hover:bg-primary/[0.03] ${m.status === "unread" ? "bg-primary/[0.02]" : ""
                    }`}
                >
                  <td className="px-5 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="group flex items-start gap-3 text-left"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {m.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </span>
                        {m.whatsapp && (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={11} className="shrink-0" />
                            <span className="truncate">{m.whatsapp}</span>
                          </span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4 align-top text-gray-700">
                    {SUBJECT_LABEL[m.subject] ?? m.subject}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="line-clamp-2 max-w-[420px] cursor-pointer text-left text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {m.message}
                    </button>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge
                      status={m.status}
                      label={m.status === "unread" ? "Belum Dibaca" : "Sudah Dibaca"}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top text-xs text-gray-500">
                    {formatDateTime(m.createdAt)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      {m.status === "unread" && (
                        <button
                          type="button"
                          onClick={() => markRead(m.id)}
                          title="Tandai Dibaca"
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
                        >
                          <MailOpen size={14} />
                          <span className="hidden sm:inline">Tandai</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        aria-label="Hapus pesan"
                        title="Hapus Pesan"
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 transition-all hover:bg-danger hover:text-white active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelected(null)}
          />

          <div className="relative z-10 my-auto flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-card bg-white shadow-lift animate-scale-in md:w-[85vw] xl:w-[72vw] xl:max-w-7xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Detail Pesan
                </h2>
                <StatusBadge
                  status={selected.status}
                  label={selected.status === "unread" ? "Belum Dibaca" : "Sudah Dibaca"}
                />
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                className="ml-4 shrink-0 rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-90"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:grid md:grid-cols-5 md:gap-8">
              <div className="space-y-5 border-b border-gray-100 pb-6 md:col-span-2 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Pengirim
                  </p>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    {selected.name}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-700">
                    {selected.email}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {selected.whatsapp ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Kebutuhan
                  </p>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {SUBJECT_LABEL[selected.subject] ?? selected.subject}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Waktu Diterima
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDateTime(selected.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 md:col-span-3 md:mt-0">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Pesan Masuk
                </p>
                <div className="max-w-none rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {selected.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-gray-50/80 p-4 sm:p-5">
              {selected.status === "unread" && (
                <button
                  type="button"
                  onClick={() => markRead(selected.id)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98]"
                >
                  <CheckCheck size={16} /> Tandai Dibaca
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(selected.id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger/10 py-2.5 text-sm font-bold text-danger transition-all hover:bg-danger hover:text-white active:scale-[0.98]"
              >
                <Trash2 size={16} /> Hapus Pesan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

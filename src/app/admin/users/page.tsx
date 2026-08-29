"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import {
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
} from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  ROLE_LABEL,
  BUSINESS_TYPE_LABEL,
} from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  BadgeCheck,
  Ban,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminUser } from "@/lib/types/market";
import type { ActionState } from "@/lib/types/auth";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 25;

function UsersSkeleton() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <Skeleton className="h-11 w-full" />

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0 sm:px-6"
              >
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-48" />
                </div>

                <Skeleton className="hidden h-8 w-20 md:block" />
                <Skeleton className="hidden h-8 w-24 lg:block" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "…")[] = [];

  sortedPages.forEach((page, index) => {
    const previous = sortedPages[index - 1];

    if (index > 0 && page - previous > 1) {
      result.push("…");
    }

    result.push(page);
  });

  return result;
}

function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

export default function AdminUsers() {
  const admin = getClientUser();

  const [editing, setEditing] = useState<AdminUser | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const { data: users, loading, reload } = useFetch(
    () => getAllUsers(),
    [],
  );

  const list: AdminUser[] = users ?? [];

  /*
   * FILTERING ORDER:
   *
   * ALL USERS
   * ↓
   * SEARCH
   * ↓
   * ROLE
   * ↓
   * STATUS
   * ↓
   * PAGINATION
   */
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return list.filter((user) => {
      // Search
      if (query) {
        const searchableText = [
          user.fullName,
          user.username,
          user.email,
          user.noTelp,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Role
      if (filter !== "all" && user.role !== filter) {
        return false;
      }

      // Status
      if (statusFilter !== "all" && user.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [list, search, filter, statusFilter]);

  /*
   * PAGINATION
   */
  const totalUsers = filteredUsers.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalUsers / pageSize),
  );

  const safePage = Math.min(
    Math.max(currentPage, 1),
    totalPages,
  );

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    endIndex,
  );

  /*
   * Keep page valid when filtering/deleting changes
   * the total number of pages.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
   * ACTIONS
   */
  const setStatus = async (
    id: number,
    status: string,
  ) => {
    if (!admin) return;

    const result = await updateUserStatus(
      id,
      status,
      admin.id,
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    reload();
  };

  const remove = async (id: number) => {
    if (!admin) return;

    const confirmed = confirm(
      "Yakin ingin menghapus pengguna ini?",
    );

    if (!confirmed) return;

    const result = await deleteUser(
      id,
      admin.id,
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    reload();
  };

  const [state, formAction, isPending] =
    useActionState(
      async (
        _previousState: ActionState | null,
        formData: FormData,
      ) => {
        if (!admin || !editing) {
          return {
            success: false,
            message: "Terjadi kesalahan.",
          };
        }

        const result = await updateUser(
          editing.id,
          admin.id,
          formData,
        );

        if (result.success) {
          setEditing(null);
          reload();
        }

        return result;
      },
      null,
    );

  /*
   * UI HELPERS
   */
  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (
    value: string,
  ) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (
    value: string,
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (
    value: number,
  ) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(
      Math.min(
        Math.max(page, 1),
        totalPages,
      ),
    );
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10";

  const filterButton = (
    active: boolean,
    dark = false,
  ) =>
    [
      "inline-flex items-center justify-center",
      "rounded-full border px-4 py-2",
      "text-sm font-medium",
      "transition-all duration-200",
      "active:scale-[0.98]",
      active
        ? dark
          ? "border-gray-800 bg-gray-800 text-white"
          : "border-primary bg-primary text-white shadow-sm"
        : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary",
    ].join(" ");

  if (loading) {
    return <UsersSkeleton />;
  }

  const showingFrom =
    totalUsers === 0
      ? 0
      : startIndex + 1;

  const showingTo =
    totalUsers === 0
      ? 0
      : Math.min(
        endIndex,
        totalUsers,
      );

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="w-full space-y-5">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Manajemen Pengguna
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Verifikasi akun, perbarui informasi,
            dan atur status akun pengguna.
          </p>
        </header>

        {/* =====================================================
            SEARCH + FILTER TOOLBAR
        ====================================================== */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value,
                )
              }
              placeholder="Cari pengguna berdasarkan nama, username, email, atau nomor..."
              aria-label="Cari pengguna"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {
                id: "all",
                label: "Semua",
              },
              {
                id: "petani",
                label: "Petani",
              },
              {
                id: "pembeli",
                label: "Pembeli",
              },
              {
                id: "admin",
                label: "Admin",
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleRoleChange(
                    item.id,
                  )
                }
                className={filterButton(
                  filter === item.id,
                )}
              >
                {item.label}
              </button>
            ))}

            <span className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />

            {[
              {
                id: "all",
                label: "Semua Status",
              },
              {
                id: "pending",
                label: "Menunggu",
              },
              {
                id: "verified",
                label: "Terverifikasi",
              },
              {
                id: "suspended",
                label: "Ditangguhkan",
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleStatusChange(
                    item.id,
                  )
                }
                className={filterButton(
                  statusFilter === item.id,
                  true,
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            RESULT SUMMARY
        ====================================================== */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatCount(totalUsers)} pengguna
            </p>

            {(search ||
              filter !== "all" ||
              statusFilter !== "all") && (
                <p className="text-xs text-gray-500">
                  Hasil setelah pencarian dan filter
                </p>
              )}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-sm text-gray-500"
            >
              Tampilkan:
            </label>

            <select
              id="page-size"
              value={pageSize}
              onChange={(event) =>
                handlePageSizeChange(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
            >
              {PAGE_SIZE_OPTIONS.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* =====================================================
            USER LIST
        ====================================================== */}
        {paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12">
            <EmptyState
              title="Tidak Ada Pengguna"
              message={
                search
                  ? "Tidak ada pengguna yang cocok dengan pencarian."
                  : "Tidak ada pengguna yang cocok dengan filter."
              }
            />
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft md:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="w-[42%] px-5 py-4 font-semibold">
                      Pengguna
                    </th>

                    <th className="w-[16%] px-4 py-4 font-semibold">
                      Peran
                    </th>

                    <th className="w-[15%] px-4 py-4 font-semibold">
                      Status
                    </th>

                    <th className="w-[15%] px-4 py-4 font-semibold">
                      Terdaftar
                    </th>

                    <th className="w-[12%] px-4 py-4 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map(
                    (user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-primary/[0.02]"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                              {user.fullName
                                ?.charAt(
                                  0,
                                )
                                ?.toUpperCase() ??
                                "?"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate font-semibold text-gray-900">
                                  {user.fullName}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditing(
                                      user,
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                                >
                                  <Pencil
                                    size={
                                      12
                                    }
                                  />
                                  Edit
                                </button>
                              </div>

                              <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-gray-500">
                                <Mail
                                  size={
                                    11
                                  }
                                  className="shrink-0"
                                />
                                <span className="truncate">
                                  {
                                    user.email
                                  }
                                </span>
                              </p>

                              <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-gray-400">
                                <Phone
                                  size={
                                    11
                                  }
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {
                                    user.noTelp
                                  }{" "}
                                  · @
                                  {
                                    user.username
                                  }
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-4 py-4 align-top">
                          <StatusBadge
                            status={
                              user.role
                            }
                            label={
                              ROLE_LABEL[
                              user
                                .role
                              ]
                            }
                          />

                          {user.businessType && (
                            <p className="mt-1.5 truncate text-xs text-gray-400">
                              {
                                BUSINESS_TYPE_LABEL[
                                user
                                  .businessType
                                ]
                                ??
                                user.businessType}
                            </p>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-4 align-top">
                          <StatusBadge
                            status={
                              user.status
                            }
                          />
                        </td>

                        {/* DATE */}
                        <td className="px-4 py-4 align-top whitespace-nowrap text-gray-500">
                          {formatDate(
                            user.createdAt,
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex justify-end gap-1">
                            {user.status ===
                              "pending" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStatus(
                                      user.id,
                                      "verified",
                                    )
                                  }
                                  title="Verifikasi"
                                  aria-label={`Verifikasi ${user.fullName} `}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success transition hover:bg-success hover:text-white"
                                >
                                  <BadgeCheck
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}

                            {user.status ===
                              "verified" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStatus(
                                      user.id,
                                      "suspended",
                                    )
                                  }
                                  title="Tangguhkan"
                                  aria-label={`Tangguhkan ${user.fullName} `}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger hover:text-white"
                                >
                                  <Ban
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}

                            {user.status ===
                              "suspended" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStatus(
                                      user.id,
                                      "verified",
                                    )
                                  }
                                  title="Pulihkan"
                                  aria-label={`Pulihkan ${user.fullName} `}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success transition hover:bg-success hover:text-white"
                                >
                                  <BadgeCheck
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                remove(
                                  user.id,
                                )
                              }
                              title="Hapus"
                              aria-label={`Hapus ${user.fullName} `}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-danger hover:text-white"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="space-y-3 md:hidden">
              {paginatedUsers.map(
                (user) => (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                        {user.fullName
                          ?.charAt(0)
                          ?.toUpperCase() ??
                          "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {user.fullName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {user.email}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {user.noTelp} · @
                              {user.username}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setEditing(
                                user,
                              )
                            }
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                          >
                            <Pencil
                              size={13}
                            />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={
                          user.role
                        }
                        label={
                          ROLE_LABEL[
                          user.role
                          ]
                        }
                      />

                      <StatusBadge
                        status={
                          user.status
                        }
                      />

                      {user.businessType && (
                        <span className="text-xs text-gray-400">
                          {
                            BUSINESS_TYPE_LABEL[
                            user
                              .businessType
                            ]
                            ??
                            user.businessType}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-400">
                        Terdaftar{" "}
                        {formatDate(
                          user.createdAt,
                        )}
                      </span>

                      <div className="flex gap-1">
                        {user.status ===
                          "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                setStatus(
                                  user.id,
                                  "verified",
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success transition hover:bg-success hover:text-white"
                            >
                              <BadgeCheck
                                size={
                                  13
                                }
                              />
                              Verifikasi
                            </button>
                          )}

                        {user.status ===
                          "verified" && (
                            <button
                              type="button"
                              onClick={() =>
                                setStatus(
                                  user.id,
                                  "suspended",
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger hover:text-white"
                            >
                              <Ban
                                size={
                                  13
                                }
                              />
                              Tangguhkan
                            </button>
                          )}

                        {user.status ===
                          "suspended" && (
                            <button
                              type="button"
                              onClick={() =>
                                setStatus(
                                  user.id,
                                  "verified",
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success transition hover:bg-success hover:text-white"
                            >
                              <BadgeCheck
                                size={
                                  13
                                }
                              />
                              Pulihkan
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            remove(
                              user.id,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-danger hover:text-white"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}
            <footer className="flex flex-col gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">
                  {formatCount(
                    showingFrom,
                  )}
                  –
                  {formatCount(
                    showingTo,
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900">
                  {formatCount(
                    totalUsers,
                  )}
                </span>{" "}
                pengguna
              </p>

              <nav
                aria-label="Paginasi pengguna"
                className="flex items-center gap-1"
              >
                {/* Previous */}
                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safePage - 1,
                    )
                  }
                  disabled={
                    safePage <= 1
                  }
                  aria-label="Halaman sebelumnya"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(
                    safePage,
                    totalPages,
                  ).map(
                    (
                      page,
                      index,
                    ) =>
                      page ===
                        "…" ? (
                        <span
                          key={`ellipsis - ${index} `}
                          className="inline-flex h-9 min-w-7 items-center justify-center px-1 text-sm text-gray-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() =>
                            goToPage(
                              page,
                            )
                          }
                          aria-current={
                            page ===
                              safePage
                              ? "page"
                              : undefined
                          }
                          className={`inline - flex h - 9 min - w - 9 items - center justify - center rounded - lg px - 2 text - sm font - medium transition ${page ===
                              safePage
                              ? "bg-primary text-white shadow-sm"
                              : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                            } `}
                        >
                          {page}
                        </button>
                      ),
                  )}
                </div>

                {/* Next */}
                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safePage + 1,
                    )
                  }
                  disabled={
                    safePage >=
                    totalPages
                  }
                  aria-label="Halaman berikutnya"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </nav>
            </footer>
          </>
        )}

        {/* =====================================================
            EDIT MODAL
        ====================================================== */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() =>
                setEditing(null)
              }
            />

            <div className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lift">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Edit Pengguna
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Perbarui informasi akun
                    pengguna.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditing(null)
                  }
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                action={formAction}
                className="space-y-4 p-5 sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Nama Lengkap
                    </label>

                    <input
                      name="fullName"
                      required
                      defaultValue={
                        editing.fullName
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Nama Pengguna
                    </label>

                    <input
                      name="username"
                      required
                      defaultValue={
                        editing.username
                      }
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Nomor Telepon
                  </label>

                  <input
                    name="noTelp"
                    required
                    defaultValue={
                      editing.noTelp
                    }
                    className={inputCls}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Peran
                    </label>

                    <select
                      name="role"
                      defaultValue={
                        editing.role
                      }
                      className={inputCls}
                    >
                      <option value="petani">
                        Petani
                      </option>

                      <option value="pembeli">
                        Pembeli
                      </option>

                      <option value="admin">
                        Admin
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Tipe Bisnis
                    </label>

                    <select
                      name="businessType"
                      defaultValue={
                        editing.businessType ??
                        ""
                      }
                      className={inputCls}
                    >
                      <option value="">
                        -
                      </option>

                      <option value="distributor">
                        Distributor
                      </option>

                      <option value="umkm">
                        UMKM
                      </option>

                      <option value="restoran">
                        Restoran
                      </option>

                      <option value="koperasi">
                        Koperasi
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Status
                    </label>

                    <select
                      name="status"
                      defaultValue={
                        editing.status
                      }
                      className={inputCls}
                    >
                      <option value="pending">
                        Menunggu
                      </option>

                      <option value="verified">
                        Terverifikasi
                      </option>

                      <option value="suspended">
                        Ditangguhkan
                      </option>
                    </select>
                  </div>
                </div>

                {state && (
                  <p
                    className={`text - sm ${state.success
                        ? "text-success"
                        : "text-danger"
                      } `}
                  >
                    {state.message}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing(null)
                    }
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

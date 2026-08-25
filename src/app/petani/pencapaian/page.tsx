"use client";

import { Lock, Sparkles, Trophy } from "lucide-react";
import { getFarmerAchievements } from "@/actions/achievement";
import type { AchievementRow } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";

/* ---------------------- SKELETON ---------------------- */
function AchievementSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-20 rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[148px] rounded-card" />
        ))}
      </div>
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function PencapaianPage() {
  const user = getClientUser();

  const {
    data: achievements,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user
      ? getFarmerAchievements(user.id)
      : Promise.resolve([] as AchievementRow[]),
    [user?.id],
  );

  if (loading) return <AchievementSkeleton />;

  const unlocked = (achievements ?? []).filter((a) => a.unlocked).length;
  const total = (achievements ?? []).length;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={Trophy}
        title="Pencapaian"
        subtitle="Lihat perkembangan dan pencapaian Anda sebagai petani."
      />

      {/* Ringkasan */}
      <section className="mb-6 flex items-center justify-between rounded-card border border-gray-200/80 bg-white px-5 py-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={19} strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {unlocked} dari {total} pencapaian terbuka
            </p>
            <p className="text-xs text-gray-500">
              Semua pencapaian dihitung otomatis dari aktivitas akun Anda.
            </p>
          </div>
        </div>
        <span
          aria-hidden
          className="hidden text-2xl font-black text-primary sm:block"
        >
          {total > 0 ? Math.round((unlocked / total) * 100) : 0}%
        </span>
      </section>

      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(achievements ?? []).map((a, i) => (
            <article
              key={a.id}
              aria-label={`${a.title} — ${a.unlocked ? "tercapai" : "belum tercapai"}`}
              className={`flex flex-col rounded-card border p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 ${
                a.unlocked
                  ? "border-primary/25 bg-white"
                  : "border-gray-200/80 bg-gray-50/60"
              }`}
              style={{
                animationDelay: `${Math.min(i * 50, 250)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    a.unlocked
                      ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-soft"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {a.unlocked ? <Trophy size={20} /> : <Lock size={18} />}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    a.unlocked
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {a.unlocked ? "Tercapai" : "Terkunci"}
                </span>
              </div>

              <h2
                className={`mt-3 text-[15px] font-bold ${
                  a.unlocked ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {a.title}
              </h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500">
                {a.description}
              </p>
              <p className="mt-3 border-t border-gray-100 pt-2 text-[11px] font-medium text-gray-400">
                {a.progressLabel}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

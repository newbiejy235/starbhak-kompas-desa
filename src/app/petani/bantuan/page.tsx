"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LifeBuoy,
  MessageSquareWarning,
  Search,
} from "lucide-react";
import { getHelpFaqs } from "@/actions/help";
import type { FaqItem } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/States";
import { FARMER_HELP_CATEGORIES } from "@/constants/bantuan";
import { Skeleton } from "@/components/ui/Skeleton";

/* ---------------------- SKELETON ---------------------- */
function HelpSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
      </div>
      <Skeleton className="h-14 rounded-card" />
      <Skeleton className="h-16 rounded-card" />
      <Skeleton className="h-16 rounded-card" />
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function BantuanPage() {
  const user = getClientUser();

  const { data: faqs, loading, error, reload } = useFetch(
    () => (user ? getHelpFaqs() : Promise.resolve([] as FaqItem[])),
    [user?.id],
  );

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = faqs ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  if (loading) return <HelpSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={LifeBuoy}
        title="Pusat Bantuan"
        subtitle="Butuh bantuan? Temukan jawaban atau hubungi tim kami."
      />

      {/* Kategori bantuan */}
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        {FARMER_HELP_CATEGORIES.map((cat) => (
          <article
            key={cat.id}
            className="flex items-start gap-3 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <cat.icon size={18} strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">{cat.title}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {cat.description}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Aksi langsung */}
      <section className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/petani/chat"
          className="flex flex-1 items-center gap-3 rounded-card border border-primary/25 bg-primary/5 px-4 py-3.5 transition-all duration-150 ease-smooth hover:bg-primary/10"
        >
          <LifeBuoy size={18} className="shrink-0 text-primary" />
          <span>
            <span className="block text-sm font-bold text-primary">
              Hubungi Admin
            </span>
            <span className="block text-xs text-gray-500">
              Diskusi langsung melalui pesan dengan tim kami.
            </span>
          </span>
        </Link>
        <Link
          href="/petani/chat"
          className="flex flex-1 items-center gap-3 rounded-card border border-gray-200/80 bg-white px-4 py-3.5 shadow-soft transition-all duration-150 ease-smooth hover:-translate-y-0.5 hover:shadow-lift"
        >
          <MessageSquareWarning
            size={18}
            className="shrink-0 text-warning"
          />
          <span>
            <span className="block text-sm font-bold text-gray-900">
              Laporkan Masalah
            </span>
            <span className="block text-xs text-gray-500">
              Laporkan bug atau perilaku mencurigakan di platform.
            </span>
          </span>
        </Link>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Pertanyaan Umum
        </h2>

        <div className="mb-3 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pertanyaan... (cth. pembayaran)"
              aria-label="Cari pertanyaan umum"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {error ? (
          <ErrorState onRetry={() => reload()} />
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-gray-200 bg-white py-12 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {query.trim()
                ? "Tidak ada pertanyaan yang cocok"
                : "Belum ada pertanyaan umum"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Hubungi admin melalui tombol di atas untuk bantuan lebih lanjut.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((faq) => {
              const open = openId === faq.id;
              const panelId = `faq-panel-${faq.id}`;
              return (
                <article
                  key={faq.id}
                  className="overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : faq.id)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ease-smooth ${open ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  <div
                    id={panelId}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-gray-100 px-4 py-3 text-xs leading-relaxed text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

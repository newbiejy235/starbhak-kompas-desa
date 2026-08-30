"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { FARMER_GUIDES } from "@/constants/panduan";

/* ---------------------- PAGE ---------------------- */
export default function PanduanPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(
    FARMER_GUIDES[0]?.id ?? null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FARMER_GUIDES;
    return FARMER_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.steps.some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <PageHeader
        icon={BookOpen}
        title="Panduan"
        subtitle="Pelajari cara memaksimalkan toko pertanian Anda."
      />

      {/* Pencarian */}
      <section className="mb-5 border-b border-gray-200 pb-4">
        <div className="relative max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari panduan... (cth. stok, pesanan)"
            aria-label="Cari panduan"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Daftar panduan */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Panduan tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Coba kata kunci lain, misalnya &quot;komoditas&quot; atau
            &quot;pengiriman&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((g) => {
            const open = openId === g.id;
            const panelId = `guide-panel-${g.id}`;
            return (
              <article
                key={g.id}
                className="overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : g.id)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${
                      open
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <BookOpen size={17} strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-gray-900">
                      {g.title}
                    </span>
                    {!open && (
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {g.summary}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    size={17}
                    aria-hidden
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ease-smooth ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={panelId}
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-5">
                      <p className="text-sm leading-relaxed text-gray-600">
                        {g.summary}
                      </p>
                      <ol className="mt-3 space-y-2">
                        {g.steps.map((step, idx) => (
                          <li
                            key={`${g.id}-${idx}`}
                            className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                              {idx + 1}
                            </span>
                            <span className="text-xs leading-relaxed text-gray-700">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

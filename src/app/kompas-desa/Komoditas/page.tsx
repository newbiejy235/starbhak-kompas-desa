"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Leaf,
  Package,
} from "lucide-react";

const commodities = [
  // ===== SAYURAN =====
  {
    id: 1,
    name: "Cabai Merah",
    category: "Sayuran",
    price: "Rp32.000",
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Cabai Rawit",
    category: "Sayuran",
    price: "Rp45.000",
    image:
      "https://images.unsplash.com/photo-1583119912267-cc97ff232e18?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Tomat Segar",
    category: "Sayuran",
    price: "Rp14.000",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    name: "Wortel",
    category: "Sayuran",
    price: "Rp12.000",
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Kentang",
    category: "Sayuran",
    price: "Rp16.000",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    name: "Bawang Merah",
    category: "Sayuran",
    price: "Rp28.000",
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    name: "Bawang Putih",
    category: "Sayuran",
    price: "Rp35.000",
    image:
      "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 8,
    name: "Kubis",
    category: "Sayuran",
    price: "Rp8.000",
    image:
      "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 9,
    name: "Buncis",
    category: "Sayuran",
    price: "Rp15.000",
    image:
      "https://images.unsplash.com/photo-1642087050599-3968180a5834?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Terong",
    category: "Sayuran",
    price: "Rp9.000",
    image:
      "https://images.unsplash.com/photo-1602166242292-eb37eb5d3c34?w=800&auto=format&fit=crop&q=80",
  },

  // ===== BUAH =====
  {
    id: 11,
    name: "Pisang Cavendish",
    category: "Buah",
    price: "Rp18.000",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 12,
    name: "Jeruk Manis",
    category: "Buah",
    price: "Rp20.000",
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 13,
    name: "Mangga Harum Manis",
    category: "Buah",
    price: "Rp25.000",
    image:
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 14,
    name: "Apel Malang",
    category: "Buah",
    price: "Rp22.000",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 15,
    name: "Semangka",
    category: "Buah",
    price: "Rp8.000",
    image:
      "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 16,
    name: "Melon",
    category: "Buah",
    price: "Rp12.000",
    image:
      "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 17,
    name: "Alpukat",
    category: "Buah",
    price: "Rp30.000",
    image:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 18,
    name: "Nanas",
    category: "Buah",
    price: "Rp10.000",
    image:
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 19,
    name: "Pepaya",
    category: "Buah",
    price: "Rp7.000",
    image:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 20,
    name: "Durian",
    category: "Buah",
    price: "Rp45.000",
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&auto=format&fit=crop&q=80",
  },

  // ===== PADI & SEREALIA =====
  {
    id: 21,
    name: "Beras Premium",
    category: "Padi & Serealia",
    price: "Rp15.500",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 22,
    name: "Beras Merah",
    category: "Padi & Serealia",
    price: "Rp18.000",
    image:
      "https://images.unsplash.com/photo-1595855709940-2f52d2691c6b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 23,
    name: "Jagung Manis",
    category: "Padi & Serealia",
    price: "Rp9.500",
    image:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 24,
    name: "Kedelai",
    category: "Padi & Serealia",
    price: "Rp12.500",
    image:
      "https://images.unsplash.com/photo-1610725664285-7c57e6eea3f3?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 25,
    name: "Ketan Putih",
    category: "Padi & Serealia",
    price: "Rp16.000",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
  },

  // ===== PERKEBUNAN =====
  {
    id: 26,
    name: "Kopi Arabika",
    category: "Perkebunan",
    price: "Rp95.000",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 27,
    name: "Kakao",
    category: "Perkebunan",
    price: "Rp55.000",
    image:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 28,
    name: "Kelapa Sawit",
    category: "Perkebunan",
    price: "Rp3.200",
    image:
      "https://images.unsplash.com/photo-1595169461149-59c7f4d5aa9f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 29,
    name: "Karet",
    category: "Perkebunan",
    price: "Rp11.000",
    image:
      "https://images.unsplash.com/photo-1587049633312-4b1b1b1b1b1b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 30,
    name: "Teh",
    category: "Perkebunan",
    price: "Rp40.000",
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
  },
];

const categories = [
  "Semua",
  "Sayuran",
  "Buah",
  "Padi & Serealia",
  "Perkebunan",
];

export default function KomoditasPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filteredCommodities = useMemo(() => {
    return commodities.filter((item) => {
      const matchCategory =
        activeCategory === "Semua" ||
        item.category === activeCategory;

      const matchSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <main className="min-h-screen bg-[#fafdfc] text-[#1f1f1f]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#025246]">
              <Leaf className="h-4 w-4 text-white" />
            </div>

            <span className="text-lg font-bold tracking-tight text-[#025246]">
              Kompas Desa
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#025246] transition hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E4F1EB]/70 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#E4F1EB]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E4F1EB] px-3 py-1.5 text-xs font-semibold text-[#025246]">
              <Leaf className="h-3.5 w-3.5" />
              Komoditas Lokal
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Temukan{" "}
              <span className="text-[#025246]">
                Komoditas
              </span>{" "}
              Terbaik
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#75938f] sm:text-base">
              Temukan hasil panen segar dari petani dan mitra
              terpercaya di berbagai daerah Indonesia.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#75938f]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari komoditas..."
                className="h-14 w-full rounded-2xl border border-black/10 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10"
              />
            </div>

            <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#025246] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#013e35] hover:shadow-md">
              <Search className="h-4 w-4" />
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        {/* CATEGORY */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">
              Pilih Kategori
            </h2>

            <p className="mt-1 text-xs text-[#75938f]">
              Temukan komoditas sesuai kebutuhanmu.
            </p>
          </div>

          <button className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#025246] transition hover:border-[#025246]/30 sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold transition ${activeCategory === category
                ? "bg-[#025246] text-white shadow-sm"
                : "border border-black/10 bg-white text-[#75938f] hover:border-[#025246]/30 hover:text-[#025246]"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* RESULT HEADER */}
        <div className="mt-12 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Komoditas Tersedia
            </h2>

            <p className="mt-1 text-xs text-[#75938f]">
              {filteredCommodities.length} komoditas ditemukan
            </p>
          </div>

          <button className="hidden items-center gap-1 text-xs font-semibold text-[#025246] sm:flex">
            Terbaru
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* CARDS */}
        {filteredCommodities.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCommodities.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#025246] backdrop-blur">
                    {item.category}
                  </div>
                </div>

                {/* BODY */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold">
                      {item.name}
                    </h3>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4F1EB]">
                      <Package className="h-4 w-4 text-[#025246]" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-black/5 pt-4">
                    <div>
                      <p className="text-[10px] text-[#75938f]">
                        Mulai dari
                      </p>

                      <p className="mt-0.5 text-base font-bold text-[#025246]">
                        {item.price}
                        <span className="text-xs font-medium text-[#75938f]">
                          {" "}
                          / kg
                        </span>
                      </p>
                    </div>
                  </div>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#025246]/20 py-2.5 text-xs font-bold text-[#025246] transition hover:bg-[#025246] hover:text-white">
                    Lihat Detail
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-black/10 bg-white py-20 text-center">
            <Search className="mx-auto h-8 w-8 text-[#75938f]" />

            <h3 className="mt-4 text-lg font-bold">
              Komoditas tidak ditemukan
            </h3>

            <p className="mt-1 text-sm text-[#75938f]">
              Coba gunakan kata kunci lain.
            </p>
          </div>
        )}
      </section>

      {/* DEMAND CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#025246] px-6 py-12 text-center sm:px-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Butuh Komoditas Tertentu?
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Temukan mitra yang sesuai dengan kebutuhanmu.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              Sampaikan kebutuhan komoditas dan temukan peluang
              kerja sama dengan petani serta mitra distribusi.
            </p>

            <button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#025246] transition hover:bg-emerald-50">
              Cari Mitra
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

type Guide = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
};

// Panduan mengikuti alur fitur yang benar-benar ada di aplikasi:
// keranjang/checkout, metode pembayaran, status pesanan,
// negosiasi via chat, ulasan, dan peningkatan akun menjadi petani.
const GUIDES: Guide[] = [
  {
    id: "pesan-komoditas",
    title: "Cara Memesan Komoditas",
    summary:
      "Pesan hasil pertanian langsung dari petani dalam beberapa langkah.",
    steps: [
      "Temukan produk melalui Beranda atau kolom pencarian di atas.",
      "Buka halaman produk, periksa harga, stok, dan deskripsi.",
      "Atur jumlah pesanan lalu tambahkan ke keranjang.",
      "Pada halaman checkout, pilih metode penerimaan: ambil sendiri atau kirim ekspedisi.",
      "Periksa ringkasan pesanan, lalu buat pesanan Anda.",
    ],
  },
  {
    id: "pembayaran",
    title: "Cara Melakukan Pembayaran",
    summary:
      "Selesaikan pembayaran agar pesanan segera diproses oleh petani.",
    steps: [
      "Buat pesanan dan pilih salah satu metode pembayaran: Transfer Bank, Virtual Account, E-Wallet, QRIS, atau Bayar di Tempat.",
      "Ikuti instruksi pembayaran pada halaman checkout pesanan.",
      "Pesanan akan berstatus Lunas setelah pembayaran terverifikasi.",
      "Hubungi admin melalui Bantuan apabila pembayaran belum terkonfirmasi.",
    ],
  },
  {
    id: "status-pesanan",
    title: "Memahami Status Pesanan",
    summary:
      "Arti setiap status agar Anda tahu progres pesanan tanpa menebak.",
    steps: [
      "Menunggu Konfirmasi: pesanan dibuat, menunggu pembayaran atau respons petani.",
      "Dikonfirmasi / Diproses: petani menyiapkan pesanan Anda.",
      "Dikirim: pesanan sedang dalam perjalanan atau siap diambil.",
      "Selesai: pesanan diterima dengan baik. Terima kasih!",
      "Dibatalkan: pesanan tidak jadi diproses.",
    ],
  },
  {
    id: "negosiasi-harga",
    title: "Cara Negosiasi Harga",
    summary:
      "Sepakati harga dan jumlah langsung dengan petani melalui pesan.",
    steps: [
      "Buka halaman produk atau menu Pesan untuk menghubungi petani.",
      "Kirim penawaran berisi harga dan jumlah yang Anda inginkan.",
      "Petani dapat menerima, menolak, atau memberi penawaran balik.",
      "Jika disetujui, lanjutkan pemesanan sesuai kesepakatan.",
    ],
  },
  {
    id: "memberi-ulasan",
    title: "Cara Memberi Ulasan",
    summary:
      "Ulasan Anda membantu petani lain berkembang dan pembeli lain yakin.",
    steps: [
      "Selesaikan pesanan hingga berstatus Selesai.",
      "Buka halaman pesanan dari menu Pesanan Saya.",
      "Beri rating bintang dan tulis ulasan jujur tentang produk.",
      "Ulasan Anda tampil di halaman produk dan menu Ulasan Saya.",
    ],
  },
  {
    id: "jadi-petani",
    title: "Cara Menjadi Petani",
    summary:
      "Punya hasil panen sendiri? Jual langsung di KompasDesa secara gratis.",
    steps: [
      "Klik foto akun Anda di pojok kanan atas.",
      "Pilih menu Daftar Jadi Petani.",
      "Isi alamat lahan atau lokasi usaha tani Anda.",
      "Akun otomatis berubah menjadi Petani dan Anda bisa mulai menambahkan komoditas.",
    ],
  },
];

/* ---------------------- PAGE ---------------------- */
export default function PanduanPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(GUIDES[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUIDES;
    return GUIDES.filter(
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
        subtitle="Pelajari cara berbelanja dan bertransaksi di KompasDesa."
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
            placeholder="Cari panduan... (cth. bayar, ulasan)"
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
            Coba kata kunci lain, misalnya &quot;pesanan&quot; atau
            &quot;pembayaran&quot;.
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
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-gray-50 sm:px-5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${
                      open ? "bg-primary text-white" : "bg-primary/10 text-primary"
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

"use client"

import { useState } from "react"
import Image from "next/image"

export default function CardBenefit() {
  const [activeTab, setActiveTab] = useState<"petani" | "pembeli">("petani")

  const benefitsPetani = [
    {
      number: "01",
      title: "Akses Pasar Lebih Luas",
      description: "Jangkau mitra pembeli dari berbagai wilayah untuk memperluas peluang penjualan hasil panen.",
      image: "/images/landingpage/benefit/Statistik.svg",
    },
    {
      number: "02",
      title: "Peluang Penjualan Meningkat",
      description: "Proses distribusi hasil panen menjadi lebih cepat, terorganisir, dan mudah dipantau.",
      image: "/images/landingpage/benefit/Distribusi.svg",
    },
    {
      number: "03",
      title: "Kelola Produk dengan Mudah",
      description: "Bertransaksi dengan jaringan mitra pembeli terverifikasi untuk meningkatkan kepercayaan.",
      image: "/images/landingpage/benefit/Verify.svg",
    },
    {
      number: "04",
      title: "Tingkatkan Pendapatan",
      description: "Pantau aktivitas penjualan dan distribusi melalui laporan yang tersusun secara rapi.",
      image: "/images/landingpage/benefit/TingkatPendapatan.svg",
    },
  ]

  const benefitsPembeli = [
    {
      number: "01",
      title: "Temukan Produk Berkualitas",
      description: "Dapatkan hasil panen segar langsung dari petani terpercaya.",
      image: "/images/landingpage/benefit/ProdukBerkualitas.svg",
    },
    {
      number: "02",
      title: "Pencarian Lebih Mudah",
      description: "Cari produk berdasarkan kategori, lokasi, atau kebutuhan dengan cepat.",
      image: "/images/landingpage/benefit/Pencarian.svg",
    },
    {
      number: "03",
      title: "Pemesanan Praktis",
      description: "Lakukan pemesanan hasil panen dengan proses yang mudah dan efisien.",
      image: "/images/landingpage/benefit/Pemesanan.svg",
    },
    {
      number: "04",
      title: "Terhubung Langsung dengan Petani",
      description: "Temukan hasil panen langsung dari petani dalam satu platform yang mudah dan terpercaya.",
      image: "/images/landingpage/benefit/Relasi.svg",
    },
  ]

  const activeBenefits = activeTab === "petani" ? benefitsPetani : benefitsPembeli

  return (
    <section className="w-full bg-[#f8faf9] py-20 px-4 sm:px-6 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1a1a]">
          Keuntungan <span className="text-[#025246]">Bergabung</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-500">
          Nikmati berbagai kemudahan dan nilai tambah yang dirancang khusus untuk mengoptimalkan potensi Anda.
        </p>
      </div>

      {/* Minimalist 2D Tab Switcher */}
      <div className="inline-flex bg-slate-200/60 p-1 rounded-xl mb-12 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("petani")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors duration-150 ${activeTab === "petani"
            ? "bg-[#025246] text-white"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          Petani
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pembeli")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors duration-150 ${activeTab === "pembeli"
            ? "bg-[#025246] text-white"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          Pembeli
        </button>
      </div>

      {/* Grid Utama (Ditambahkan items-stretch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[880px] w-full items-stretch">
        {activeBenefits.map((benefit) => (
          <div
            key={`${activeTab}-${benefit.number}`}
            className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#025246]/40 transition-colors duration-200 flex flex-col justify-between h-full"
          >
            {/* Bagian Atas: Icon & Nomor Badge */}
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#eaf4f0] flex items-center justify-center p-2.5 shrink-0">
                <Image
                  src={benefit.image}
                  alt={benefit.title}
                  width={33}
                  height={33}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-bold text-[#025246] bg-[#eaf4f0] px-3 py-1.5 rounded-md">
                {benefit.number}
              </span>
            </div>

            {/* Bagian Bawah: Judul & Teks */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mb-1.5">
                {benefit.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
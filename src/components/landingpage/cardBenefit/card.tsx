"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CardBenefit() {
  const [activeTab, setActiveTab] = useState("petani")

  const benefitsPetani = [
    {
      number: "01",
      title: "Akses Pasar Lebih Luas",
      description: "Jangkau lebih banyak mitra pembeli dari berbagai wilayah untuk memperluas peluang penjualan hasil panen.",
      image: "/images/landingpage/benefit/Statistik.svg"
    },
    {
      number: "02",
      title: "Peluang Penjualan Meningkat",
      description: "Proses distribusi hasil panen menjadi lebih cepat, terorganisir, dan mudah dipantau.",
      image: "/images/landingpage/benefit/Distribusi.svg"
    },
    {
      number: "03",
      title: "Kelola Produk dengan Mudah",
      description: "Bertransaksi dengan jaringan mitra pembeli yang telah melalui proses verifikasi untuk meningkatkan kepercayaan.",
      image: "/images/landingpage/benefit/Verify.svg"
    },
    {
      number: "04",
      title: "Tingkatkan Pendapatan",
      description: "Pantau aktivitas penjualan dan distribusi hasil panen melalui laporan yang tersusun secara rapi.",
      image: "/images/landingpage/benefit/TingkatPendapatan.svg"
    }
  ]

  const benefitsPembeli = [
    {
      number: "01",
      title: "Temukan Produk Berkualitas",
      description: "Dapatkan hasil panen segar langsung dari petani terpercaya.",
      image: "/images/landingpage/benefit/ProdukBerkualitas.svg"
    },
    {
      number: "02",
      title: "Pencarian Lebih Mudah",
      description: "Cari produk berdasarkan kategori, lokasi, atau kebutuhan dengan cepat.",
      image: "/images/landingpage/benefit/Pencarian.svg"
    },
    {
      number: "03",
      title: "Pemesanan Praktis",
      description: "Lakukan pemesanan hasil panen dengan proses yang mudah dan efisien.",
      image: "/images/landingpage/benefit/Pemesanan.svg"
    },
    {
      number: "04",
      title: "Terhubung Langsung dengan Petani",
      description: "Temukan hasil panen langsung dari petani dalam satu platform yang mudah dan terpercaya.",
      image: "/images/landingpage/benefit/Relasi.svg"
    }
  ]

  const activeBenefits = activeTab === "petani" ? benefitsPetani : benefitsPembeli

  return (
    <section className="bg-white min-h-screen py-16 px-5 flex flex-col items-center font-sans overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-[32px] font-bold text-[#111111] mb-3">
          Keuntungan yang Akan <span className="text-[#025246]">Anda Peroleh</span>
        </h2>
        <p className="text-[#9E9E9E] text-sm">
          Nikmati kemudahan distribusi hasil panen dalam satu platform yang terintegrasi.
        </p>
      </div>

      <div className="flex items-center bg-gray-100 p-1 rounded-full mb-12 border border-gray-200">
        <button
          onClick={() => setActiveTab("petani")}
          className="relative px-6 py-2 rounded-full text-sm font-semibold"
        >
          {activeTab === "petani" && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-[#025246] rounded-full shadow-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === "petani" ? "text-white" : "text-gray-500 hover:text-gray-700"}`}>
            Petani
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pembeli")}
          className="relative px-6 py-2 rounded-full text-sm font-semibold"
        >
          {activeTab === "pembeli" && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-[#025246] rounded-full shadow-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === "pembeli" ? "text-white" : "text-gray-500 hover:text-gray-700"}`}>
            Pembeli
          </span>
        </button>
      </div>

      <div className="max-w-[920px] w-full min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            {activeBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 relative shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between min-h-[180px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="w-15 h-15 rounded-full bg-[#EBF3ED] flex items-center justify-center overflow-hidden p-2.5">
                    <img
                      src={benefit.image}
                      alt={benefit.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="bg-[#EBF3ED] text-[#025246] px-[14px] py-[6px] rounded-lg font-bold text-sm">
                    {benefit.number}
                  </div>
                </div>

                <div>
                  <h3 className="text-[18px] font-bold text-[#111111] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-[13px] text-[#666666] leading-relaxed m-0">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
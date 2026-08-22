'use client'

import { Check, Sprout, Store } from 'lucide-react'

export default function CardMembership() {
  const membershipPlans = [
    {
      title: "Petani",
      icon: Sprout,
      subtitle: "Tanpa Biaya",
      price: "Pendaftaran",
      period: "",
      isPopular: false,
      href: "/auth/register/petani",
      buttonText: "Daftar Sekarang",
      benefits: [
        "Membuat Profil",
        "Mengelola Data Lahan & Tanaman",
        "Menambahkan Produk Hasil Panen",
        "Menerima & Mengelola Pesanan",
        "Monitoring Penjualan",
        "Notifikasi Informasi Terbaru"
      ]
    },
    {
      title: "Pelanggan",
      icon: Store,
      subtitle: "Diskon 10%",
      price: "Pembelian sebanyak 3x",
      period: "",
      isPopular: true,
      href: "/auth/register/user",
      buttonText: "Daftar Sekarang",
      benefits: [
        "Mencari & Memfilter Komoditas",
        "Melihat Detail Produk Pertanian",
        "Menemukan Petani Terpercaya",
        "Melakukan Pemesanan Produk",
        "Melacak Status Pesanan",
        "Menyimpan Produk Pilihan",
        "Notifikasi Pesanan"
      ]
    }
  ];

  return (
    <section className="w-full bg-[#fafdfc] py-20 lg:py-28 px-4 sm:px-6 flex flex-col items-center overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-[#1f1f1f] sm:text-3xl md:text-4xl">
          Daftar <span className="text-[#025246]">Sekarang</span>
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Jadilah bagian dari ekosistem pertanian digital yang menghubungkan petani dan pembeli dalam satu platform.
        </p>
      </div>

      {/* Cards Container - Ditambahkan flex untuk memastikan item pembungkus seimbang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-[900px] w-full items-stretch justify-center">
        {membershipPlans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <div key={index} className="flex flex-col h-full">
              <div
                className={`group relative flex flex-col h-full rounded-[2rem] p-8 sm:p-10 transition-all duration-300 ${plan.isPopular
                  ? "border border-slate-200 bg-white shadow-2xl shadow-[#025246]/10 md:scale-105 z-10"
                  : "border border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                  }`}
              >
                {/* Card Header (Icon & Title) */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EB] text-[#025246] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1f1f1f]">
                    {plan.title}
                  </h3>
                </div>

                {/* Price / Subtitle */}
                <div className="mb-6">
                  <div className="text-[28px] sm:text-[32px] font-extrabold text-[#025246] tracking-tight leading-none">
                    {plan.subtitle}
                  </div>
                  <div className="text-sm sm:text-base text-[#75938f] font-medium mt-2">
                    {plan.price}
                  </div>
                </div>

                <hr className="border-slate-100 mb-8" />

                {/* Benefits List */}
                <ul className="mb-10 flex-1 space-y-4">
                  {plan.benefits.map((benefit, bIndex) => (
                    <li key={bIndex} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4F1EB] text-[#025246]">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-[15px] text-[#4a5f5c] leading-snug">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <a
                  href={plan.href}
                  className="mt-auto inline-flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm sm:text-[15px] font-bold bg-[#025246] text-white hover:bg-[#013e35] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {plan.buttonText}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
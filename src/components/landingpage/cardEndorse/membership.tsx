export default function CardMembership() {
  const membershipPlans = [
    {
      title: "Petani",
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
      subtitle: "Diskon 30%",
      price: "Pembelian selama 2 bulan",
      period: "",
      isPopular: true, 
      href: "/auth/register",
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
    <section className="bg-white w-full py-12 lg:py-20 px-4 sm:px-6 flex flex-col items-center font-sans overflow-hidden">
      <div className="text-center mb-10 lg:mb-14">
        <h2 className="text-2xl sm:text-[32px] font-bold text-[#111111] mb-2 sm:mb-3">
          Daftar <span className="text-[#025246]">Sekarang</span>
        </h2>
        <p className="text-[#9E9E9E] text-[13px] sm:text-sm max-w-xl mx-auto px-2">
          Jadilah bagian dari ekosistem pertanian digital yang menghubungkan petani dan pembeli dalam satu platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-[900px] w-full items-center justify-center">
        {membershipPlans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl p-6 sm:p-8 relative flex flex-col h-full justify-between transition-all duration-300 ${
              plan.isPopular
                ? "border-2 border-[#025246] shadow-[0_10px_30px_rgba(2,82,70,0.15)] md:scale-105 z-10 mt-4 md:mt-0"
                : "border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-6 sm:right-8 -translate-y-1/2 bg-[#025246] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Paling Populer
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EBF3ED] flex-shrink-0" />
                <div>
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-[#111111]">
                    {plan.title}
                  </h3>
                </div>
              </div>
              
              <div className="text-center mb-5 sm:mb-6">
                <div className="text-[22px] sm:text-[26px] font-extrabold text-[#025246]">
                  {plan.subtitle}
                </div>
                <div className="text-[13px] sm:text-[14px] text-[#555555] font-medium mt-1">
                  {plan.price}
                </div>
              </div>

              <hr className="border-gray-100 mb-5 sm:mb-6" />

              <ul className="space-y-3 sm:space-y-4 mb-8">
                {plan.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-start gap-3 text-[13px] sm:text-[14px] text-[#444444]">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-[#025246] font-bold">
                      ✓
                    </div>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a 
              href={plan.href}
              className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-semibold text-[13px] sm:text-sm transition-all duration-200 text-center block mt-auto ${
                plan.isPopular
                  ? "bg-[#025246] text-white hover:bg-[#024036] shadow-md shadow-[#025246]/20"
                  : "border border-[#025246] text-[#025246] hover:bg-[#EBF3ED]"
              }`}
            >
              {plan.buttonText}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
export default function CardMembership() {
  const membershipPlans = [
    {
      title: "Petani",
      subtitle: "Tanpa Biaya",
      price: "Pendaftaran",
      period: "",
      isPopular: false,
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
    <section className="bg-white min-h-screen py-15 px-5 flex flex-col items-center font-sans">
      <div className="text-center mb-12">
        <h2 className="text-[32px] font-bold text-[#111111] mb-3">
          Daftar <span className="text-[#025246]">Sekarang</span>
        </h2>
        <p className="text-[#9E9E9E] text-sm max-w-xl mx-auto">
          Jadilah bagian dari ekosistem pertanian digital yang menghubungkan petani dan pembeli dalam satu platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[900px] w-full items-stretch justify-center">
        {membershipPlans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl p-8 relative flex flex-col justify-between transition-all duration-300 ${
              plan.isPopular
                ? "border-2 border-[#025246] shadow-[0_10px_30px_rgba(2,82,70,0.15)] scale-105 z-10"
                : "border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
            }`}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex-shrink-0" />
                <div>
                  <h3 className="text-[22px] font-bold text-[#111111]">
                    {plan.title}
                  </h3>
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="text-[26px] font-extrabold text-[#025246]">
                  {plan.subtitle}
                </div>
                <div className="text-[14px] text-[#555555] font-medium mt-1">
                  {plan.price}
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              <ul className="space-y-4 mb-8">
                {plan.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-start gap-3 text-[14px] text-[#444444]">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-green-600 font-bold">
                      ✓
                    </div>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a href="/auth/register"
              className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all duration-200 text-center block ${
                plan.isPopular
                  ? "bg-[#025246] text-white hover:bg-[#024036] shadow-md shadow-[#025246]/20"
                  : "border border-[#025246] text-[#025246] hover:bg-[#EBF3ED]"
              }`}
            >
              Gratis / Daftar Sekarang
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
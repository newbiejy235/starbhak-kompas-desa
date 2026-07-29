export default function CardMembership() {
  const membershipPlans = [
    {
      title: "Paket 1",
      subtitle: "Petani pemula",
      price: "Rp499.000",
      period: "/ 3 Kali Distribusi",
      isPopular: false,
      benefits: [
        "Maks. 100 Kg Setiap Distribusi",
        "Akses ke Jaringan Mitra Pembeli",
        "Estimasi Pengiriman Reguler",
        "Penjadwalan Distribusi",
        "Notifikasi Jadwal"
      ]
    },
    {
      title: "Paket 2",
      subtitle: "Petani profesional",
      price: "Rp1.299.000",
      period: "/ 5 Kali Distribusi",
      isPopular: true, // Untuk menandai paket unggulan/populer
      benefits: [
        "Maks. 300 Kg Setiap Distribusi",
        "Prioritas Akses Mitra Pembeli",
        "Estimasi Pengiriman Lebih Cepat",
        "Penjadwalan Distribusi",
        "Notifikasi Jadwal",
        "Prioritas Jadwal Distribusi",
        "Konsultasi Pertanian"
      ]
    },
    {
      title: "Paket 3",
      subtitle: "Kemitraan",
      price: "Rp3.899.000+",
      period: "/ 9+ Kali Distribusi",
      isPopular: false,
      benefits: [
        "Distribusi Sesuai Kebutuhan",
        "Akses ke Seluruh Mitra Pembeli",
        "Prioritas Utama Distribusi",
        "Penjadwalan Distribusi",
        "Notifikasi Jadwal",
        "Prioritas Jadwal Distribusi",
        "Konsultasi Pertanian",
        "Pendampingan Implementasi Sistem"
      ]
    }
  ];

  return (
    <section className="bg-white min-h-screen py-[60px] px-5 flex flex-col items-center font-sans">
      <div className="text-center mb-12">
        <h2 className="text-[32px] font-bold text-[#111111] mb-3">
          Layanan Distribusi <span className="text-[#0B4F3A]">Hasil Pertanian</span>
        </h2>
        <p className="text-[#9E9E9E] text-sm max-w-xl mx-auto">
          Pilih layanan yang sesuai dengan kebutuhan Anda untuk mendukung distribusi hasil panen secara lebih mudah, efisien, dan terpercaya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1140px] w-full items-stretch">
        {membershipPlans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl p-8 relative flex flex-col justify-between transition-all duration-300 ${
              plan.isPopular
                ? "border-2 border-[#0B4F3A] shadow-[0_10px_30px_rgba(11,79,58,0.15)] scale-105 z-10"
                : "border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
            }`}
          >
            <div>
              {/* Header Kartu: Ikon & Nama Paket */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex-shrink-0" />
                <div>
                  <h3 className="text-[20px] font-bold text-[#111111]">
                    {plan.title}
                  </h3>
                  <p className="text-[13px] text-[#9E9E9E]">{plan.subtitle}</p>
                </div>
              </div>

              {/* Harga & Periode */}
              <div className="text-center mb-6">
                <div className="text-[28px] font-extrabold text-[#0B4F3A]">
                  {plan.price}
                </div>
                <div className="text-[13px] text-[#9E9E9E] mt-1">
                  {plan.period}
                </div>
              </div>

              {/* Garis Pembatas */}
              <hr className="border-gray-100 mb-6" />

              {/* Daftar Benefit */}
              <ul className="space-y-4 mb-8">
                {plan.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-start gap-3 text-[13px] text-[#444444]">
                    {/* Logo centang dikosongkan sesuai permintaan */}
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {/* TODO: Masukkan komponen/ikon centang di sini */}
                    </div>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tombol Aksi */}
            <button
              className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-colors duration-200 ${
                plan.isPopular
                  ? "bg-[#0B4F3A] text-white hover:bg-[#073829]"
                  : "border border-[#0B4F3A] text-[#0B4F3A] hover:bg-[#EBF3ED]"
              }`}
            >
              Berlangganan Sekarang
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
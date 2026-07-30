export default function CardBenefit() {
  const benefits = [
    {
      number: "01",
      title: "Akses Pasar Lebih Luas",
      description: "Jangkau lebih banyak mitra pembeli dari berbagai wilayah untuk memperluas peluang penjualan hasil panen.",
      image: "/images/landingpage/benefits/market.svg"
    },
    {
      number: "02",
      title: "Distribusi Lebih Efisien",
      description: "Proses distribusi hasil panen menjadi lebih cepat, terorganisir, dan mudah dipantau.",
      image: "/images/landingpage/benefit/Distribusi.svg"
    },
    {
      number: "03",
      title: "Mitra Pembeli Terverifikasi",
      description: "Bertransaksi dengan jaringan mitra pembeli yang telah melalui proses verifikasi untuk meningkatkan kepercayaan.",
      image: "/images/landingpage/benefit/Verify.svg"
    },
    {
      number: "04",
      title: "Pemantauan Penjualan",
      description: "Pantau aktivitas penjualan dan distribusi hasil panen melalui laporan yang tersusun secara rapi.",
      image: "/images/landingpage/benefit/Monitoring.svg"
    }
  ];

  return (
    <section className="bg-white min-h-screen py-[60px] px-5 flex flex-col items-center font-sans">
      <div className="text-center mb-10">
        <h2 className="text-[32px] font-bold text-[#111111] mb-3">
          Keuntungan yang Akan <span className="text-[#2E7D32]">Anda Peroleh</span>
        </h2>
        <p className="text-[#9E9E9E] text-sm">
          Nikmati kemudahan distribusi hasil panen dalam satu platform yang terintegrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[920px] w-full">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-8 relative shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col justify-between min-h-[180px]"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center overflow-hidden p-2.5">
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-[#E8F5E9] text-[#2E7D32] px-[14px] py-[6px] rounded-lg font-bold text-sm">
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
      </div>
    </section>
  );
}
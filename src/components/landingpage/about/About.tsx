import Counter from "@/components/animation/Counter"

export default function About() {
  const logos: string[] = [
    "/images/about/KementrianPertanian.png",
    "/images/about/BPN.png",
    "/images/about/Bulog.png",
    "/images/about/Hypermart.png",
    "/images/about/Lottemart.png",
    "/images/about/Superindo.png",
  ];

  return (
    <section className="bg-white px-6 py-14 sm:px-10 md:px-16 lg:px-24">
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-12">
        Mengapa memilih kami?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 max-w-6xl mx-auto">

        <div>
          <p className="text-gray-700 leading-relaxed mb-8 text-sm sm:text-base">
            Hasil pertanian merupakan salah satu penopang utama ketahanan
            pangan dan perekonomian masyarakat. Namun, masih banyak petani
            yang menghadapi kendala dalam mendistribusikan hasil panennya
            akibat terbatasnya akses pasar dan panjangnya rantai distribusi.
          </p>

          <div className="flex flex-wrap gap-6 sm:gap-10">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#c9a227]">25 Juta+</p>
              <p className="text-xs sm:text-sm text-gray-600">Rumah Tangga Pertanian</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#c9a227]">2-7</p>
              <p className="text-xs sm:text-sm text-gray-600">
                Pelaku dalam rantai distribusi
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#c9a227]">12,6%</p>
              <p className="text-xs sm:text-sm text-gray-600">Kontribusi PDB Nasional</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 h-44 sm:h-56 bg-gray-200">
            <img src="/images/about/Pertanian1.png" alt="" className="w-full h-full object-cover" />
            <img src="/images/about/Pertanian2.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#c9a227] text-white font-semibold text-center py-2 text-sm sm:text-base">
            Pertanian di Indonesia
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            <span className="text-[#1f6d3b]">Kompas</span>
            <span className="text-[#c9a227]">&apos;Desa</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">Berkolaborasi bersama:</p>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 max-w-sm items-center">
            {logos.map((logo, i) => (
              <div key={i} className="flex items-center justify-center">
                <img
                  src={logo}
                  alt=""
                  className="h-10 sm:h-12 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            <span className="font-bold">
              <span className="text-[#1f6d3b]">Kompas</span>
              <span className="text-[#c9a227]">&apos;Desa</span>
            </span>{" "}
            hadir sebagai platform yang menghubungkan petani dengan berbagai
            pembeli melalui sistem distribusi yang lebih mudah, transparan,
            dan efisien. Hingga saat ini, Kompas&apos;Desa telah menjalin kerja
            sama dengan 10 mitra terpercaya sebagai bagian dari upaya
            membangun ekosistem distribusi hasil pertanian yang lebih luas
            dan berkelanjutan.
          </p>
        </div>

        <div>
          <p className="text-gray-700 leading-relaxed mb-8 text-sm sm:text-base">
            Dengan demikian, hasil panen dapat menjangkau pasar yang lebih
            luas sekaligus meningkatkan peluang penjualan dan kesejahteraan
            petani.
          </p>

          <div className="flex flex-wrap gap-8 sm:gap-10">

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1f6d3b] flex items-center justify-center text-white text-sm">
                <img
                  src="/images/about/IconTruck.svg"
                  alt=""
                  className="h-10 sm:h-12 object-contain"
                />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#1f6d3b]">
                  <Counter end={400} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Distribusi berhasil</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1f6d3b] flex items-center justify-center text-white text-sm">
                <img
                  src="/images/about/IconPadi.svg"
                  alt=""
                  className="h-10 sm:h-12 object-contain"
                />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#1f6d3b]">
                  <Counter end={1000} suffix="+ Ton" />
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Hasil panen tersalurkan
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 h-44 sm:h-56 bg-gray-200">
            <img src="/images/about/truck.png" alt="" className="w-full h-full object-cover" />
            <img src="/images/about/truck2.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#1f6d3b] text-white font-semibold text-center py-2 text-sm sm:text-base">
            Melayani Hampir di Seluruh Pulau Jawa
          </div>
        </div>

      </div>
    </section>
  );
}
export default function About() {
  return (
    <section className="bg-[#f4f4f2] px-6 py-16 md:px-16">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-12">
        Mengapa memilih kami?
      </h2>

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 max-w-6xl mx-auto">
        {/* Kiri atas: teks masalah */}
        <div>
          <p className="text-gray-700 leading-relaxed mb-8">
            Hasil pertanian merupakan salah satu penopang utama ketahanan
            pangan dan perekonomian masyarakat. Namun, masih banyak petani
            yang menghadapi kendala dalam mendistribusikan hasil panennya
            akibat terbatasnya akses pasar dan panjangnya rantai distribusi.
          </p>

          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-bold text-[#c9a227]">25 Juta+</p>
              <p className="text-sm text-gray-600">Rumah Tangga Pertanian</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c9a227]">2-7</p>
              <p className="text-sm text-gray-600">
                Pelaku dalam rantai distribusi
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c9a227]">12,6%</p>
              <p className="text-sm text-gray-600">Kontribusi PDB Nasional</p>
            </div>
          </div>
        </div>

        {/* Kanan atas: gambar + caption */}
        <div className="relative rounded-lg overflow-hidden">
          {/* Ganti dengan gambar pertanian */}
          <div className="grid grid-cols-2 h-56 bg-gray-200">
            <img src="" alt="" className="w-full h-full object-cover" />
            <img src="" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#c9a227] text-white font-semibold text-center py-2">
            Pertanian di Indonesia
          </div>
        </div>

        {/* Kiri tengah: logo & mitra */}
        <div>
          <h3 className="text-2xl font-bold mb-1">
            <span className="text-[#1f6d3b]">Kompas</span>
            <span className="text-[#c9a227]">&apos;Desa</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">Berkolaborasi bersama:</p>

          <div className="grid grid-cols-4 gap-3 max-w-xs">
            {/* Ganti dengan logo mitra */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-md h-14 flex items-center justify-center bg-white"
              >
                <img src="" alt="" className="max-h-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Kanan tengah: deskripsi platform */}
        <div className="flex items-center">
          <p className="text-gray-700 leading-relaxed">
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

        {/* Kiri bawah: hasil */}
        <div>
          <p className="text-gray-700 leading-relaxed mb-8">
            Dengan demikian, hasil panen dapat menjangkau pasar yang lebih
            luas sekaligus meningkatkan peluang penjualan dan kesejahteraan
            petani.
          </p>

          <div className="flex flex-wrap gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1f6d3b] flex items-center justify-center text-white text-sm">
                🚚
              </div>
              <div>
                <p className="text-xl font-bold text-[#1f6d3b]">400+</p>
                <p className="text-sm text-gray-600">Distribusi berhasil</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1f6d3b] flex items-center justify-center text-white text-sm">
                🌾
              </div>
              <div>
                <p className="text-xl font-bold text-[#1f6d3b]">1000+ Ton</p>
                <p className="text-sm text-gray-600">
                  Hasil panen tersalurkan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan bawah: gambar distribusi */}
        <div className="relative rounded-lg overflow-hidden">
          {/* Ganti dengan gambar armada/distribusi */}
          <div className="grid grid-cols-2 h-56 bg-gray-200">
            <img src="" alt="" className="w-full h-full object-cover" />
            <img src="" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#1f6d3b] text-white font-semibold text-center py-2">
            Melayani Hampir di Seluruh Pulau Jawa
          </div>
        </div>
      </div>
    </section>
  );
}
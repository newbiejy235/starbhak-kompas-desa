"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";

export default function ProfilPembeli() {
  const router = useRouter();
  const [komoditas, setKomoditas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [estimasi, setEstimasi] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const daftarKota = [
    "Kabupaten Bogor",
    "Kabupaten Sukabumi",
    "Kabupaten Cianjur",
    "Kabupaten Bandung",
    "Kabupaten Garut",
    "Kota Bogor",
    "Kota Sukabumi",
    "Kota Bandung",
    "Kota Cirebon",
    "Kota Bekasi",
    "Kota Depok",
    "Jakarta Pusat",
    "Jakarta Utara",
    "Jakarta Barat",
    "Jakarta Selatan",
    "Jakarta Timur",
    "Kota Semarang",
    "Kota Surakarta",
    "Kota Yogyakarta",
    "Kota Surabaya",
    "Kota Malang"
  ];

  const filteredKota = daftarKota.filter((kota) =>
    kota.toLowerCase().includes(lokasi.toLowerCase())
  );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegisterDraft({ komoditas, lokasi, estimasi });
    router.push("/auth/register/password");
  };

  const handleBack = () => {
    saveRegisterDraft({ komoditas, lokasi, estimasi });
    router.back();
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F6F6F6] p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-[1100px] h-full max-h-[95dvh] lg:max-h-[720px] bg-white rounded-[2rem] p-2 flex shadow-sm">
        
        <div className="w-full md:w-[55%] lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-4">
          <div className="flex flex-col h-full justify-center max-w-[420px] mx-auto w-full">
            <div className="text-center mb-6 lg:mb-8">
              <p className="text-[#025246] font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
                Langkah 2 dari 3
              </p>
              <h2 className="text-[22px] lg:text-[26px] font-bold text-gray-900 mb-1.5 lg:mb-2">
                Profil Pembeli
              </h2>
              <p className="text-[11px] lg:text-[13px] text-gray-400">
                Bantu kami menampilkan hasil panen dan perkiraan ongkir terdekat.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-4 lg:gap-5">
              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Komoditas Utama yang Dicari
                </label>
                <input
                  type="text"
                  value={komoditas}
                  onChange={(e) => setKomoditas(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col relative">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Lokasi (Domisili Pengiriman)
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => {
                    setLokasi(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Ketik nama kota/kabupaten..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
                
                {showDropdown && lokasi && filteredKota.length > 0 && (
                  <ul className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                    {filteredKota.map((kota, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setLokasi(kota);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EBF3ED] hover:text-[#025246] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      >
                        {kota}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Estimasi Kebutuhan
                </label>
                <select
                  value={estimasi}
                  onChange={(e) => setEstimasi(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all bg-white"
                  required
                >
                  <option value="" disabled>Pilih estimasi kebutuhan</option>
                  <option value="SKALA_KECIL">Skala Kecil (Di bawah 50 Kg)</option>
                  <option value="SKALA_MENENGAH">Skala Menengah (50 - 500 Kg)</option>
                  <option value="SKALA_BESAR">Skala Besar (Di atas 500 Kg)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/2 bg-white border border-gray-300 hover:bg-gray-50 text-[#025246] font-bold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#025246] hover:bg-[#013f36] text-white font-bold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 transition-colors"
                >
                  Berikutnya
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden md:flex relative w-[45%] lg:w-1/2 h-full rounded-[1.5rem] overflow-hidden flex-col">
          <Image
            src="/images/login/ImageLogin.png"
            alt="Kompas Desa Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[13px] font-medium hover:text-gray-200 transition-colors"
              >
                <div className="border border-white rounded-full p-0.5">
                  <ChevronLeft size={14} strokeWidth={3} />
                </div>
                Kembali ke halaman utama
              </Link>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-[1.3rem] font-bold tracking-wide mb-1">
                Mulai Langkah Baru Bersama
              </h2>
              <h1 className="text-[3rem] font-bold leading-none mb-4 tracking-tight">
                Kompas<span className="text-[#FFD600]">&apos;Desa</span>
              </h1>
              <p className="text-[13px] leading-relaxed text-white/90">
                Bergabunglah untuk terhubung langsung dengan petani
                <br />
                lokal dan dapatkan komoditas berkualitas dengan harga
                <br />
                terbaik.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[12px] font-medium text-white/90">
                Ikuti kami @kompasdesa.official
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
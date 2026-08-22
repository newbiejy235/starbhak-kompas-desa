"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRegisterDraft } from "@/lib/register";
import AuthShell from "@/components/auth/AuthShell";
import StepProgress from "@/components/auth/StepProgress";

const field =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-neutral-900 outline-none transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function ProfilPetani() {
  const router = useRouter();
  const [komoditas, setKomoditas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [estimasi, setEstimasi] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegisterDraft({ komoditas, lokasi, estimasi });
    router.push("/auth/register/petani/password");
  };

  const handleBack = () => {
    saveRegisterDraft({ komoditas, lokasi, estimasi });
    router.back();
  };

  return (
    <AuthShell
      image="/images/login/ImageLogin.png"
      imageSide="right"
      description={
        <>
          Bergabunglah bersama ribuan petani lainnya untuk
          <br />
          menjangkau pembeli langsung tanpa perantara.
        </>
      }
    >
      <StepProgress current={2} />

      <div className="text-center mb-6 lg:mb-8">
        <p className="text-primary font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
          Langkah 2 dari 3
        </p>
        <h2 className="text-[22px] lg:text-[26px] font-bold text-neutral-900 mb-1.5 lg:mb-2">
          Profil Petani
        </h2>
        <p className="text-[11px] lg:text-[13px] text-gray-400">
          Bantu pembeli mengenal hasil panen dan lokasi lahannya.
        </p>
      </div>

      {/* Konten step masuk dengan slide halus dari kanan (PRD 8.5) */}
      <form onSubmit={handleNext} className="flex flex-col gap-4 lg:gap-5 animate-slide-left">
        <div className="flex flex-col">
          <label htmlFor="komoditas" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Komoditas Utama yang Ditanam
          </label>
          <input
            id="komoditas"
            type="text"
            value={komoditas}
            onChange={(e) => setKomoditas(e.target.value)}
            placeholder="Contoh: Padi, Jagung, Cabai..."
            className={field}
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="lokasi" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Lokasi Lahan (Desa/Kabupaten)
          </label>
          <input
            id="lokasi"
            type="text"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Ketik nama desa/kota/kabupaten..."
            className={field}
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="estimasi" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Estimasi Hasil Panen
          </label>
          <select
            id="estimasi"
            value={estimasi}
            onChange={(e) => setEstimasi(e.target.value)}
            className={`${field} bg-white`}
            required
          >
            <option value="" disabled>Pilih estimasi hasil panen</option>
            <option value="SKALA_KECIL">Skala Kecil (Di bawah 50 Kg)</option>
            <option value="SKALA_MENENGAH">Skala Menengah (50 - 500 Kg)</option>
            <option value="SKALA_BESAR">Skala Besar (Di atas 500 Kg)</option>
          </select>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-1/2 bg-white border border-gray-300 hover:bg-gray-50 text-primary font-bold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 transition-all duration-150 ease-smooth active:scale-[0.97]"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="w-1/2 bg-primary hover:bg-primary-dark text-white font-bold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 shadow-soft transition-all duration-150 ease-smooth hover:scale-[1.02] active:scale-[0.97]"
          >
            Berikutnya
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

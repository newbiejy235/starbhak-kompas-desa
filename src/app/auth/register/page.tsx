"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/profile");
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F6F6F6] p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-[1100px] h-full max-h-[95dvh] lg:max-h-[720px] bg-white rounded-[2rem] p-2 flex shadow-sm">
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

        <div className="w-full md:w-[55%] lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-4">
          <div className="flex flex-col h-full justify-center max-w-[420px] mx-auto w-full">
            <div className="text-center mb-6 lg:mb-8">
              <p className="text-[#025246] font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
                Langkah 1 dari 3
              </p>
              <h2 className="text-[22px] lg:text-[26px] font-bold text-gray-900 mb-1.5 lg:mb-2">
                Bergabung sebagai Pelanggan
              </h2>
              <p className="text-[11px] lg:text-[13px] text-gray-400">
                Belanja komoditas segar langsung dari petani lokal bersama KompasDesa.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-3 lg:gap-4">
              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <button
                onClick={handleNext}
                type="submit"
                className="w-full bg-[#025246] hover:bg-[#013f36] text-white font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 mt-2 transition-colors"
              >
                Berikutnya
              </button>
            </form>

            <p className="text-center text-[12px] lg:text-[13px] text-gray-800 mt-5 lg:mt-6">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-[#025246] font-medium hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
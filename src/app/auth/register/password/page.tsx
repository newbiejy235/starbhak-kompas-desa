"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { initialState } from "@/lib/types/auth";
import { getRegisterDraft, clearRegisterDraft } from "@/lib/register";

export default function RegisterStep3() {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const draft = getRegisterDraft();
    const formData = new FormData(e.currentTarget);
    formData.set("role", "pembeli");
    formData.set("fullName", draft.fullName);
    formData.set("username", draft.username);
    formData.set("noTelp", draft.noTelp);
    formData.set("email", draft.email);
    formData.set("preferredCommodity", draft.komoditas);
    formData.set("address", draft.lokasi);
    formData.set("demandScale", draft.estimasi);

    setIsPending(true);
    const result = await registerAction(state, formData);
    setIsPending(false);
    setState(result);

    if (result.success) {
      clearRegisterDraft();
      router.push("/auth/login");
    }
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F6F6F6] p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-[1100px] h-full max-h-[95dvh] lg:max-h-[720px] bg-white rounded-[2rem] p-2 flex shadow-sm">
        {/* Left Section - Image Background */}
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
                Bergabunglah bersama ribuan petani lainnya untuk
                <br />
                menjangkau pembeli langsung tanpa perantara.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[12px] font-medium text-white/90">
                Ikuti kami @kompasdesa.official
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-[55%] lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-4">
          <div className="flex flex-col h-full justify-center max-w-[420px] mx-auto w-full">
            <div className="text-center mb-6 lg:mb-8">
              <p className="text-[#025246] font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
                Langkah 3 dari 3
              </p>
              <h2 className="text-[22px] lg:text-[26px] font-bold text-gray-900 mb-1.5 lg:mb-2">
                Keamanan Akun
              </h2>
              <p className="text-[11px] lg:text-[13px] text-gray-400">
                Buat kata sandi untuk mengamankan akun dan akses masuk kamu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:gap-4">
              {state.message && (
                <div
                  className={`text-center text-[12px] lg:text-[13px] font-medium rounded-xl px-4 py-2.5 ${
                    state.success
                      ? "bg-[#539D5F]/10 text-[#2e7d32]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {state.message}
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              {/* Checkbox Syarat & Ketentuan */}
              <div className="flex items-start gap-2.5 mt-2 mb-4">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  required
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#025246] focus:ring-[#025246] cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] lg:text-[12px] text-gray-500 leading-relaxed cursor-pointer">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <Link href="#" className="text-[#025246] font-semibold underline decoration-[#025246] decoration-1 underline-offset-2">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link href="#" className="text-[#025246] font-semibold underline decoration-[#025246] decoration-1 underline-offset-2">
                    Kebijakan Privasi Kompas&apos;Desa
                  </Link>
                </label>
              </div>

              {/* Buttons Action */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-1/2 bg-white border border-gray-300 hover:border-gray-400 text-[#025246] font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 transition-colors shadow-sm"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-1/2 bg-[#025246] hover:bg-[#013f36] text-white font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? "Memproses..." : "Daftar Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
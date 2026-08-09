"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, User, EyeOff, Eye } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { saveSession } from "@/lib/auth/client";
import { initialState } from "@/lib/types/auth";
import type { LoginResult } from "@/lib/auth/auth.service";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    loginAction,
    initialState as LoginResult,
  );

  useEffect(() => {
    if (state.success && state.token && state.user && state.redirect) {
      saveSession(state.token, state.user);
      router.replace(state.redirect);
    }
  }, [state, router]);

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F8F8F8] p-2 sm:p-4 overflow-hidden">
      
      <div className="w-full max-w-[1100px] h-full max-h-[95dvh] lg:max-h-[720px] bg-white rounded-[2rem] p-2 flex shadow-sm">
        <div className="hidden md:flex relative w-[45%] lg:w-1/2 h-full rounded-[1.5rem] overflow-hidden flex-col">
          <Image
            src="/images/login/serbser.jpg" 
            alt="Kompas Desa Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">

            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[12px] lg:text-[13px] font-medium hover:text-gray-200 transition-colors"
              >
                <div className="border border-white rounded-full p-0.5">
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </div>
                Kembali ke halaman utama
              </Link>
            </div>

            <div className="flex flex-col justify-center ml-15">
              <h2 className="text-[1.1rem] lg:text-[1.3rem] font-bold tracking-wide mb-1">
                Selamat Datang Kembali di
              </h2>
              <h1 className="text-[2.6rem] lg:text-[3.2rem] font-bold leading-none mb-3 lg:mb-4 tracking-tight">
                Kompas<span className="text-[#FFD600]">{"'"}Desa</span>
              </h1>
              <p className="text-[12px] lg:text-[13px] leading-relaxed text-white/90">
                Mewujudkan ekosistem pertanian digital yang<br />
                menghubungkan petani dan pasar secara berkelanjutan.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[11px] lg:text-[12px] font-medium text-white/90">
                Ikuti kami @kompasdesa.official
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[55%] lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-4">
          <div className="flex flex-col h-full justify-center max-w-[420px] mx-auto w-full">
            
            <div className="flex flex-col items-center text-center mb-6 lg:mb-8">
              <div className="bg-[#025246] p-3 rounded-xl text-white mb-4">
                <User size={28} strokeWidth={2} />
              </div>
              <h2 className="text-[24px] lg:text-[28px] font-bold text-gray-900 mb-1.5 lg:mb-2">
                Masuk ke Akun
              </h2>
              <p className="text-[12px] lg:text-[13px] text-gray-400">
                Hubungkan hasil panen dengan kebutuhan pasar.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-4 lg:gap-5">
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
                <label className="text-[12px] lg:text-[13px] font-semibold text-[#4B5563] mb-1.5 lg:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[12px] lg:text-[13px] font-semibold text-[#4B5563] mb-1.5 lg:mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 pr-12 text-sm text-gray-900 outline-none focus:border-[#025246] focus:ring-1 focus:ring-[#025246] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded-sm border-gray-300 text-[#025246] focus:ring-[#025246]"
                  />
                  <span className="text-[12px] lg:text-[13px] text-gray-500">
                    Ingat Saya
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[12px] lg:text-[13px] font-medium text-[#539D5F] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-[#025246] hover:bg-[#013f36] text-white font-semibold text-[13px] lg:text-[14px] rounded-xl py-3 lg:py-3.5 mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="text-center text-[12px] lg:text-[13px] text-[#2D2D2D] mt-5 lg:mt-6">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="text-[#539D5F] font-medium hover:underline"
              >
                Daftar
              </Link>
            </p>

            <div className="text-center text-[10px] lg:text-[11px] text-gray-500 mt-10 lg:mt-auto">
              Dengan masuk, Anda menyetujui<br />
              <Link
                href="#"
                className="text-[#539D5F] font-medium underline decoration-gray-400 decoration-dotted underline-offset-4 hover:decoration-[#539D5F] transition-colors"
              >
                Syarat & Ketentuan
              </Link>
              {" "}dan{" "}
              <Link
                href="#"
                className="text-[#539D5F] font-medium underline decoration-gray-400 decoration-dotted underline-offset-4 hover:decoration-[#539D5F] transition-colors"
              >
                Kebijakan Privasi Kompas{"'"}Desa
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
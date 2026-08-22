"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { initialState } from "@/lib/types/auth";
import { getRegisterDraft, clearRegisterDraft } from "@/lib/register";
import AuthShell from "@/components/auth/AuthShell";
import StepProgress from "@/components/auth/StepProgress";

const field =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-neutral-900 outline-none transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function RegisterPetaniPassword() {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const draft = getRegisterDraft();
    const formData = new FormData(e.currentTarget);
    formData.set("role", "petani");
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
    <AuthShell
      image="/images/login/ImageLogin.png"
      imageSide="left"
      description={
        <>
          Bergabunglah bersama ribuan petani lainnya untuk
          <br />
          menjangkau pembeli langsung tanpa perantara.
        </>
      }
    >
      <StepProgress current={3} />

      <div className="text-center mb-6 lg:mb-8">
        <p className="text-primary font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
          Langkah 3 dari 3
        </p>
        <h2 className="text-[22px] lg:text-[26px] font-bold text-neutral-900 mb-1.5 lg:mb-2">
          Keamanan Akun
        </h2>
        <p className="text-[11px] lg:text-[13px] text-gray-400">
          Buat kata sandi untuk mengamankan akun dan akses masuk kamu.
        </p>
      </div>

      {/* Konten step masuk dengan slide halus dari kanan (PRD 8.5) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:gap-4 animate-slide-left">
        {state.message && (
          <div
            role="alert"
            // Feedback hasil registrasi; shake jika gagal (PRD 8.2)
            className={`text-center text-[12px] lg:text-[13px] font-medium rounded-xl px-4 py-2.5 ${
              state.success
                ? "bg-green-50 text-green-700 animate-slide-down"
                : "bg-red-50 text-red-600 animate-shake"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="password" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Password
          </label>
          <input id="password" type="password" name="password" className={field} required />
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Konfirmasi Password
          </label>
          <input id="confirmPassword" type="password" name="confirmPassword" className={field} required />
        </div>

        {/* Checkbox Syarat & Ketentuan */}
        <div className="flex items-start gap-2.5 mt-2 mb-4">
          <input
            type="checkbox"
            name="agreeTerms"
            required
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="terms" className="text-[11px] lg:text-[12px] text-gray-500 leading-relaxed cursor-pointer">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link href="#" className="text-primary font-semibold underline decoration-primary decoration-1 underline-offset-2">
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="#" className="text-primary font-semibold underline decoration-primary decoration-1 underline-offset-2">
              Kebijakan Privasi Kompas&apos;Desa
            </Link>
          </label>
        </div>

        {/* Buttons Action */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-1/2 bg-white border border-gray-300 hover:border-gray-400 text-primary font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 shadow-sm transition-all duration-150 ease-smooth active:scale-[0.97]"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={isPending}
            // Loading spinner halus saat submit (PRD 8.2 & 9.2)
            className="w-1/2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 shadow-soft transition-all duration-150 ease-smooth hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
          >
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {isPending ? "Memproses..." : "Daftar Akun"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

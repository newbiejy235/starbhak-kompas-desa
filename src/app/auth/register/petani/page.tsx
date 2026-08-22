"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRegisterDraft } from "@/lib/register";
import AuthShell from "@/components/auth/AuthShell";
import StepProgress from "@/components/auth/StepProgress";

const field =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 lg:py-3 text-sm text-neutral-900 outline-none transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function RegisterPetani() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/petani/profile");
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
      <StepProgress current={1} />

      <div className="text-center mb-6 lg:mb-8">
        <p className="text-primary font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
          Langkah 1 dari 3
        </p>
        <h2 className="text-[22px] lg:text-[26px] font-bold text-neutral-900 mb-1.5 lg:mb-2">
          Bergabung sebagai Petani
        </h2>
        <p className="text-[11px] lg:text-[13px] text-gray-400">
          Perluas pasar dan kembangkan hasil pertanianmu bersama KompasDesa.
        </p>
      </div>

      {/* Konten step masuk dengan slide halus dari kanan (PRD 8.5) */}
      <form onSubmit={handleNext} className="flex flex-col gap-3 lg:gap-4 animate-slide-left">
        <div className="flex flex-col">
          <label htmlFor="fullName" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={field}
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="username" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Nama Pengguna
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={field}
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Nomor Telepon
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-[12px] lg:text-[13px] font-medium text-gray-700 mb-1 lg:mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            required
          />
        </div>

        <button
          type="submit"
          // Micro-interaction press antar step (PRD 9.2)
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-[13px] lg:text-sm rounded-xl py-3 lg:py-3.5 mt-2 shadow-soft transition-all duration-150 ease-smooth hover:scale-[1.02] active:scale-[0.97]"
        >
          Berikutnya
        </button>
      </form>

      <p className="text-center text-[12px] lg:text-[13px] text-gray-800 mt-5 lg:mt-6">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}

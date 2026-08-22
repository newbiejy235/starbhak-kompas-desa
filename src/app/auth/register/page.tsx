"use client";

import Link from "next/link";
import { Sprout, User } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

const roles = [
  {
    href: "/auth/register/user",
    icon: User,
    title: "Daftar sebagai Pelanggan",
    description: "Belanja komoditas segar langsung dari petani lokal.",
  },
  {
    href: "/auth/register/petani",
    icon: Sprout,
    title: "Daftar sebagai Petani",
    description: "Jual hasil panenmu ke pembeli tanpa perantara.",
  },
];

export default function Register() {
  return (
    <AuthShell
      image="/images/login/ImageLogin.png"
      imageSide="left"
      description={
        <>
          Pilih peran sesuai kebutuhanmu untuk mulai terhubung
          <br />
          dalam ekosistem pertanian digital Kompas&apos;Desa.
        </>
      }
    >
      <div className="text-center mb-6 lg:mb-8">
        <p className="text-primary font-semibold text-[11px] lg:text-xs tracking-wide mb-1 lg:mb-2">
          Pendaftaran
        </p>
        <h2 className="text-[22px] lg:text-[26px] font-bold text-neutral-900 mb-1.5 lg:mb-2">
          Daftar Akun Baru
        </h2>
        <p className="text-[11px] lg:text-[13px] text-gray-400">
          Mau daftar sebagai apa hari ini?
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:gap-4 animate-slide-left">
        {roles.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="group flex items-center gap-4 rounded-xl border border-gray-300 bg-white px-4 py-3.5 lg:py-4 transition-all duration-150 ease-smooth hover:border-primary hover:bg-primary/5 hover:shadow-soft active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-white">
              <role.icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] lg:text-sm font-bold text-neutral-900">
                {role.title}
              </span>
              <span className="block text-[11px] lg:text-xs text-gray-400 truncate">
                {role.description}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <p className="text-center text-[12px] lg:text-[13px] text-gray-800 mt-5 lg:mt-6">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}

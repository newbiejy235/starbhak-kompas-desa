"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  image: string;
  imageSide?: "left" | "right";
  description: ReactNode;
  children: ReactNode;
}

export default function AuthShell({
  image,
  imageSide = "left",
  description,
  children,
}: AuthShellProps) {
  const imagePanel = (
    <div className="hidden md:flex relative w-[45%] lg:w-1/2 h-full rounded-[1.5rem] overflow-hidden flex-col">
      <Image
        src={image}
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
            <span className="border border-white rounded-full p-0.5">
              <ChevronLeft size={14} strokeWidth={3} />
            </span>
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
          <p className="text-[13px] leading-relaxed text-white/90">{description}</p>
        </div>

        <div className="text-center">
          <p className="text-[12px] font-medium text-white/90">
            Ikuti kami @kompasdesa.official
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F6F6F6] p-2 sm:p-4 overflow-hidden">
      {/* Kartu elevated + entrance fade-up (PRD 8.2 & 9.2) */}
      <div className="w-full max-w-[1100px] h-full max-h-[95dvh] lg:max-h-[720px] bg-white rounded-[2rem] p-2 flex shadow-lift animate-fade-up">
        {imageSide === "left" && imagePanel}

        <div className="w-full md:w-[55%] lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-4">
          <div className="flex flex-col h-full justify-center max-w-[420px] mx-auto w-full">
            {children}
          </div>
        </div>

        {imageSide === "right" && imagePanel}
      </div>
    </div>
  );
}

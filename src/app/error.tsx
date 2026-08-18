'use client'; // Error components wajib menggunakan Client Component

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opsional: Kirim error ke layanan reporting seperti Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-[#FAFAFA] px-4 sm:px-6 lg:px-8 selection:bg-[#025246] selection:text-white">
      <div className="max-w-md w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 ease-out">

        {/* Ikon Error Minimalist */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-red-50 rounded-[2rem] rotate-3 scale-105"></div>
          <div className="absolute inset-0 bg-white rounded-[2rem] -rotate-3 border border-slate-100 shadow-sm"></div>
          <div className="relative bg-red-100/50 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Oops! Terjadi Kesalahan
        </h2>

        {/* Pesan Error */}
        <p className="text-slate-500 text-base sm:text-lg mb-10 leading-relaxed">
          Maaf, kami mengalami sedikit masalah saat memuat halaman ini. Silakan coba lagi atau kembali ke beranda.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Tombol Coba Lagi (Primary) */}
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-full bg-[#025246] text-white text-sm font-semibold hover:bg-[#013d34] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>

          {/* Tombol Kembali ke Beranda (Secondary) */}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Support Link Minimalist (Opsional) */}
        <p className="mt-12 text-sm text-slate-400">
          Masalah berlanjut? <Link href="/bantuan" className="text-[#025246] hover:underline font-medium">Hubungi Bantuan</Link>
        </p>

      </div>
    </div>
  );
}
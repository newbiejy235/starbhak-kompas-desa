'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] px-6 py-16 overflow-hidden selection:bg-[#025246] selection:text-white">
      <style>{`
        @keyframes error-fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes error-icon-in {
          0% {
            opacity: 0;
            transform: scale(0.7) rotate(-8deg);
          }
          70% {
            transform: scale(1.04) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes error-icon-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes error-pulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.08);
          }
        }

        /* SVG drawing animation */
        @keyframes draw-circle {
          from {
            stroke-dashoffset: 110;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-line {
          from {
            stroke-dashoffset: 14;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes error-dot {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          70% {
            opacity: 1;
            transform: scale(1.3);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ring-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .error-icon-in {
          animation: error-icon-in 700ms cubic-bezier(.22, 1, .36, 1) both;
        }

        .error-icon-float {
          animation: error-icon-float 3s ease-in-out 800ms infinite;
        }

        .error-pulse {
          animation: error-pulse 3s ease-in-out 800ms infinite;
        }

        .error-ring {
          transform-origin: center;
          animation: ring-rotate 12s linear 700ms infinite;
        }

        .error-circle {
          stroke-dasharray: 110;
          stroke-dashoffset: 110;
          animation: draw-circle 800ms cubic-bezier(.22, 1, .36, 1) 250ms forwards;
        }

        .error-line {
          stroke-dasharray: 14;
          stroke-dashoffset: 14;
          animation: draw-line 400ms cubic-bezier(.22, 1, .36, 1) 850ms forwards;
        }

        .error-dot {
          transform-origin: center;
          animation: error-dot 400ms cubic-bezier(.22, 1, .36, 1) 1100ms both;
        }

        .error-content {
          opacity: 0;
          animation: error-fade-up 600ms cubic-bezier(.22, 1, .36, 1) forwards;
        }

        .error-delay-1 {
          animation-delay: 150ms;
        }

        .error-delay-2 {
          animation-delay: 250ms;
        }

        .error-delay-3 {
          animation-delay: 350ms;
        }

        .error-delay-4 {
          animation-delay: 450ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .error-icon-in,
          .error-icon-float,
          .error-pulse,
          .error-ring,
          .error-circle,
          .error-line,
          .error-dot,
          .error-content {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      <main className="w-full max-w-md text-center">

        {/* Error Icon */}
        <div
          className={`relative mx-auto w-20 h-20 mb-8 ${mounted ? 'error-icon-in' : 'opacity-0'
            }`}
          aria-hidden="true"
        >
          {/* Soft glow */}
          <div className="error-pulse absolute inset-0 rounded-[1.5rem] bg-[#025246]/10" />

          {/* Icon container */}
          <div className="error-icon-float relative flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-white border border-[#025246]/10 shadow-[0_10px_35px_rgba(2,82,70,0.08)]">

            {/* Decorative rotating ring */}
            <svg
              className="error-ring absolute inset-0 w-full h-full"
              viewBox="0 0 80 80"
              fill="none"
            >
              <circle
                cx="40"
                cy="40"
                r="31"
                stroke="#025246"
                strokeWidth="1"
                strokeDasharray="3 7"
                opacity="0.25"
              />
            </svg>

            <svg
              className="relative w-10 h-10 text-[#025246]"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                className="error-circle"
              />

              <path
                d="M24 16V27"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="error-line"
              />


              <circle
                cx="24"
                cy="32"
                r="1.5"
                fill="currentColor"
                className="error-dot"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1
          className={`error-content error-delay-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3 ${mounted ? '' : 'opacity-0'
            }`}
        >
          Oops! Terjadi Kesalahan
        </h1>

        {/* Description */}
        <p
          className={`error-content error-delay-2 max-w-sm mx-auto text-sm sm:text-base text-slate-500 leading-relaxed ${mounted ? '' : 'opacity-0'
            }`}
        >
          Maaf, kami mengalami sedikit masalah saat memuat halaman ini.
          Silakan coba lagi atau kembali ke beranda.
        </p>

        {/* Actions */}
        <div
          className={`error-content error-delay-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8 ${mounted ? '' : 'opacity-0'
            }`}
        >
          <button
            type="button"
            onClick={() => reset()}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#025246] text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-[#013D34] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#025246] focus-visible:ring-offset-2"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
              <path d="M3 21v-5h5" />
            </svg>

            Coba Lagi
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#025246] focus-visible:ring-offset-2"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Help */}
        <p
          className={`error-content error-delay-4 mt-9 text-sm text-slate-400 ${mounted ? '' : 'opacity-0'
            }`}
        >
          Masalah berlanjut?{' '}
          <Link
            href="/bantuan"
            className="text-[#025246] font-medium transition-colors hover:text-[#013D34] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#025246] focus-visible:ring-offset-2 rounded-sm"
          >
            Hubungi Bantuan
          </Link>
        </p>
      </main>
    </div>
  );
}
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#FAFAFA] px-4 sm:px-6 lg:px-8 selection:bg-[#025246] selection:text-white">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#E4F1EB] rounded-full blur-[100px] opacity-70 pointer-events-none animate-blob"></div>
      <div className="absolute top-[15%] right-[10%] w-40 h-40 sm:w-56 sm:h-56 bg-[#DCEFE7] rounded-full blur-[70px] opacity-60 pointer-events-none animate-drift"></div>
      <div className="absolute bottom-[20%] left-[8%] w-32 h-32 sm:w-48 sm:h-48 bg-[#F0E8DC] rounded-full blur-[60px] opacity-50 pointer-events-none animate-drift-reverse"></div>

      <div className="absolute top-[25%] left-[15%] w-2 h-2 rounded-full bg-[#025246]/30 animate-particle"></div>
      <div className="absolute top-[60%] right-[18%] w-2.5 h-2.5 rounded-full bg-[#025246]/25 animate-particle-slow"></div>
      <div className="absolute top-[35%] right-[30%] w-1.5 h-1.5 rounded-full bg-[#E0A34E]/40 animate-particle"></div>
      <div className="absolute bottom-[30%] left-[28%] w-1.5 h-1.5 rounded-full bg-[#025246]/30 animate-particle-slow"></div>
      <div className="absolute top-[45%] left-[8%] w-1 h-1 rounded-full bg-[#E0A34E]/50 animate-particle-slow"></div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center">

        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#025246] bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#025246] animate-ping-dot"></span>
          Halaman Tidak Ditemukan
        </span>


        <h1 className="text-[96px] sm:text-[128px] font-extrabold leading-none tracking-tighter text-slate-900 select-none">
          <span className="inline-block animate-digit-1">4</span>
          <span className="inline-block text-[#025246] animate-digit-2">0</span>
          <span className="inline-block animate-digit-3">4</span>
        </h1>


        <div className="w-16 h-1 mt-6 rounded-full bg-gradient-to-r from-[#025246] via-[#4A9E8A] to-[#E0A34E] bg-[length:200%_100%] animate-gradient-x"></div>

        {/* Message */}
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mt-5 animate-fade-in-late">
          Sepertinya Anda tersesat di ladang. Halaman yang dicari tidak ada atau telah dipindahkan.
        </p>


        <div className="mt-10 animate-fade-in-late">
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#025246] text-white text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(2,82,70,0.35)] active:scale-95"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
            <svg
              className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="relative z-10">Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        /* Background blobs */
        @keyframes blob {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -25px); }
        }
        @keyframes drift-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 20px); }
        }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
        .animate-drift { animation: drift 10s ease-in-out infinite; }
        .animate-drift-reverse { animation: drift-reverse 12s ease-in-out infinite; }

        /* Particles */
        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-18px) scale(1.3); opacity: 1; }
        }
        @keyframes particle-slow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(15px) scale(0.8); opacity: 0.8; }
        }
        .animate-particle { animation: particle 5s ease-in-out infinite; }
        .animate-particle-slow { animation: particle-slow 7s ease-in-out infinite; }

        /* Badge ping dot */
        @keyframes ping-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
        .animate-ping-dot { animation: ping-dot 1.8s ease-in-out infinite; }

        /* Digits stagger in with springy overshoot */
        @keyframes digit-in {
          0% { opacity: 0; transform: translateY(60px) rotate(8deg) scale(0.5); }
          60% { opacity: 1; transform: translateY(-8px) rotate(-2deg) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
        }
        .animate-digit-1 { animation: digit-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .animate-digit-2 { animation: digit-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
        .animate-digit-3 { animation: digit-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }

        /* Gradient underline flow */
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { animation: gradient-x 4s ease-in-out infinite; }

        /* Fade in for badge & text */
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .animate-fade-in-late { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both; }
      `}</style>
    </div>
  );
}
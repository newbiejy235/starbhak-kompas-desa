"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ConfirmEmail() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  function kodeOtp() {
    alert(`KELARIN YEE DIFFFF`);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6] p-4 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-[#025246] to-[#047857] p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-2xl"></div>
             <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#D7BE44] rounded-full mix-blend-overlay blur-3xl"></div>
          </div>

          <Image
            src="/Konrifmasi email(1).svg"
            alt="Image"
            width={380}
            height={380}
            className="object-contain relative z-10"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          <div className="flex justify-center mb-8 md:hidden">
            <div className="bg-gradient-to-br from-[#025246] to-[#047857] p-6 rounded-full">
              <Image
                src="/Konrifmasi email(1).svg"
                alt="Ilustrasi Verifikasi"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] mb-2 tracking-tight">
            Verifikasi Email
          </h1>

          <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
            Masukkan 6 digit kode OTP yang telah kami kirimkan ke email Anda untuk memverifikasi akun.
          </p>

          <div className="flex gap-2 sm:gap-3 mb-8 justify-between">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="
                  w-full h-12 sm:h-14 text-center text-lg font-bold
                  rounded-xl border border-gray-200 bg-gray-50
                  text-[#111111] placeholder:text-gray-300
                  focus:outline-none focus:border-[#025246] focus:bg-white focus:ring-4 focus:ring-[#025246]/10
                  transition-all shadow-sm
                "
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-2xl border-2 border-[#025246] bg-transparent py-3 sm:py-3.5 text-sm font-bold text-[#025246] hover:bg-[#EBF3ED] transition-all duration-300"
            >
              Kirim OTP
            </button>
            
            <button
              onClick={kodeOtp}
              type="button"
              className="w-full rounded-2xl bg-[#025246] py-3.5 sm:py-4 text-sm font-bold text-white hover:bg-[#024036] hover:shadow-lg hover:shadow-[#025246]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Verifikasi Sekarang
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
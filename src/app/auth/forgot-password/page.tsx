"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function NewPassword() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function checkPassword() {
    alert(`Password berhail diubah`);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6] p-4 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        <div className="hidden md:block md:w-1/2 relative bg-gray-200">
          <Image
            src="/images/auth/" 
            alt="Petani di sawah"
            fill
            className="object-cover"
            priority
          />
        </div>


        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] mb-10 text-center tracking-tight">
            Sandi baru
          </h1>

          <form className="flex flex-col gap-5">

            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Sandi sebelumnya"
                className="
                  w-full h-12 sm:h-14 px-5 text-sm font-medium
                  rounded-xl border border-[#4CAF50] bg-white
                  text-[#111111] placeholder:text-gray-400
                  focus:outline-none focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10
                  transition-all shadow-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Sandi baru"
                className="
                  w-full h-12 sm:h-14 px-5 text-sm font-medium
                  rounded-xl border border-[#4CAF50] bg-white
                  text-[#111111] placeholder:text-gray-400
                  focus:outline-none focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10
                  transition-all shadow-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi Sandi baru"
                className="
                  w-full h-12 sm:h-14 px-5 text-sm font-medium
                  rounded-xl border border-[#4CAF50] bg-white
                  text-[#111111] placeholder:text-gray-400
                  focus:outline-none focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10
                  transition-all shadow-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
            onClick={checkPassword}
              type="button"
              className="w-full rounded-2xl bg-[#025246] py-3.5 sm:py-4 text-sm font-bold text-white hover:bg-[#024036] hover:shadow-lg hover:shadow-[#025246]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Selesai
            </button>
          </form>
          </div>

        </div>
      </div>
  );
}
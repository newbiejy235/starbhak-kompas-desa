"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { sendCode } from "@/actions/nodeMailer/nodemailer.action";
import { changesPassword } from "@/actions/auth";

export default function NewPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verification, setVerification] = useState("");
  const [message, setMessage] = useState("");

  const sendHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return setMessage("isi form email");

    const sender = await sendCode(userEmail);
  };

  const changesPasswordHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return setMessage("isi password baru");
    if (newPassword != confirmPassword)
      return setMessage("password harus tidak sinkron");

    const changes = await changesPassword(userEmail, newPassword, verification);
  };

  const field =
    "w-full h-12 sm:h-14 px-5 text-sm font-medium rounded-xl border border-gray-300 bg-white text-neutral-900 placeholder:text-gray-400 focus:outline-none transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-sm";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6] p-4 md:p-6">
      {/* Kartu elevated + entrance fade-up (PRD 8.2 & 9.2) */}
      <div className="w-full max-w-5xl bg-white rounded-card shadow-lift overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-up">
        <div className="hidden md:block md:w-1/2 relative bg-gradient-to-br from-primary to-emerald-700">
          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
            <h2 className="text-xl font-bold tracking-wide">
              Atur Ulang Kata Sandi
            </h2>
            <p className="text-sm leading-relaxed text-white/90 max-w-xs">
              Gunakan kata sandi yang kuat dengan kombinasi huruf, angka, dan
              simbol agar akun Anda tetap aman.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-10 text-center tracking-tight">
            Sandi Baru
          </h1>

          <form className="flex flex-col gap-5">
            <div className="relative">
              <input
                type="email"
                placeholder="Masukan email yang terdaftar"
                required
                className={field}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Masukan kode verifikasi"
                aria-label="Masukan kode verifikasi"
                required
                className={field}
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
              />
              <button
                type="button"
                onClick={sendHandler}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-300 active:scale-90 transition-all"
              >
                Send code
              </button>
            </div>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Sandi baru"
                aria-label="Sandi baru"
                required
                className={field}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={
                  showNewPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi sandi baru"
                aria-label="Konfirmasi sandi baru"
                required
                className={field}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={changesPasswordHandler}
              type="submit"
              // Micro-interaction press + hover lift (PRD 9.2)
              className="w-full rounded-2xl bg-primary py-3.5 sm:py-4 text-sm font-bold text-white shadow-soft transition-all duration-150 ease-smooth hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.97]"
            >
              Selesai
            </button>

            <h1>{message}</h1>
          </form>
        </div>
      </div>
    </div>
  );
}

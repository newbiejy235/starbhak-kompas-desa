"use client"

import Image from "next/image";
import Link from "next/link";
import {useState} from 'react'
import { registerAction } from "@/actions/auth";

export default function Register() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/images/register/RegisterLeftImgage.png"
            alt="Daftar"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <div className="flex justify-center mb-8 md:hidden">
            <Image
              src="/images/register-illustration.png"
              alt="Register Illustration" 
              width={250}
              height={250}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-8">
            Daftar
          </h1>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Nama Lengka"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />
            <input
              type="usernamme"
              name="useername"
              placeholder="Nama Pengguna"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Nomor Telepon"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Kata Sandi"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Kata Sandi"
              required
              className="w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition"
            />

            <label className="flex items-start gap-2 text-xs text-gray-500 mt-1">
              <input
                type="checkbox"
                name="agreeTerms"
                required
                className="mt-0.5 accent-[#025246]"
              />
              <span>
                Saya menyetujui{" "}
                <Link href="" className="text-[#025246] font-medium">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="" className="text-[#025246] font-medium">
                  Kebijakan Privasi
                </Link>{" "}
                Kompas&apos;Desa
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-semibold text-white hover:bg-[#013d34] transition mt-2"
            >
              Daftar
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#459655] hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
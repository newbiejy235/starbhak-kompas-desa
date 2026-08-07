"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth";

export default function Register() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [role, setRole] = useState("pembeli");
  const [businessType, setBusinessType] = useState("restoran");

  useEffect(() => {
    if (state?.success) {
      router.push("/auth/login");
    }
  }, [state, router]);

  const inputCls =
    "w-full rounded-2xl border border-[#C1C1C1] px-5 py-4 text-sm text-[#2D2D2D] placeholder:text-gray-400 focus:outline-none focus:border-[#025246] transition";

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
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-8">
            Daftar
          </h1>

          <form className="flex flex-col gap-4" action={formAction}>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("petani")}
                className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  role === "petani"
                    ? "border-[#025246] bg-[#025246]/5 text-[#025246]"
                    : "border-[#C1C1C1] text-gray-500 hover:border-[#025246]"
                }`}
              >
                🌾 Petani
              </button>
              <button
                type="button"
                onClick={() => setRole("pembeli")}
                className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  role === "pembeli"
                    ? "border-[#025246] bg-[#025246]/5 text-[#025246]"
                    : "border-[#C1C1C1] text-gray-500 hover:border-[#025246]"
                }`}
              >
                🛒 Pembeli
              </button>
            </div>
            <input type="hidden" name="role" value={role} />

            {role === "pembeli" && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "distributor", label: "Distributor" },
                  { id: "umkm", label: "UMKM" },
                  { id: "restoran", label: "Restoran" },
                  { id: "koperasi", label: "Koperasi" },
                ].map((b) => (
                  <label
                    key={b.id}
                    className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold cursor-pointer text-center transition-colors ${
                      businessType === b.id
                        ? "border-[#025246] bg-[#025246]/5 text-[#025246]"
                        : "border-[#C1C1C1] text-gray-500 hover:border-[#025246]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="businessTypeRadio"
                      value={b.id}
                      checked={businessType === b.id}
                      onChange={() => setBusinessType(b.id)}
                      className="sr-only"
                    />
                    {b.label}
                  </label>
                ))}
                <input type="hidden" name="businessType" value={businessType} />
              </div>
            )}

            <input
              type="text"
              name="fullName"
              placeholder="Nama Lengkap"
              required
              className={inputCls}
            />
            <input
              type="text"
              name="username"
              placeholder="Nama Pengguna"
              required
              className={inputCls}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className={inputCls}
            />

            <input
              type="tel"
              name="noTelp"
              placeholder="Nomor Telepon"
              required
              className={inputCls}
            />

            <input
              type="password"
              name="password"
              placeholder="Kata Sandi"
              required
              className={inputCls}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Kata Sandi"
              required
              className={inputCls}
            />

            {state && !state.success && (
              <p className="text-sm text-red-500">{state.message}</p>
            )}

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
              disabled={isPending}
              className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-semibold text-white hover:bg-[#013d34] transition mt-2 disabled:opacity-50"
            >
              {isPending ? "Memproses..." : "Daftar"}
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

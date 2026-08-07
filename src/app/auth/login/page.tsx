"use client";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function Login() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            // src="/images/login/LoginLeftImage.png"
            src='/images/login/LoginLeftImage.png'
            alt="Login"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <div className="flex justify-center mb-8 md:hidden">
            <Image
              src="/images/login-illustration.png"
              alt="Login Illustration"
              width={250}
              height={250}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-8">
            Masuk
          </h1>

          <form className="flex flex-col gap-4" action={formAction}>
            <input
              type="email"
              name="email"
              placeholder="Email"
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

            {state && !state.success && (
              <p className="text-sm text-red-500">{state.message}</p>
            )}
            {state && state.success && (
              <p className="text-sm text-green-500">{state.message}</p>
            )}

            <div className="flex justify-end -mt-1">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[#459655] hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-semibold text-white hover:bg-[#013d34] transition mt-2"
            >
              {isPending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-[#459655] hover:underline"
            >
              Daftar
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 leading-relaxed mt-8">
            Dengan masuk, Anda menyetujui{" "}
            <Link href="" className="text-[#025246] font-medium">
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="" className="text-[#025246] font-medium">
              Kebijakan Privasi
            </Link>{" "}
            Kompas&apos;Desa
          </p>
        </div>
      </div>
    </div>
  );
}

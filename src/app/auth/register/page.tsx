"use client"

<<<<<<< HEAD
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react'
import { registerAction } from "@/actions/auth";
=======
import { useState } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  noTelp: string;
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterForm() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    noTelp: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // hapus error saat user mulai mengetik ulang
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "Nama depan wajib diisi";
    if (!form.lastName.trim()) newErrors.lastName = "Nama belakang wajib diisi";

    if (!form.noTelp.trim()) {
      newErrors.noTelp = "No. telepon wajib diisi";
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.noTelp.trim())) {
      newErrors.noTelp = "Format nomor telepon tidak valid";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerMessage({
          type: "error",
          text: data?.message || "Registrasi gagal. Silakan coba lagi.",
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: "Registrasi berhasil! Silakan cek email Anda.",
      });
      setForm({
        firstName: "",
        lastName: "",
        noTelp: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setServerMessage({
        type: "error",
        text: "Terjadi kesalahan koneksi. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full p-3 border rounded-lg outline-none transition focus:ring-2 focus:ring-[#025246]/40 ${errors[field] ? "border-red-500" : "border-gray-300"
    }`;
>>>>>>> 7459593 (Update ./github)

export default function Register() {
  return (
<<<<<<< HEAD
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
=======
    <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white p-8 rounded-xl w-full max-w-md space-y-4 shadow-sm"
          >
            <h1 className="text-xl font-bold text-center text-gray-900">Daftar Akun</h1>

            {serverMessage && (
        <div
          className={`text-sm p-3 rounded-lg ${serverMessage.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {serverMessage.text}
>>>>>>> 7459593 (Update ./github)
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
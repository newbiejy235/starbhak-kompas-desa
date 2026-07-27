"use client";

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
    `w-full p-3 border rounded-lg outline-none transition focus:ring-2 focus:ring-[#025246]/40 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-8 rounded-xl w-full max-w-md space-y-4 shadow-sm"
    >
      <h1 className="text-xl font-bold text-center text-gray-900">Daftar Akun</h1>

      {serverMessage && (
        <div
          className={`text-sm p-3 rounded-lg ${
            serverMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {serverMessage.text}
        </div>
      )}

      <div>
        <input
          name="firstName"
          placeholder="Nama Depan"
          value={form.firstName}
          onChange={handleChange}
          className={inputClass("firstName")}
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
        )}
      </div>

      <div>
        <input
          name="lastName"
          placeholder="Nama Belakang"
          value={form.lastName}
          onChange={handleChange}
          className={inputClass("lastName")}
        />
        {errors.lastName && (
          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
        )}
      </div>

      <div>
        <input
          name="noTelp"
          type="number"
          placeholder="No. Telepon"
          value={form.noTelp}
          onChange={handleChange}
          className={inputClass("noTelp")}
        />
        {errors.noTelp && (
          <p className="text-red-500 text-xs mt-1">{errors.noTelp}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={inputClass("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className={inputClass("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#025246] text-white p-3 rounded-lg font-medium transition hover:bg-[#013b32] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
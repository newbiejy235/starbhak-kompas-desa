"use client";

import { useState, ChangeEvent, FormEvent } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Register berhasil");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl w-full max-w-md space-y-4"
    >
      <h1 className="text-2xl font-bold text-center">
        Register
      </h1>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        onChange={handleChange}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="text"
        name="phone"
        placeholder="No. Telepon"
        onChange={handleChange}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full p-3 border rounded-lg"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#025246] text-white p-3 rounded-lg"
      >
        {loading ? "Loading..." : "Daftar"}
      </button>
    </form>
  );
}
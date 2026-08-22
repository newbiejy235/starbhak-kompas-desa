"use client";

import Link from "next/link";
import Image from "next/image";

const footerData = {
  brand: "KompasDesa",
  logo: "/logo-kompas-desa/kompas_desa_icon_color.png",
  description:
    "Menghubungkan petani dengan berbagai pembeli melalui sistem distribusi yang aman, transparan, dan efisien.",
  columns: [
    {
      title: "Jelajahi",
      links: ["Beranda", "Tentang", "Layanan", "Testimoni", "Kontak"],
    },
    {
      title: "Kemitraan",
      links: ["Mitra Kami", "Marketplace", "Retail & Distributor", "Hubungi Kami"],
    },
    {
      title: "Bantuan",
      links: ["Pusat Bantuan", "FAQ", "Hubungi Kami"],
    },
    {
      title: "Informasi",
      links: ["Kebijakan Privasi", "Syarat & Ketentuan", "Lisensi"],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-30 border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-8">

        {/* ================= Bagian Atas ================= */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">

          {/* Kolom Kiri: Brand, Deskripsi & Sosmed */}
          <div className="lg:col-span-4 lg:pr-8">
            {/* Logo Brand dengan Kotak Hitam */}
            <div className="mb-4 flex items-center gap-3">
              <Image src="/logo-kompas-desa/kompas_desa_icon_color.png" alt="logo" width={30} height={30}></Image>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {footerData.brand}
              </h2>
            </div>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-600">
              {footerData.description}
            </p>

            {/* Ikon Sosial Media (Hitam Minimalis) */}
            <div className="flex items-center gap-3">
              {/* WhatsApp */}
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:border-slate-900"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.508 0-9.989 4.481-9.989 9.99 0 1.942.553 3.754 1.517 5.295l-1.54 5.625 5.786-1.517c1.481.821 3.197 1.287 5.016 1.287 5.508 0 9.989-4.481 9.989-9.99 0-5.509-4.481-9.99-9.989-9.99zm0 18.232c-1.637 0-3.15-.45-4.453-1.23l-.32-.192-3.307.866.882-3.224-.21-.334c-.87-1.385-1.332-2.997-1.332-4.658 0-4.542 3.695-8.237 8.24-8.237 4.544 0 8.239 3.695 8.239 8.237 0 4.543-3.695 8.238-8.239 8.238z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:border-slate-900"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Medium */}
              <a
                href="#"
                aria-label="Medium"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:border-slate-900"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Kolom Kanan: 4 Grid Navigasi */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {footerData.columns.map((col, idx) => (
              <div key={idx} className="flex flex-col">
                <h3 className="mb-4 text-base font-bold text-slate-900">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href="#"
                        className="inline-block text-sm text-slate-600 transition-all duration-200 hover:translate-x-1 hover:text-slate-900 hover:font-medium"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ================= Bottom Bar ================= */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 md:flex-row">
            <Link
              href="#"
              className="transition-colors duration-200 hover:text-slate-900"
            >
              Privacy Policy
            </Link>

            <Link
              href="#"
              className="transition-colors duration-200 hover:text-slate-900"
            >
              Informasi
            </Link>

            <p className="text-slate-500">
              © {new Date().getFullYear()} KompasDesa. Hak cipta dilindungi.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
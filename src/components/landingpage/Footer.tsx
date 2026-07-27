"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-30 mt-20">
      <div className="absolute inset-0 bg-[#01473B]"></div>

      <div className="relative px-6 py-16 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10">

            <div>
              <h1 className="text-4xl font-bold mb-4">
                Kompas Desa
              </h1>
              
              <h1>
                Menghubungkan petani dengan berbagai pembeli melalui sistem distribusi yang aman, transparan, dan efisien.
              </h1>

              <Image
                src="/images/landingpage/Footer_Kolaborasi.svg"
                alt="Ilustrasi"
                width={280}
                height={200}
                className="mb-4"
              />

              <p className="text-white/70 max-w-md">
                Platform distribusi untuk petani, peternak, dan nelayan.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <h2 className="font-semibold mb-3">Navigasi</h2>
                <ul className="space-y-2 text-white/70">
                  <li>Home</li>
                  <li>Layanan</li>
                  <li>Tentang</li>
                  <li>Kontak</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-3">Layanan</h2>
                <ul className="space-y-2 text-white/70">
                  <li>Distribusi</li>
                  <li>Logistik</li>
                  <li>Kemitraan</li>
                </ul>
              </div>
            </div>

          </div>

          <div className="border-t border-white/20 my-10"></div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60 gap-4">
            <p>© 2026 Kompas Desa. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
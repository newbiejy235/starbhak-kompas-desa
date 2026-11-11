<div align="center">
  <img src="./public/logo-kompas-desa/kompas_logo_icon.png" alt="Logo Kompas'Desa" width="100" height="100" />

  <h1>Kompas'Desa</h1>
  <p><b>Menghubungkan Petani Lokal dan Pembeli Langsung dalam Satu Ekosistem Digital</b></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
  </p>

  <h3>🌐 Kunjungi Website Resmi Kami: <a href="https://kompasdesa.site">kompasdesa.site</a></h3>
</div>

---

## 📑 Daftar Isi

- [Apa itu Kompas'Desa?](#-apa-itu-kompasdesa)
- [Masalah dan Solusi](#-masalah-dan-solusi)
- [Fitur-Fitur](#-fitur-fitur-di-kompasdesa)
- [Alur Penggunaan](#-alur-penggunaan)
- [Teknologi di Balik Layar](#-teknologi-di-balik-layar)
- [Struktur Folder Proyek](#-struktur-folder-proyek)
- [Memulai (Instalasi)](#-memulai-instalasi)
- [Variabel Lingkungan](#-variabel-lingkungan)
- [Perintah yang Tersedia](#-perintah-yang-tersedia)
- [Deployment](#-deployment)
- [Panduan Kontribusi](#-panduan-kontribusi)
- [Rencana Pengembangan](#-rencana-pengembangan)
- [Tim Pengembang](#-tim-pengembang)
- [Lisensi](#-lisensi)

---

## 📖 Apa itu Kompas'Desa?

**Kompas'Desa** adalah platform digital berbasis website yang berperan sebagai "jembatan" antara **Petani Lokal** dan **Pembeli**, baik individu, restoran, maupun pembeli partai besar.

Lewat Kompas'Desa, pembeli bisa mencari komoditas segar langsung dari petaninya, bernegosiasi, dan membeli hasil panen dengan harga yang lebih adil untuk kedua belah pihak.

---

## 🎯 Masalah dan Solusi

| Masalah | Solusi di Kompas'Desa |
|---|---|
| Rantai penjualan hasil tani terlalu panjang, sehingga harga di tingkat petani rendah tetapi harga di pasar tinggi. | Pembeli terhubung langsung dengan petani tanpa perantara berlapis. |
| Petani sulit memasarkan hasil panen di luar daerahnya. | Setiap petani punya toko digital sendiri yang bisa dilihat pembeli dari mana saja. |
| Pembeli sulit menemukan petani yang dekat dan terpercaya. | Pencarian berdasarkan lokasi dan rating, ditambah badge untuk petani terverifikasi. |
| Banyak petani belum terbiasa dengan teknologi. | Pendaftaran bertahap dan tampilan yang sederhana di HP maupun laptop. |

---

## ✨ Fitur-Fitur di Kompas'Desa

Aplikasi ini dirancang agar mudah digunakan oleh siapa saja, termasuk mereka yang belum terbiasa dengan teknologi.

### 🧑‍🌾 Untuk Mitra Petani

- **Pendaftaran bertahap:** petani mengisi data diri, profil lahan, lalu membuat kata sandi, satu langkah per layar agar tidak membingungkan.
- **Toko digital sendiri:** petani memajang foto hasil panen, menentukan harga, dan menulis deskripsi produknya sendiri.
- **Status terverifikasi:** petani dengan data lengkap mendapat badge khusus supaya pembeli lebih percaya.

### 🛒 Untuk Pembeli

- **Pencarian dan filter:**
  - **Lokasi:** cari petani terdekat dari kota Anda (misalnya "Tangerang" atau "Pandeglang") agar ongkos kirim lebih murah.
  - **Rating:** saring petani dengan rating 4.5 ke atas.
  - **Urutan:** paling relevan, terbaru, atau stok terbanyak.
- **Halaman produk dan toko:** lihat komoditas yang sedang panen lengkap dengan harga dan profil petaninya.

### 🎨 Tampilan dan Performa

- **Animasi halus:** perpindahan halaman, tombol, dan gambar dianimasikan dengan GSAP.
- **Responsif:** tampilan menyesuaikan layar HP, tablet, dan laptop.
- **Cepat dimuat:** dibangun dengan Next.js (App Router).

---

## 🔄 Alur Penggunaan

**Petani**

1. Daftar sebagai mitra petani (data diri, profil lahan, kata sandi).
2. Lengkapi data untuk mendapatkan badge terverifikasi.
3. Tambahkan produk: foto, harga, stok, dan deskripsi.
4. Terima pesanan dari pembeli.

**Pembeli**

1. Buka halaman pencarian dan pilih lokasi, rating, atau urutan.
2. Buka halaman toko atau produk untuk melihat detail dan harga.
3. Hubungi petani, sepakati harga, lalu beli.

---

---

## 💻 Teknologi di Balik Layar

| Teknologi | Peran |
|---|---|
| [Next.js (App Router)](https://nextjs.org/) | Framework utama: routing, rendering di server, dan server actions. |
| [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis agar kode lebih rapi dan minim bug. |
| [Tailwind CSS](https://tailwindcss.com/) | Styling berbasis utility class (warna, ukuran, jarak). |
| [GSAP](https://gsap.com/) | Animasi elemen dan transisi halaman. |
| [Lucide React](https://lucide.dev/) | Kumpulan ikon UI. |

<!-- TODO: tambahkan database, autentikasi, dan layanan lain yang dipakai (mis. PostgreSQL, Supabase, Cloudinary) -->

---

## 📂 Struktur Folder Proyek

```text
starbhak-kompas-desa/
├── actions/        # Server actions: mengambil data petani dan produk dari database
├── app/            # Halaman web (App Router): Beranda, Login, Register, dan lainnya
├── components/     # Komponen UI: tombol, kartu produk, filter
├── constants/      # Data tetap, contoh: daftar kota se-Indonesia
├── lib/            # Fungsi pembantu, pengaturan animasi, tipe data
└── public/         # Aset: logo, gambar latar, ilustrasi
```

---

## 🚀 Memulai (Instalasi)

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18.18 atau lebih baru
- npm (terpasang bersama Node.js), atau pnpm / yarn / bun
- Git

### Langkah

```bash
# 1. Clone repositori
git clone https://github.com/<username>/starbhak-kompas-desa.git
cd starbhak-kompas-desa

# 2. Pasang dependensi
npm install

# 3. Siapkan variabel lingkungan
cp .env.example .env.local
# lalu isi nilainya, lihat bagian "Variabel Lingkungan"

# 4. Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔐 Variabel Lingkungan

Simpan di file `.env.local` (jangan di-commit).

<!-- TODO: sesuaikan dengan variabel yang benar-benar dipakai proyek -->

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Alamat koneksi database yang dipakai folder `actions/`. |
| `NEXT_PUBLIC_SITE_URL` | Tidak | URL situs, contoh `https://kompasdesa.site`. |

---

## 📜 Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan di `localhost:3000`. |
| `npm run build` | Membuat build produksi. |
| `npm run start` | Menjalankan hasil build produksi. |
| `npm run lint` | Memeriksa kode dengan ESLint. |

---

## ☁️ Deployment

Situs produksi berjalan di [kompasdesa.site](https://kompasdesa.site).

<!-- TODO: sebutkan platform hosting yang dipakai (mis. Vercel) -->

Langkah umum untuk men-deploy proyek Next.js:

1. Push kode ke GitHub.
2. Hubungkan repositori ke platform hosting.
3. Isi variabel lingkungan yang sama dengan `.env.local` di pengaturan proyek.
4. Setiap push ke branch utama akan memicu deploy baru.

Untuk hosting sendiri: jalankan `npm run build`, lalu `npm run start`.

---

## 🤝 Panduan Kontribusi

1. Fork repositori ini, lalu buat branch baru dari `main`:
   ```bash
   git checkout -b feature/nama-fitur
   ```
2. Kerjakan perubahan dan pastikan `npm run lint` serta `npm run build` lolos.
3. Commit dengan format [Conventional Commits](https://www.conventionalcommits.org/):
   ```text
   feat(pencarian): tambah filter berdasarkan rating
   fix(register): perbaiki validasi nomor telepon
   ```
4. Push branch Anda dan buka Pull Request dengan penjelasan singkat tentang perubahan.

**Penamaan branch:** `feature/...`, `fix/...`, `hotfix/...`, `chore/...` (huruf kecil, kata dipisah tanda hubung).

Menemukan bug atau punya usul fitur? Buka *issue* di repositori ini.

---

## 🗺️ Rencana Pengembangan

<!-- TODO: sesuaikan dengan rencana tim -->

- [ ] Negosiasi harga langsung di dalam aplikasi
- [ ] Chat antara pembeli dan petani
- [ ] Pembayaran online
- [ ] Ulasan dan rating dari pembeli
- [ ] Notifikasi stok dan panen baru

---

---

## 📄 Lisensi

<!-- TODO: pilih lisensi (mis. MIT) dan tambahkan file LICENSE -->

Hak cipta © 2026 Tim Kompas'Desa.

---

<div align="center">
  <sub>Dibuat untuk petani lokal Indonesia.</sub>
</div>

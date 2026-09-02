<div align="center">
  <img src="./public/logo-kompas-desa/kompas_logo_icon.png" alt="Logo Kompas'Desa" width="100" height="100" />
  
  <h1>Kompas'Desa</h1>
  <p><b>Menghubungkan Petani Lokal dan Pembeli Langsung dalam Satu Ekosistem Digital</b></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14%2F15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
  </p>

  <h3>🌐 Kunjungi Website Resmi Kami: <a href="https://kompasdesa.site">kompasdesa.site</a></h3>
</div>

---

## 📖 Apa itu Kompas'Desa?

**Kompas'Desa** adalah sebuah platform digital berbasis website yang dibuat seperti "jembatan". Jembatan ini menghubungkan para **Petani Lokal** langsung dengan para **Pembeli** (baik itu individu, restoran, maupun tengkulak besar). 

**Kenapa aplikasi ini dibuat?**
Biasanya, rantai penjualan hasil tani itu sangat panjang, sehingga harga jual petani murah, tapi harga beli di pasar jadi mahal. Dengan Kompas'Desa, pembeli bisa mencari komoditas segar langsung dari petaninya, bernegosiasi, dan membeli hasil panen dengan harga yang lebih adil untuk kedua belah pihak.

---

## ✨ Fitur-Fitur Keren di Kompas'Desa

Aplikasi ini dirancang senyaman mungkin agar mudah digunakan oleh siapa saja, bahkan untuk mereka yang belum terlalu terbiasa dengan teknologi.

### 🧑‍🌾 Untuk Mitra Petani:
* **Pendaftaran Super Mudah:** Proses pendaftaran dibuat bertahap (tidak membingungkan), petani cukup mengisi data diri, profil lahan, dan membuat kata sandi.
* **Toko Digital Sendiri:** Petani bisa memajang foto hasil panen, menentukan harga, dan deskripsi produknya sendiri layaknya punya toko *online*.
* **Status Terverifikasi:** Petani yang datanya lengkap akan mendapatkan "Badge" khusus agar pembeli lebih percaya.

### 🛒 Untuk Pembeli:
* **Pencarian Canggih (Search & Filter):** Pembeli bisa mencari hasil panen berdasarkan:
  * **Lokasi:** Cari petani yang paling dekat dengan kota Anda (misal: "Tangerang", "Pandeglang") agar ongkir lebih murah.
  * **Rating:** Cari petani dengan bintang 4.5+ (terpercaya).
  * **Urutan:** Bisa diurutkan dari yang paling relevan, terbaru, atau stok terbanyak.
* **Tampilan Produk & Toko:** Melihat detail komoditas apa saja yang sedang panen lengkap dengan harganya.

### 🎨 Keunggulan Aplikasi (Tampilan & Performa):
* **Animasi Halus & Nyaman:** Menggunakan teknologi *GSAP* sehingga perpindahan halaman, tombol, dan gambar terasa sangat mulus dan interaktif.
* **Bisa Dibuka di HP atau Laptop (Responsif):** Tampilan otomatis menyesuaikan layar. Tetap rapi walau dibuka dari *smartphone*.
* **Anti Lemot:** Dibangun dengan teknologi terbaru (Next.js) yang membuat proses muat *(loading)* sangat cepat.

---

## 💻 Teknologi di Balik Layar

Bagi kamu para *Developer* atau programmer yang ingin tahu mesin apa yang menggerakkan aplikasi ini, berikut adalah teknologi yang kami gunakan:

* **[Next.js (App Router)](https://nextjs.org/)** - Rangka (Framework) utama penyusun website yang sangat cepat.
* **[TypeScript](https://www.typescriptlang.org/)** - Bahasa pemrograman agar kode lebih rapi dan minim *error* (bug).
* **[Tailwind CSS](https://tailwindcss.com/)** - Alat pengatur desain visual (warna, ukuran, jarak) agar UI/UX terlihat modern.
* **[GSAP](https://gsap.com/)** - Senjata andalan kami untuk membuat animasi pergerakan elemen yang cantik.
* **[Lucide React](https://lucide.dev/)** - Kumpulan ikon-ikon UI yang minimalis dan elegan.

---

## 📂 Struktur Folder Proyek

Untuk mempermudah pengembangan, kode kami susun dengan sangat rapi:

```text
starbhak-kompas-desa/
├── actions/        # (Mesin Data) Kode untuk mengambil data petani & produk dari database
├── app/            # (Halaman Web) Kumpulan halaman seperti Beranda, Login, Register, dll.
├── components/     # (Potongan UI) Bagian-bagian kecil seperti Tombol, Kartu Produk, Filter.
├── constants/      # (Data Tetap) Menyimpan data yang tidak berubah, contoh: Daftar Kota se-Indonesia.
├── lib/            # (Peralatan) Fungsi-fungsi pembantu, pengaturan animasi, tipe data.
└── public/         # (Aset) Tempat menyimpan logo, gambar latar belakang, dan ilustrasi.

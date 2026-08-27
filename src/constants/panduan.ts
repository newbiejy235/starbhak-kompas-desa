export type Guide = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
};

/** Konten panduan untuk dashboard petani. */
export const FARMER_GUIDES: Guide[] = [
  {
    id: "tambah-komoditas",
    title: "Cara Menambahkan Komoditas",
    summary:
      "Daftarkan hasil panen Anda ke katalog agar dapat dilihat dan dipesan pembeli.",
    steps: [
      "Buka menu Tambah Komoditas di sidebar.",
      "Lengkapi nama, kategori, harga, stok, dan lokasi komoditas.",
      "Unggah foto produk terbaik untuk menarik pembeli.",
      "Kirim untuk verifikasi admin sebelum tayang di marketplace.",
    ],
  },
  {
    id: "terima-pesanan",
    title: "Cara Menerima Pesanan",
    summary:
      "Proses pesanan masuk dengan cepat agar pembeli puas dan rating bagus.",
    steps: [
      "Buka menu Pesanan Masuk untuk melihat pesanan baru.",
      "Periksa detail pesanan: jumlah, alamat, dan catatan pembeli.",
      "Konfirmasi pesanan dalam 1×24 jam.",
      "Siapkan produk sesuai jadwal pengiriman atau penjemputan.",
    ],
  },
  {
    id: "atur-stok",
    title: "Cara Mengatur Stok",
    summary:
      "Jaga stok tetap akurat supaya tidak ada pesanan yang gagal dipenuhi.",
    steps: [
      "Buka menu Komoditas lalu pilih produk yang ingin diubah.",
      "Perbarui jumlah stok setiap panen atau penjualan manual.",
      "Gunakan Catatan Panen untuk merekam hasil panen terbaru.",
      "Komoditas otomatis berstatus Habis saat stok mencapai nol.",
    ],
  },
  {
    id: "kirim-pesanan",
    title: "Cara Mengirim Pesanan",
    summary: "Kirim pesanan tepat waktu dengan bukti pengiriman yang jelas.",
    steps: [
      "Pastikan status pesanan sudah Diproses sebelum pengiriman.",
      "Kemas produk dengan aman sesuai sifat komoditas.",
      "Ubah status ke Dikirim setelah paket diserahkan ke kurir.",
      "Pantau hingga pembeli mengonfirmasi pesanan Selesai.",
    ],
  },
  {
    id: "tarik-dana",
    title: "Cara Menarik Dana",
    summary:
      "Saldo dari transaksi lunas dapat ditarik ke rekening terdaftar Anda.",
    steps: [
      "Pastikan pesanan sudah berstatus Selesai dan pembayaran Lunas.",
      "Hubungi admin apabila saldo belum muncul pada akun Anda.",
      "Sertakan nomor rekening aktif atas nama Anda sendiri.",
      "Pencairan diproses maksimal 2 hari kerja oleh tim platform.",
    ],
  },
  {
    id: "rating-baik",
    title: "Cara Mendapatkan Rating Baik",
    summary:
      "Rating tinggi membuat produk Anda lebih dipercaya dan sering dipesan.",
    steps: [
      "Kirim produk sesuai deskripsi: berat, kualitas, dan foto asli.",
      "Respons chat pembeli dengan ramah dan cepat.",
      "Kemas dengan rapi agar produk sampai dalam kondisi baik.",
      "Minta pembeli memberi ulasan setelah pesanan selesai.",
    ],
  },
];

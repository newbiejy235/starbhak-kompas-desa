/**
 * Ambang stok menipis. Dipakai bersama oleh halaman Stok, Komoditas,
 * dan peringatan di Dashboard agar angka "menipis" konsisten di seluruh app.
 */
export const LOW_STOCK_THRESHOLD = 10;

/** Pilihan kualitas komoditas yang valid (sinkron dengan backend). */
export const QUALITY_OPTIONS = ["Premium", "A", "B", "C"] as const;

/** Pilihan satuan komoditas yang umum dipakai petani. */
export const UNIT_OPTIONS = ["kg", "ton", "karung", "kuintal"] as const;

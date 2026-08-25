/**
 * Kumpulan fungsi tanggal murni yang dipakai lintas halaman dashboard.
 * Tidak ada React/JSX di sini — hanya kalkulasi.
 */

/** Format tanggal menjadi "YYYY-MM-DD" (zona waktu lokal). */
export function toISODate(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Grid 6×7 hari untuk tampilan kalender bulanan,
 * dimulai dari Senin (konvensi Indonesia).
 */
export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Senin = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

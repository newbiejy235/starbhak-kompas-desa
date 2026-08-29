export function formatRupiah(value: string | number | null | undefined): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

export function formatNumber(value: string | number | null | undefined): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("id-ID");
}

/* ── Satuan berat (kg-only) ───────────────────────────────
   Komoditas distandarkan ke "kg". Konversi hanya tampilan
   (bukan mengubah data). Satuan yang tak dikenal (mis.
   karung/ikat) TIDAK dibuatkan konversi fiktif.
*/
const KG_FACTORS: Record<string, number> = {
  kg: 1,
  kilogram: 1,
  kilogam: 1,
  kw: 100,
  kuintal: 100,
  ton: 1000,
  gram: 0.001,
  g: 0.001,
};

/** Konversi jumlah + satuan menjadi kilogram; null bila satuan tak dikenal. */
export function toKg(
  value: string | number | null | undefined,
  unit: string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  const factor = KG_FACTORS[(unit || "kg").toLowerCase().trim()];
  if (factor === undefined) return null;
  return num * factor;
}

/** Tampilkan berat dalam kg bila satuan dikenal; satuan lain ditampilkan apa adanya. */
export function formatWeight(
  value: string | number | null | undefined,
  unit: string | null | undefined,
): string {
  const kg = toKg(value, unit);
  if (kg === null) {
    const num = Number(value ?? 0);
    return `${Number.isNaN(num) ? 0 : num} ${unit ?? "kg"}`.trim();
  }
  const rounded = Math.round(kg * 100) / 100;
  return `${rounded.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`;
}

export function formatDate(
  value: string | Date | null | undefined,
  withTime = false,
): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, true);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  petani: "Petani",
  pembeli: "Pembeli",
};

export const BUSINESS_TYPE_LABEL: Record<string, string> = {
  distributor: "Distributor",
  umkm: "UMKM",
  restoran: "Restoran",
  koperasi: "Koperasi",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Transfer Bank",
  virtual_account: "Virtual Account",
  ewallet: "E-Wallet",
  qris: "QRIS",
  cod: "Bayar di Tempat",
};

export const COMMODITY_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
  available: "Tersedia",
  sold_out: "Habis",
};

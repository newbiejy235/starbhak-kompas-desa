import {
  CreditCard,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type HelpCategory = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Kategori bantuan untuk dashboard petani. */
export const FARMER_HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "orders",
    icon: ShoppingBag,
    title: "Bantuan Pesanan",
    description: "Konfirmasi, perubahan, dan pembatalan pesanan.",
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Masalah Pembayaran",
    description: "Pembayaran tertahan, belum lunas, atau refund.",
  },
  {
    id: "delivery",
    icon: Truck,
    title: "Masalah Pengiriman",
    description: "Jadwal kirim, kurir, dan kondisi produk saat tiba.",
  },
];

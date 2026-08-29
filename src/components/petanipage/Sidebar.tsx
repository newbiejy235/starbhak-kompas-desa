"use client";

import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingBag,
  History,
  Star,
  Bell,
  CircleUser,
  MessageCircle,
  CalendarDays,
  NotebookPen,
  TrendingUp,
  Target,
  Users,
  Trophy,
  BookOpen,
  CircleQuestionMark,
  ChartColumn,
  Boxes,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

/**
 * Navigasi petani dikelompokkan mengikuti alur kerja seller:
 * UTAMA -> PRODUK -> OPERASIONAL -> PERFORMA -> KOMUNIKASI -> LAINNYA.
 * Hanya fitur yang benar-benar tersedia yang ditampilkan.
 */
const menuItems: SidebarEntry[] = [
  // ── UTAMA ──
  { id: "heading-utama", label: "Utama" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/petani/dashboard" },
  { id: "orders", label: "Pesanan", icon: ShoppingBag, href: "/petani/orders" },
  { id: "sales", label: "Riwayat Penjualan", icon: History, href: "/petani/sales" },
  { id: "buyers", label: "Pembeli", icon: Users, href: "/petani/pembeli" },

  // ── PRODUK ──
  { id: "heading-produk", label: "Produk" },
  { id: "commodities", label: "Komoditas", icon: Package, href: "/petani/commodities" },
  { id: "add", label: "Tambah Komoditas", icon: PackagePlus, href: "/petani/commodities/add" },
  { id: "stock", label: "Stok", icon: Boxes, href: "/petani/stok" },

  // ── OPERASIONAL ──
  { id: "heading-operasional", label: "Operasional" },
  { id: "calendar", label: "Kalender Panen", icon: CalendarDays, href: "/petani/kalender-panen" },
  { id: "harvest-notes", label: "Catatan", icon: NotebookPen, href: "/petani/catatan-panen" },

  // ── PERFORMA ──
  { id: "heading-performa", label: "Performa" },
  { id: "analytics", label: "Analitik", icon: ChartColumn, href: "/petani/analitik" },
  { id: "target", label: "Target Penjualan", icon: Target, href: "/petani/target-penjualan" },
  { id: "achievements", label: "Pencapaian", icon: Trophy, href: "/petani/pencapaian" },

  // ── KOMUNIKASI ──
  { id: "heading-komunikasi", label: "Komunikasi" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/petani/chat" },
  { id: "reviews", label: "Ulasan", icon: Star, href: "/petani/reviews" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/petani/notifications" },

  // ── LAINNYA ──
  { id: "heading-lainnya", label: "Lainnya" },
  { id: "price-history", label: "Riwayat Harga", icon: TrendingUp, href: "/petani/riwayat-harga" },
  { id: "guide", label: "Panduan", icon: BookOpen, href: "/petani/panduan" },
  { id: "help", label: "Bantuan", icon: CircleQuestionMark, href: "/petani/bantuan" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/petani/profile" },
];

export default function PetaniSidebar() {
  return (
    <DashboardSidebar
      menuItems={menuItems}
      roleLabel="Akun Petani"
      brandHref="/petani/dashboard"
    />
  );
}

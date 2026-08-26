"use client";

import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  History,
  Star,
  Bell,
  CircleUser,
  MessageCircle,
  EllipsisVertical,
  CalendarDays,
  NotebookPen,
  TrendingUp,
  Target,
  Users,
  Trophy,
  BookOpen,
  CircleQuestionMark,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

const menuItems: SidebarEntry[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/petani/dashboard" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/petani/chat" },
  { id: "add", label: "Tambah Komoditas", icon: PackagePlus, href: "/petani/commodities/add" },
  { id: "orders", label: "Pesanan Masuk", icon: ShoppingBag, href: "/petani/orders" },
  { id: "sales", label: "Riwayat Penjualan", icon: History, href: "/petani/sales" },
  { id: "reviews", label: "Ulasan", icon: Star, href: "/petani/reviews" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/petani/notifications" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/petani/profile" },
  {
    id: "more",
    label: "Lainnya",
    icon: EllipsisVertical,
    children: [
      {
        id: "calendar",
        label: "Kalender Panen",
        icon: CalendarDays,
        href: "/petani/kalender-panen",
      },
      {
        id: "harvest-notes",
        label: "Catatan Panen",
        icon: NotebookPen,
        href: "/petani/catatan-panen",
      },
      {
        id: "price-history",
        label: "Riwayat Harga",
        icon: TrendingUp,
        href: "/petani/riwayat-harga",
      },
      {
        id: "target",
        label: "Target Penjualan",
        icon: Target,
        href: "/petani/target-penjualan",
      },
      { id: "buyers", label: "Pembeli", icon: Users, href: "/petani/pembeli" },
      { id: "achievements", label: "Pencapaian", icon: Trophy, href: "/petani/pencapaian" },
      { id: "guide", label: "Panduan", icon: BookOpen, href: "/petani/panduan" },
      { id: "help", label: "Bantuan", icon: CircleQuestionMark, href: "/petani/bantuan" },
    ],
  },
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

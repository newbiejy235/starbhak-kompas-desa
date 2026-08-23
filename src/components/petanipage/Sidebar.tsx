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
} from "lucide-react";
import DashboardSidebar, { type SidebarItem } from "@/components/shared/DashboardSidebar";

const menuItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/petani/dashboard" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/petani/chat" },
  { id: "add", label: "Tambah Komoditas", icon: PackagePlus, href: "/petani/commodities/add" },
  { id: "orders", label: "Pesanan Masuk", icon: ShoppingBag, href: "/petani/orders" },
  { id: "sales", label: "Riwayat Penjualan", icon: History, href: "/petani/sales" },
  { id: "reviews", label: "Ulasan", icon: Star, href: "/petani/reviews" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/petani/notifications" },
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

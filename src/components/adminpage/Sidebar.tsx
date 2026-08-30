"use client";

import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingBag,
  Percent,
  ReceiptText,
  Star,
  CircleUser,
  Inbox,
} from "lucide-react";
import DashboardSidebar, { type SidebarItem } from "@/components/shared/DashboardSidebar";

const menuItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "users", label: "Manajemen Pengguna", icon: Users, href: "/admin/users" },
  { id: "commodities", label: "Komoditas", icon: Boxes, href: "/admin/commodities" },
  { id: "categories", label: "Kategori", icon: Boxes, href: "/admin/categories" },
  { id: "orders", label: "Pesanan", icon: ShoppingBag, href: "/admin/orders" },
  { id: "fees", label: "Fee Transaksi", icon: Percent, href: "/admin/fees" },
  { id: "transactions", label: "Transaksi", icon: ReceiptText, href: "/admin/transactions" },
  { id: "reviews", label: "Ulasan", icon: Star, href: "/admin/reviews" },
  { id: "messages", label: "Pesan Masuk", icon: Inbox, href: "/admin/messages" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/admin/profile" },
];

export default function AdminSidebar() {
  return (
    <DashboardSidebar
      menuItems={menuItems}
      roleLabel="Administrator"
      brandHref="/admin/dashboard"
    />
  );
}

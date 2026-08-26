"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Star,
  Bell,
  CircleUser,
  MessageCircle,
  EllipsisVertical,
  BookOpen,
  CircleQuestionMark,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

const menuItems: SidebarEntry[] = [
  { id: "home", label: "Beranda", icon: LayoutDashboard, href: "/user/home" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/user/chat" },
  { id: "orders", label: "Pesanan Saya", icon: ShoppingBag, href: "/user/orders" },
  { id: "transactions", label: "Riwayat Transaksi", icon: History, href: "/user/transactions" },
  { id: "reviews", label: "Ulasan Saya", icon: Star, href: "/user/reviews" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/user/notifications" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/user/profile" },
  {
    id: "more",
    label: "Lainnya",
    icon: EllipsisVertical,
    children: [
      { id: "guide", label: "Panduan", icon: BookOpen, href: "/user/panduan" },
      { id: "help", label: "Bantuan", icon: CircleQuestionMark, href: "/user/bantuan" },
    ],
  },
];

export default function UserSidebar() {
  return (
    <DashboardSidebar
      menuItems={menuItems}
      roleLabel="Akun Pembeli"
      brandHref="/user/home"
    />
  );
}

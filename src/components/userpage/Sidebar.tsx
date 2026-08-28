"use client";

import {
  LayoutDashboard,
  MessageCircle,
  ShoppingCart,
  ShoppingBag,
  History,
  Star,
  Bell,
  CircleUser,
  BookOpen,
  CircleQuestionMark,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

const menuItems: SidebarEntry[] = [
  { id: "section-utama", label: "Utama" },
  { id: "home", label: "Beranda", icon: LayoutDashboard, href: "/user/home" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/user/chat" },
  { id: "cart", label: "Keranjang", icon: ShoppingCart, href: "/user/cart" },

  { id: "section-belanja", label: "Belanja" },
  { id: "orders", label: "Pesanan Saya", icon: ShoppingBag, href: "/user/orders" },
  { id: "transactions", label: "Riwayat Transaksi", icon: History, href: "/user/transactions" },
  { id: "reviews", label: "Ulasan Saya", icon: Star, href: "/user/reviews" },

  { id: "section-preferensi", label: "Preferensi" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/user/notifications" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/user/profile" },

  { id: "section-bantuan", label: "Bantuan" },
  { id: "guide", label: "Panduan", icon: BookOpen, href: "/user/panduan" },
  { id: "help", label: "Bantuan", icon: CircleQuestionMark, href: "/user/bantuan" },
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
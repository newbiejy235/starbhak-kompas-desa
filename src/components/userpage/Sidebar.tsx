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
  Bookmark,
  CircleQuestionMark,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

const menuItems: SidebarEntry[] = [
  // ── UTAMA ──
  { id: "heading-utama", label: "Utama" },
  { id: "home", label: "Beranda", icon: LayoutDashboard, href: "/user/home" },
  { id: "orders", label: "Pesanan Saya", icon: ShoppingBag, href: "/user/orders" },

  // ── BELANJA ──
  { id: "heading-belanja", label: "Belanja" },
  { id: "transactions", label: "Riwayat Pesanan", icon: History, href: "/user/transactions" },
  { id: "wishlist", label: "Wishlist", icon: Bookmark, href: "/user/wishlist" },

  // ── KOMUNIKASI ──
  { id: "heading-komunikasi", label: "Komunikasi" },
  { id: "chat", label: "Pesan", icon: MessageCircle, href: "/user/chat" },
  { id: "reviews", label: "Ulasan Saya", icon: Star, href: "/user/reviews" },
  { id: "notifications", label: "Notifikasi", icon: Bell, href: "/user/notifications" },

  // ── LAINNYA ──
  { id: "heading-lainnya", label: "Lainnya" },
  { id: "guide", label: "Panduan", icon: BookOpen, href: "/user/panduan" },
  { id: "help", label: "Bantuan", icon: CircleQuestionMark, href: "/user/bantuan" },
  { id: "profile", label: "Profil", icon: CircleUser, href: "/user/profile" },
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
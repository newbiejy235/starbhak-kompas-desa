"use client";

import {
  LayoutDashboard,
  Store,
  Boxes,
  Tags,
  ShoppingBag,
  CreditCard,
  Truck,
  ScrollText,
  Star,
  Inbox,
  Percent,
  CircleUser,
  Users,
} from "lucide-react";
import DashboardSidebar, {
  type SidebarEntry,
} from "@/components/shared/DashboardSidebar";

const menuItems: SidebarEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "management",
    label: "Management",
    children: [
      { id: "farmers", label: "Petani", icon: Store, href: "/admin/farmers" },
      {
        id: "commodities",
        label: "Komoditas",
        icon: Boxes,
        href: "/admin/commodities",
      },
      {
        id: "categories",
        label: "Kategori",
        icon: Tags,
        href: "/admin/categories",
      },
    ],
  },
  {
    id: "transactions",
    label: "Transactions",
    children: [
      { id: "orders", label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
      {
        id: "payments",
        label: "Payments",
        icon: CreditCard,
        href: "/admin/payments",
      },
      {
        id: "distribution",
        label: "Distribution",
        icon: Truck,
        href: "/admin/distribution",
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    children: [
      {
        id: "activity",
        label: "Activity Logs",
        icon: ScrollText,
        href: "/admin/activity",
      },
      {
        id: "transactions",
        label: "Transaksi",
        icon: CreditCard,
        href: "/admin/transactions",
      },
      { id: "reviews", label: "Ulasan", icon: Star, href: "/admin/reviews" },
      {
        id: "messages",
        label: "Pesan Masuk",
        icon: Inbox,
        href: "/admin/messages",
      },
      {
        id: "users",
        label: "Pengguna",
        icon: Users,
        href: "/admin/users",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    children: [
      { id: "fees", label: "Fee Transaksi", icon: Percent, href: "/admin/fees" },
      { id: "profile", label: "Profil", icon: CircleUser, href: "/admin/profile" },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <DashboardSidebar
      menuItems={menuItems}
      roleLabel="Administrator"
      brandHref="/admin"
    />
  );
}
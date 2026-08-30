"use client";

import Link from "next/link";
import {
  MessageCircle,
  Package,
  PackagePlus,
  ShoppingCart,
  ChevronRight
} from "lucide-react";

const ACTIONS = [
  { href: "/petani/commodities/add", icon: PackagePlus, label: "Tambah Produk" },
  { href: "/petani/orders", icon: ShoppingCart, label: "Pesanan" },
  { href: "/petani/stok", icon: Package, label: "Update Stok" },
  { href: "/petani/chat", icon: MessageCircle, label: "Pesan" },
];

/** Aksi cepat yang paling sering dibutuhkan petani. */
export default function QuickActions() {
  return (
    <nav
      aria-label="Aksi cepat"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-gray-200 pb-5 sm:divide-x sm:divide-gray-100"
    >
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-primary sm:px-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <action.icon size={15} />
          </span>
          <span className="truncate group-hover:text-primary">{action.label}</span>
          <ChevronRight
            size={14}
            aria-hidden
            className="shrink-0 text-gray-300 transition-colors duration-150 group-hover:text-primary"
          />
        </Link>
      ))}
    </nav>
  );
}

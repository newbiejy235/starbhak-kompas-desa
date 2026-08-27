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
    <nav aria-label="Aksi cepat" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft transition-all duration-150 ease-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <action.icon size={15} />
            </span>
            <span className="truncate text-sm font-semibold text-gray-700 group-hover:text-primary">
              {action.label}
            </span>
          </span>
          <ChevronRight
            size={15}
            aria-hidden
            className="shrink-0 text-gray-300 transition-colors duration-150 group-hover:text-primary"
          />
        </Link>
      ))}
    </nav>
  );
}

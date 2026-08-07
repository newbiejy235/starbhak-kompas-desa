"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Star,
  Bell,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { clearSession } from "@/lib/auth/client";

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Beranda", icon: LayoutDashboard, href: "/user/home" },
    { id: "orders", label: "Pesanan Saya", icon: ShoppingBag, href: "/user/orders" },
    { id: "transactions", label: "Riwayat Transaksi", icon: History, href: "/user/transactions" },
    { id: "reviews", label: "Ulasan Saya", icon: Star, href: "/user/reviews" },
    { id: "notifications", label: "Notifikasi", icon: Bell, href: "/user/notifications" },
  ];

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const content = (
    <>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href="/user/home" className="text-xl font-bold text-[#025246]">
          Kompas Desa
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
          <X size={20} />
        </button>
      </div>
      <nav className="p-4 flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#025246] text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#025246]"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col">
        {content}
      </aside>
      {isOpen && (
        <>
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform">
            {content}
          </aside>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow text-gray-500"
      >
        <Menu size={22} />
      </button>
    </>
  );
}

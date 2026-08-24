"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { LogOut, X, Menu } from "lucide-react";
import { clearSession, getClientUser } from "@/lib/auth/client";
import Avatar from "@/components/ui/Avatar";

export type SidebarItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  href: string;
};

interface DashboardSidebarProps {
  menuItems: SidebarItem[];
  roleLabel: string;
  brandHref: string;
}

export default function DashboardSidebar({
  menuItems,
  roleLabel,
  brandHref,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const user = getClientUser();

  // Indikator aktif bergeser mulus antar menu (PRD 8.3 & 9.2)
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false });

  const activeItem = menuItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  useEffect(() => {
    if (!activeItem) return;
    const nav = navRef.current;
    const el = itemRefs.current[activeItem.id];
    if (!nav || !el) return;
    setIndicator({ top: el.offsetTop, height: el.offsetHeight, ready: true });
  }, [activeItem]);

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const content = (
    <>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href={brandHref} className="text-xl font-bold text-primary">
          Kompas Desa
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 bg-primary/5 flex items-center gap-3">
        <Avatar src={user?.fotoProfile} name={user?.fullName} size="sm" />
        <div>
          <p className="text-sm font-bold text-gray-800">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{roleLabel}</p>
        </div>
      </div>

      <nav ref={navRef} className="relative p-4 flex flex-col gap-1.5 flex-grow overflow-y-auto">
        {/* Indikator geser via transform saja agar ringan */}
        <span
          aria-hidden
          className="absolute left-0 w-1 rounded-full bg-primary transition-transform duration-300 ease-smooth"
          style={{
            height: indicator.height,
            transform: `translateY(${indicator.top}px)`,
            opacity: indicator.ready && activeItem ? 1 : 0,
          }}
        />
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              ref={(el) => {
                itemRefs.current[item.id] = el;
              }}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-primary/5 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <item.icon size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all duration-150 active:scale-[0.98]"
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
          {/* Drawer mobile slide-in dari kiri (PRD 9.2) */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col animate-drawer-in lg:hidden">
            {content}
          </aside>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-fade-in-fast"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow text-gray-500 active:scale-90 transition-transform"
      >
        <Menu size={22} />
      </button>
    </>
  );
}

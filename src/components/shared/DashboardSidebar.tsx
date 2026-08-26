"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDown, LogOut, X, Menu } from "lucide-react";
import { clearSession, getClientUser } from "@/lib/auth/client";
import Avatar from "@/components/ui/Avatar";

export type SidebarIcon = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}>;

export type SidebarItem = {
  id: string;
  label: string;
  icon: SidebarIcon;
  href: string;
};

/** Item navigasi bertipe grup (collapsible), mis. "Lainnya". */
export type SidebarGroup = {
  id: string;
  label: string;
  icon?: SidebarIcon;
  children: SidebarItem[];
};

export type SidebarEntry = SidebarItem | SidebarGroup;

function isSidebarGroup(item: SidebarEntry): item is SidebarGroup {
  return Array.isArray((item as SidebarGroup).children);
}

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

interface DashboardSidebarProps {
  menuItems: SidebarEntry[];
  roleLabel: string;
  brandHref: string;
}

/** Submenu dengan animasi buka/tutup halus via grid-template-rows. */
function SidebarGroupMenu({
  group,
  pathname,
  registerRef,
  onNavigate,
}: {
  group: SidebarGroup;
  pathname: string;
  registerRef: (id: string, el: HTMLButtonElement | null) => void;
  onNavigate: () => void;
}) {
  const hasActiveChild = group.children.some((c) =>
    matchesRoute(pathname, c.href),
  );
  const [open, setOpen] = useState(hasActiveChild);
  const [wasAutoOpen, setWasAutoOpen] = useState(hasActiveChild);

  // Grup otomatis terbuka saat rute berpindah masuk ke dalam grupnya.
  // Penyesuaian state saat render adalah pola resmi pengganti efek di sini.
  if (hasActiveChild !== wasAutoOpen) {
    setWasAutoOpen(hasActiveChild);
    if (hasActiveChild) setOpen(true);
  }

  const panelId = `sidebar-panel-${group.id}`;

  return (
    <div>
      <button
        ref={(el) => registerRef(group.id, el)}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          hasActiveChild
            ? "text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
        }`}
      >
        {group.icon ? (
          <group.icon size={19} />
        ) : (
          <span aria-hidden className="inline-block w-[19px]" />
        )}
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-gray-400 transition-transform duration-200 ease-smooth ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animasi reveal memakai grid-rows agar tinggi mengikuti konten tanpa JS */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul
            className="ml-[26px] flex flex-col gap-0.5 border-l border-gray-200/80 py-1 pl-3"
            aria-label={group.label}
          >
            {group.children.map((child) => {
              const active = matchesRoute(pathname, child.href);
              return (
                <li key={child.id}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                      active
                        ? "bg-primary/5 font-semibold text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                    }`}
                  >
                    <child.icon
                      size={17}
                      strokeWidth={active ? 2.25 : 2}
                      className="shrink-0"
                    />
                    <span className="truncate">{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
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

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const registerItemRef = (id: string, el: HTMLElement | null) => {
    itemRefs.current[id] = el;
  };
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false });

  // Rute aktif bisa berada pada item biasa maupun di dalam grup.
  const activeEntry = menuItems.find((item) =>
    isSidebarGroup(item)
      ? item.children.some((c) => matchesRoute(pathname, c.href))
      : matchesRoute(pathname, item.href),
  );

  useEffect(() => {
    if (!activeEntry) return;
    const nav = navRef.current;
    const el = itemRefs.current[activeEntry.id];
    if (!nav || !el) return;

    setIndicator({
      top: el.offsetTop - 16,
      height: el.offsetHeight,
      ready: true
    });
  }, [activeEntry]);

  const logout = () => {
    clearSession();
    router.replace("/auth/login");
  };

  const content = (
    <>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href={brandHref} className="text-xl font-bold text-primary">
          KompasDesa
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
            opacity: indicator.ready && activeEntry ? 1 : 0,
          }}
        />
        {menuItems.map((item) => {
          if (isSidebarGroup(item)) {
            return (
              <div
                key={item.id}
                className={item === menuItems[menuItems.length - 1] ? "border-t border-gray-200/80 pt-2 mt-2" : ""}
              >
                <SidebarGroupMenu
                  group={item}
                  pathname={pathname}
                  registerRef={registerItemRef}
                  onNavigate={() => setIsOpen(false)}
                />
              </div>
            );
          }

          const active = matchesRoute(pathname, item.href);
          return (
            <Link
              key={item.id}
              ref={(el) => registerItemRef(item.id, el)}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${active
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

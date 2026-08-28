"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useActionState } from "react";

import {
  Search,
  ShoppingCart,
  Bell,
  LogOut,
  ChevronDown,
  UserRound,
  ShoppingBag,
  Star,
  Sprout,
  X,
  LifeBuoy,
} from "lucide-react";

import { clearSession, updateSessionRole } from "@/lib/auth/client";
import { becomePetaniAction } from "@/actions/auth";
import { getUnreadNotificationCount } from "@/actions/notification";
import { useAuth, useFetch } from "@/lib/hooks";

import Avatar from "@/components/ui/Avatar";
import SearchRecommendationDropdown from "@/components/userpage/SearchRecommendationDropdown";

import type { ActionState } from "@/lib/types/auth";

/* ============================================================
   Token desain mengikuti DashboardShell / halaman petani
   ============================================================ */

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

const iconBtn = `relative rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-white/80 hover:text-primary active:scale-95 ${focusRing}`;

/* ============================================================
   Pencarian
   ============================================================ */

export function HeaderSearch() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setDropdownOpen(false);

    const q = search.trim();

    if (q) {
      router.push(`/user/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/home");
    }
  };

  const handleChange = (value: string) => {
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const q = value.trim();

    if (q && q.length >= 2) {
      debounceRef.current = setTimeout(() => {
        router.push(`/user/search?q=${encodeURIComponent(q)}`);
      }, 800);
    }
  };

  const handleFocus = () => {
    setDropdownOpen(true);
  };

  const handleSelect = (value: string) => {
    setSearch(value);
    setDropdownOpen(false);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={submitSearch}
      role="search"
      className="hidden flex-1 mx-4 sm:relative sm:block lg:mx-8"
    >
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        placeholder="Cari komoditas atau petani..."
        aria-label="Cari komoditas atau petani"
        className={`h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${focusRing}`}
      />

      <SearchRecommendationDropdown
        query={search}
        isOpen={dropdownOpen}
        onClose={handleDropdownClose}
        onSelect={handleSelect}
        inputRef={inputRef}
      />
    </form>
  );
}

/* ============================================================
   Menu profile
   ============================================================ */

const menuItems = [
  {
    href: "/user/profile",
    label: "Profil Saya",
    icon: UserRound,
  },
  {
    href: "/user/orders",
    label: "Pesanan Saya",
    icon: ShoppingBag,
  },
  {
    href: "/user/favorites",
    label: "Favorit",
    icon: Star,
  },
];

/* ============================================================
   Tombol aksi:
   - Keranjang
   - Notifikasi
   - Profile dropdown
   - Daftar menjadi petani
   ============================================================ */

export function HeaderActions() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = useFetch(
    () =>
      user
        ? getUnreadNotificationCount(user.id)
        : Promise.resolve(0),
    [user?.id, pathname],
  );

  const unread = Number(unreadCount ?? 0);

  /* ============================================================
     Tutup dropdown ketika klik di luar
     ============================================================ */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ============================================================
     Logout
     ============================================================ */

  const logout = async () => {
    setMenuOpen(false);

    await clearSession();

    router.push("/login");
    router.refresh();
  };

  /* ============================================================
     Modal
     ============================================================ */

  const closeModal = () => {
    setClosingModal(true);

    setTimeout(() => {
      setModalOpen(false);
      setClosingModal(false);
    }, 200);
  };

  return (
    <>
      <div className="flex flex-shrink-0 items-center gap-0.5">
        {/* ======================================================
            Keranjang
            ====================================================== */}

        <Link
          href="/user/cart"
          aria-label="Keranjang belanja"
          aria-current={
            pathname.startsWith("/user/cart")
              ? "page"
              : undefined
          }
          className={`${iconBtn} ${pathname.startsWith("/user/cart")
            ? "bg-primary/10 text-primary"
            : ""
            }`}
        >
          <ShoppingCart size={19} />
        </Link>

        {/* ======================================================
            Notifikasi
            ====================================================== */}

        <Link
          href="/user/notifications"
          aria-label={
            unread > 0
              ? `Notifikasi (${unread} belum dibaca)`
              : "Notifikasi"
          }
          aria-current={
            pathname.startsWith("/user/notifications")
              ? "page"
              : undefined
          }
          className={`${iconBtn} ${pathname.startsWith("/user/notifications")
            ? "bg-primary/10 text-primary"
            : ""
            }`}
        >
          <Bell size={19} />

          {unread > 0 && (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        {/* ======================================================
            Profile
            ====================================================== */}

        <div
          className="relative ml-1"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`flex items-center gap-2 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-white/80 active:scale-95 ${focusRing}`}
          >
            <Avatar
              src={user?.fotoProfile}
              name={user?.fullName || "U"}
              size="sm"
            />

            <span className="hidden max-w-[140px] truncate text-sm font-semibold text-neutral-900 sm:block">
              {user?.fullName || "Pengguna"}
            </span>

            <ChevronDown
              size={15}
              aria-hidden
              className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* ====================================================
              Dropdown Menu
              ==================================================== */}

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-64 origin-top-right overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-lift animate-scale-in"
            >
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="truncate text-sm font-bold text-gray-900">
                  {user?.fullName || "Pengguna"}
                </p>

                <p className="truncate text-xs text-gray-400">
                  {user?.email}
                </p>
              </div>

              <nav className="flex flex-col gap-1 p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-primary/5 hover:text-primary ${focusRing}`}
                  >
                    <item.icon
                      size={18}
                      aria-hidden
                    />

                    {item.label}
                  </Link>
                ))}

                {/* ==================================================
                    Jadi Petani
                    ================================================== */}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setModalOpen(true);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-primary/5 hover:text-primary ${focusRing}`}
                >
                  <Sprout
                    size={18}
                    aria-hidden
                  />

                  Jadi Petani
                </button>
              </nav>

              {/* ==================================================
                  Logout
                  ================================================== */}

              <div className="border-t border-gray-100 p-2">
                <button
                  type="button"
                  onClick={logout}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/5 ${focusRing}`}
                >
                  <LogOut
                    size={18}
                    aria-hidden
                  />

                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================================
          Modal Daftar Jadi Petani
          ========================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closingModal
              ? "animate-fade-out"
              : "animate-fade-in-fast"
              }`}
            onClick={closeModal}
            aria-hidden
          />

          <div
            className={`relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ${closingModal
              ? "animate-scale-out"
              : "animate-scale-in"
              }`}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Tutup"
              className={`absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 ${focusRing}`}
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sprout size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Jadi Petani di Kompas Desa
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Daftarkan akun Anda sebagai petani untuk mulai
              menjual hasil pertanian dan menjangkau lebih banyak
              pembeli.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateSessionRole("petani");

                    router.push("/petani");
                    router.refresh();
                  } catch (error) {
                    console.error(
                      "Gagal mengubah role:",
                      error,
                    );
                  }
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
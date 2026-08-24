"use client"

import { Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect, useSyncExternalStore, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  {
    href: "#tentang",
    label: "Tentang",
    hasDropdown: true,
    options: [
      { href: "#layanan-1", label: "E-Commerce Pertanian" },
      { href: "#layanan-2", label: "Konsultasi Ahli Tani" },
      { href: "#layanan-3", label: "Distribusi Hasil Panen" },
      { href: "#layanan-4", label: "Pelatihan & Edukasi" },
    ]
  },
  { href: "#layanan", label: "Layanan" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#kontak", label: "Kontak" },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("#beranda")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileLayananOpen, setIsMobileLayananOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const role = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("user_role"),
    () => null,
  )

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20)
        ticking = false
      })
    }

    // Tutup dropdown saat klik di luar
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false)
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "petani"
        ? "/petani/dashboard"
        : role === "pembeli"
          ? "/user/home"
          : null

  return (
    <>
      <nav
        className={`
    fixed left-1/2 -translate-x-1/2 z-[999]
    px-8 flex items-center justify-between gap-6 rounded-2xl
    transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

    ${isScrolled
            ? "top-3 sm:top-4 w-[92%] sm:w-[88%] md:w-[85%] lg:w-[1112px] py-2.5 md:py-3 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            : "top-6 w-[95%] md:w-[92%] lg:w-[1200px] py-4 bg-white shadow-none"
          }
  `}
      >
        <div className="flex items-center gap-6">
          <div className="font-bold text-xl lg:text-[23px] tracking-tight whitespace-nowrap flex items-center gap-3">
            <Image
              src="/logo-kompas-desa/kompas_desa_icon_color.png"
              width={30}
              height={30}
              alt="Logo KompasDesa"
              className="w-[25px] h-[25px] object-contain"
            />
            <span>KompasDesa</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 font-semibold text-base">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              const isTentangActive =
                activeLink === "#tentang" || activeLink.startsWith("#layanan-")

              return (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen)
                      setActiveLink("#tentang")
                    }}
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    className={`flex items-center gap-1.5 relative pb-1 transition-colors duration-300
          after:content-['']
          after:absolute
          after:left-0
          after:-bottom-0.5
          after:h-[2.5px]
          after:bg-[#025246]
          after:rounded-full
          after:transition-all
          after:duration-300
          ${isTentangActive
                        ? "text-[#025246] after:w-full"
                        : "text-[#1D1D1D] hover:text-[#025246] after:w-0 hover:after:w-full"
                      }`}
                  >
                    {link.label}

                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                    >
                      {link.options?.map((option) => (
                        <a
                          key={option.href}
                          href={option.href}
                          role="menuitem"
                          onClick={() => {
                            setActiveLink(option.href)
                            setIsDropdownOpen(false)
                          }}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#025246]/10 hover:text-[#025246] font-medium transition-colors"
                        >
                          {option.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveLink(link.href)}
                className={`relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2.5px] after:bg-[#025246] after:transition-all after:duration-300 after:rounded-full ${activeLink === link.href
                  ? "text-[#025246] after:w-full"
                  : "text-[#1D1D1D] hover:text-[#025246] after:w-0 hover:after:w-full"
                  }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-6">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden sm:flex items-center justify-center bg-[#025246] text-white font-bold text-sm lg:text-base px-5 py-2 rounded-xl hover:bg-[#024036] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Masuk
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center justify-center bg-[#025246] text-white font-bold text-base lg:text-lg px-6 py-2 rounded-xl hover:bg-[#024036] hover:scale-105 transition-all duration-300 shadow-md shadow-[#025246]/30 cursor-pointer"
            >
              Masuk
            </Link>
          )}

          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden bg-[#025246] p-2 rounded-full hover:scale-105 transition-transform duration-300 shadow-md shadow-[#025246]/30 cursor-pointer"
          >
            {isMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[990] md:hidden transition-opacity duration-300"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        inert={!isMenuOpen}
        className={`fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl z-[999] shadow-2xl
        transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden overflow-y-auto
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <span className="font-bold text-xl tracking-tight">
            <span>KompasDesa</span>
          </span>

          <button
            onClick={toggleMenu}
            className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors duration-300"
          >
            <X size={20} className="text-[#025246] hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="flex flex-col py-6 px-3 gap-2">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div key={link.href} className="flex flex-col">
                  <button
                    onClick={() => setIsMobileLayananOpen(!isMobileLayananOpen)}
                    className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between ${activeLink.startsWith("#layanan")
                      ? "text-[#025246] bg-[#025246]/10"
                      : "text-gray-600 hover:text-[#025246] hover:bg-gray-50"
                      }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${isMobileLayananOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isMobileLayananOpen && (
                    <div className="flex flex-col pl-4 py-1 gap-1">
                      {link.options?.map((option) => (
                        <a
                          key={option.href}
                          href={option.href}
                          onClick={() => {
                            setActiveLink(option.href)
                            toggleMenu()
                          }}
                          className="px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:text-[#025246] hover:bg-gray-50 font-medium transition-colors"
                        >
                          - {option.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.href)
                  toggleMenu()
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${activeLink === link.href
                  ? "text-[#025246] bg-[#025246]/10 translate-x-2"
                  : "text-gray-600 hover:text-[#025246] hover:bg-gray-50 hover:translate-x-1"
                  }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-200/50 bg-white/50">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="flex w-full items-center justify-center bg-[#025246] hover:bg-[#024036] text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#025246]/30 hover:shadow-[#025246]/50"
            >
              Dasbor Saya
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center bg-[#025246] hover:bg-[#024036] text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#025246]/30 hover:shadow-[#025246]/50"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
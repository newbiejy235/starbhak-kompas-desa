"use client"

import { Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

interface DropdownOption {
  href: string
  label: string
}

interface NavLink {
  href: string
  label: string
  hasDropdown?: boolean
  options?: DropdownOption[]
}

const navLinks: NavLink[] = [
  { href: "#beranda", label: "Beranda" },
  {
    href: "#tentang",
    label: "Jelajahi",
    hasDropdown: true,
    options: [
      { href: "#tentang", label: "Mengenal KompasDesa" },
      { href: "#alurweb", label: "Bagaimana Kami Bekerja" },
      { href: "#komoditaslist", label: "Jelajah Komoditas" },
      { href: "#keamanan", label: "Mengapa KompasDesa" },
    ],
  },
  { href: "#layanan", label: "Layanan" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "/kompas-desa/contact", label: "Kontak" },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("#beranda")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileJelajahiOpen, setIsMobileJelajahiOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const role = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("user_role"),
    () => null,
  )

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [])

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

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

  // Scroll spy observer
  useEffect(() => {
    const sectionIds = ["beranda", "tentang", "alurweb", "komoditaslist", "keamanan", "layanan", "testimoni"]
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveLink(`#${entry.target.id}`)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (href: string) => {
    setActiveLink(href)
    setIsDropdownOpen(false)
    if (isMenuOpen) toggleMenu()
  }

  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "petani"
        ? "/petani/dashboard"
        : role === "pembeli"
          ? "/user/home"
          : null

  const isJelajahiActive =
    activeLink === "#tentang" ||
    activeLink === "#alurweb" ||
    activeLink === "#komoditaslist" ||
    activeLink === "#keamanan"

  return (
    <>
      <nav
        className={`
          fixed left-1/2 -translate-x-1/2 z-[999]
          px-6 sm:px-8 flex items-center justify-between gap-6 rounded-3xl
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

          ${isScrolled
            ? "top-3 sm:top-4 w-[92%] sm:w-[88%] md:w-[85%] lg:w-[1112px] py-2.5 md:py-3 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/40"
            : "top-6 w-[95%] md:w-[92%] lg:w-[1200px] py-4 bg-white shadow-none"
          }
        `}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-xl lg:text-[23px] tracking-tight whitespace-nowrap">
          <Image
            src="/logo-kompas-desa/kompas_desa_icon_color.png"
            width={30}
            height={30}
            alt="Logo KompasDesa"
            className="w-[25px] h-[25px] object-contain"
            priority
          />
          <span>KompasDesa</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 font-semibold text-base">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    className={`flex items-center gap-1.5 relative pb-1 transition-colors duration-300
                      after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2.5px] after:bg-[#025246] after:rounded-full after:transition-all after:duration-300
                      ${isJelajahiActive
                        ? "text-[#025246] after:w-full"
                        : "text-[#1D1D1D] hover:text-[#025246] after:w-0 hover:after:w-full"
                      }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                    >
                      {link.options?.map((option) => (
                        <a
                          key={option.href}
                          href={option.href}
                          role="menuitem"
                          onClick={() => handleNavClick(option.href)}
                          className={`block px-4 py-2.5 text-sm font-medium transition-colors ${activeLink === option.href
                            ? "bg-[#025246]/10 text-[#025246]"
                            : "text-gray-700 hover:bg-[#025246]/10 hover:text-[#025246]"
                            }`}
                        >
                          {option.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            const isExternalOrRoute = link.href.startsWith("/")

            return isExternalOrRoute ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setActiveLink(link.href)}
                className={`relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2.5px] after:bg-[#025246] after:transition-all after:duration-300 after:rounded-full ${activeLink === link.href
                  ? "text-[#025246] after:w-full"
                  : "text-[#1D1D1D] hover:text-[#025246] after:w-0 hover:after:w-full"
                  }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
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

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={dashboardHref || "/auth/login"}
            className="hidden sm:flex items-center justify-center bg-[#025246] text-white font-bold text-sm lg:text-base px-5 py-2 rounded-xl hover:bg-[#024036] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-[#025246]/20 cursor-pointer"
          >
            {dashboardHref ? "Dasbor Saya" : "Masuk"}
          </Link>

          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden bg-[#025246] p-2 rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-md shadow-[#025246]/30 cursor-pointer"
          >
            {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>
      </nav>

      {/* Overlay Mobile */}
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
        aria-hidden={!isMenuOpen}
        className={`fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl z-[999] shadow-2xl
        transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden overflow-y-auto flex flex-col justify-between
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div>
          <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
            <span className="font-bold text-xl tracking-tight">KompasDesa</span>
            <button
              onClick={toggleMenu}
              className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors duration-300"
            >
              <X size={20} className="text-[#025246]" />
            </button>
          </div>

          <div className="flex flex-col py-6 px-3 gap-2">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div key={link.href} className="flex flex-col">
                    <button
                      onClick={() => setIsMobileJelajahiOpen((prev) => !prev)}
                      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between ${isJelajahiActive
                        ? "text-[#025246] bg-[#025246]/10"
                        : "text-gray-600 hover:text-[#025246] hover:bg-gray-50"
                        }`}
                    >
                      {link.label}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isMobileJelajahiOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobileJelajahiOpen && (
                      <div className="flex flex-col pl-4 py-1 gap-1">
                        {link.options?.map((option) => (
                          <a
                            key={option.href}
                            href={option.href}
                            onClick={() => handleNavClick(option.href)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeLink === option.href
                              ? "text-[#025246] bg-[#025246]/10"
                              : "text-gray-600 hover:text-[#025246] hover:bg-gray-50"
                              }`}
                          >
                            - {option.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              const isExternalOrRoute = link.href.startsWith("/")

              return isExternalOrRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${activeLink === link.href
                    ? "text-[#025246] bg-[#025246]/10 translate-x-2"
                    : "text-gray-600 hover:text-[#025246] hover:bg-gray-50 hover:translate-x-1"
                    }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
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
        </div>

        <div className="p-6 border-t border-gray-200/50 bg-white/50">
          <Link
            href={dashboardHref || "/auth/login"}
            onClick={toggleMenu}
            className="flex w-full items-center justify-center bg-[#025246] hover:bg-[#024036] text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#025246]/30"
          >
            {dashboardHref ? "Dasbor Saya" : "Masuk"}
          </Link>
        </div>
      </div>
    </>
  )
}
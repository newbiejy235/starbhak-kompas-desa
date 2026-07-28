"use client"

import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
})

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#layanan", label: "Layanan" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#kontak", label: "Kontak" },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("#beranda")
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`${inter.className} fixed left-1/2 -translate-x-1/2 z-[999] w-[95%] md:w-[90%] lg:w-[1112px]
        px-8 flex items-center justify-between gap-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          isScrolled
            ? "top-4 py-3 bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            : "top-6 py-5 bg-[#F6F6F6] border border-transparent shadow-none"
        }`}
      >
        <div className="flex items-center gap-6">
          <div className="font-bold text-2xl lg:text-[28px] tracking-tight whitespace-nowrap">
            <span className="text-[#025246]">Kompas` </span>
            <span className="text-[#D7BE44]">Desa</span>
          </div>
          <div className="hidden md:block h-8 w-[1.5px] bg-gray-300"></div>
        </div>

        <div className="hidden md:flex items-center gap-10 lg:gap-14 font-semibold text-base lg:text-lg">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2.5px] after:bg-[#025246] after:transition-all after:duration-300 after:rounded-full ${
                activeLink === link.href
                  ? "text-[#025246] after:w-full"
                  : "text-[#1D1D1D] hover:text-[#025246] after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block h-8 w-[1.5px] bg-gray-300"></div>

          <Link href="/auth/loginx">
            <button className="hidden sm:flex items-center justify-center bg-transparent text-[#025246] font-bold text-base lg:text-lg hover:text-[#D7BE44] hover:scale-105 transition-all duration-300">
              Masuk
            </button>
          </Link>

          <button
            onClick={toggleMenu}
            className="md:hidden bg-[#025246] p-2 rounded-full hover:scale-105 transition-transform duration-300 shadow-md shadow-[#025246]/30"
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
        />
      )}

      <div
        className={`${inter.className} fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl z-[999] shadow-2xl
        transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <span className="font-bold text-xl tracking-tight">
            <span className="text-[#025246]">Kompas&apos; </span>
            <span className="text-[#D7BE44]">Desa</span>
          </span>
          <button
            onClick={toggleMenu}
            className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors duration-300"
          >
            <X size={20} className="text-[#025246] hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="flex flex-col py-6 px-3 gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                setActiveLink(link.href)
                toggleMenu()
              }}
              className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                activeLink === link.href
                  ? "text-[#025246] bg-[#025246]/10 translate-x-2"
                  : "text-gray-600 hover:text-[#025246] hover:bg-gray-50 hover:translate-x-1"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-200/50 bg-white/50">
          <Link href="/auth/login">
            <button className="w-full bg-[#025246] hover:bg-[#024036] text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#025246]/30 hover:shadow-[#025246]/50">
              Masuk
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
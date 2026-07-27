"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <nav className={`${inter.className} fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-[1112px]
      bg-[#F6F6F6] px-8 py-5
      flex items-center justify-between gap-6
      rounded-full`}>

        <div className="flex items-center gap-6">
          <div className="font-bold text-2xl lg:text-[28px] tracking-tight whitespace-nowrap">
            <span className="text-[#025246]">Kompas` </span>
            <span className="text-[#D7BE44]">Desa</span>
          </div>
          <div className="hidden md:block h-10 w-[1.5px] bg-gray-300"></div>
        </div>

        <div className="hidden md:flex items-center gap-10 lg:gap-14 font-semibold text-base lg:text-lg">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`relative pb-1 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:bg-[#025246] after:transition-all after:duration-300 ${
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
          <div className="hidden md:block h-10 w-[1.5px] bg-gray-300"></div>

          <Link href="/auth/login">
            <button className="hidden sm:flex text-[#025246] font-bold text-base lg:text-lg hover:opacity-70 transition-opacity duration-200">
              Masuk
            </button>
          </Link>

          <button
            onClick={toggleMenu}
            className="md:hidden bg-[#025246] p-2 rounded-full"
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
          className="fixed inset-0 bg-black/40 z-[60] md:hidden"
          onClick={toggleMenu}
        />
      )}

      <div className={`${inter.className} fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-xl
      transform transition-transform duration-300 md:hidden
      ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>

        <div className="flex justify-between items-center p-5 border-b">
          <span className="font-bold text-lg">
            <span className="text-[#025246]">Kompas&apos; </span>
            <span className="text-[#D7BE44]">Desa</span>
          </span>
          <button onClick={toggleMenu}>
            <X size={22} className="text-[#025246]" />
          </button>
        </div>

        <div className="flex flex-col py-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                setActiveLink(link.href)
                toggleMenu()
              }}
              className={`px-6 py-3 font-semibold transition-colors duration-200 border-l-4 ${
                activeLink === link.href
                  ? "text-[#025246] bg-gray-100 border-[#025246]"
                  : "text-[#1D1D1D] hover:text-[#025246] hover:bg-gray-100 border-transparent"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-auto p-6 border-t">
          <Link href="/auth/login">
            <button className="w-full bg-[#025246] text-white py-3 rounded-full font-semibold">
              Masuk
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
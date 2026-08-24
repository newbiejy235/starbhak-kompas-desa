import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "KompasDesa — Platform Digital Pertanian Desa",
    template: "%s | KompasDesa",
  },
  description:
    "Marketplace hasil panen yang menghubungkan petani dan pembeli secara langsung — jual beli komoditas pertanian dengan distribusi yang aman, transparan, dan efisien.",
  icons: {
    icon: "/logo-kompas-desa/kompas_desa_icon_color.png",
  },
  openGraph: {
    title: "KompasDesa — Platform Digital Pertanian Desa",
    description:
      "Menghubungkan petani dengan berbagai pembeli melalui sistem distribusi yang aman, transparan, dan efisien.",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo-kompas-desa/kompas_desa_icon_color.png",
        width: 512,
        height: 512,
        alt: "KompasDesa",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-jakarta selection:bg-[#025246] selection:text-white">
        {children}
      </body>
    </html>
  );
}
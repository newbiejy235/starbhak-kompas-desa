import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Kompas Desa — Platform Digital Pertanian Desa",
  description: "Website Kompas Desa",
  icons: {
    icon: "/images/joni.svg", 
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
      className={`${jakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-jakarta selection:bg-[#025246] selection:text-white">
        {children}
      </body>
    </html>
  );
}
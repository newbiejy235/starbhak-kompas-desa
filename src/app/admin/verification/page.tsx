"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminVerificationPage() {
  // Extract filter and ID dari path URL
  const pathname = usePathname();
  const urlParts = pathname.split("/").filter(Boolean); // ["admin", "verification", ...]
  const filter = urlParts.includes("commodities") ? "commodities" : "farmers";
  const lastSegment = urlParts[urlParts.length - 1];
  const id = lastSegment === "farmers" || lastSegment === "commodities" ? null : lastSegment;

  const pageContent = () => {
    if (filter === "farmers" && id) {
      return (
        <div className="bg-white rounded-lg border border-gray-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Verifikasi Petani ID: {id}
          </h2>
          <p className="text-sm text-gray-500">
            Menampilkan halaman verifikasi petani untuk ID: {id}
          </p>
          <p className="mt-3 text-sm">
            <Link href="/admin/farmers" className="text-primary hover:text-primary-600 font-medium">
              Kelola Petani
            </Link>
          </p>
        </div>
      );
    } else if (filter === "farmers") {
      return (
        <div className="bg-white rounded-lg border border-gray-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Petani Menunggu Verifikasi</h2>
          <p className="text-sm text-gray-500">
            {formatNumber(10)} petani menunggu verifikasi akun.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/admin/verification?filter=farmers" className="text-primary hover:text-primary-600 font-medium">
              Lihat Semua
            </Link>
          </p>
        </div>
      );
    } else if (filter === "commodities" && id) {
      return (
        <div className="bg-white rounded-lg border border-gray-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Verifikasi Komoditas ID: {id}
          </h2>
          <p className="text-sm text-gray-500">
            Menampilkan halaman verifikasi komoditas untuk ID: {id}
          </p>
          <p className="mt-3 text-sm">
            <Link href="/admin/commodities" className="text-primary hover:text-primary-600 font-medium">
              Kelola Komoditas
            </Link>
          </p>
        </div>
      );
    } else if (filter === "commodities") {
      return (
        <div className="bg-white rounded-lg border border-gray-200/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Komoditas Menunggu Verifikasi</h2>
          <p className="text-sm text-gray-500">
            {formatNumber(5)} komoditas menunggu verifikasi.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/admin/verification?filter=commodities" className="text-primary hover:text-primary-600 font-medium">
              Lihat Semua
            </Link>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4 mb-6">
        <Link
          href="/admin/verification/farmers"
          className="flex-1 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-primary text-white"
        >
          Petani
        </Link>
        <Link
          href="/admin/verification/commodities"
          className="flex-1 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-primary text-white"
        >
          Komoditas
        </Link>
      </div>

      {pageContent()}
    </div>
  );
}
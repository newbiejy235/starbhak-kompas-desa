"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminVerificationFarmerPage() {
  // Extract ID dari path URL: /admin/verification/farmers/19
  const pathname = usePathname();
  const urlParts = pathname.split("/").filter(Boolean);
  const lastSegment = urlParts[urlParts.length - 1];
  const id = lastSegment === "farmers" ? null : lastSegment;

  if (!id) return <div className="p-6">ID verifikasi tidak ditemukan</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">
        Verifikasi Petani ID: {id}
      </h1>
      <div className="bg-white rounded-lg border border-gray-200/80 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Data Petani</h2>
        <p className="text-sm text-gray-500">
          Menampilkan detail petani ID: <strong>{id}</strong>
        </p>
        <p className="text-sm text-gray-400">
          Gunakan menu "Kelola Petani" untuk mengelola petani lengkap.
        </p>
        <div className="mt-4">
          <Link
            href="/admin/farmers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-primary text-white"
          >
            Kelola Petani
          </Link>
        </div>
      </div>
    </div>
  );
}
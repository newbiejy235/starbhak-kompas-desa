"use client";

import { Toaster } from "sonner";
import {
  Check,
  CircleAlert,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

/**
 * Toaster global KompasDesa.
 *
 * Dipasang SATU kali di src/app/layout.tsx.
 * Halaman mana pun cukup memanggil:
 *
 *   import { toast } from "sonner";
 *   toast.success("Data berhasil disimpan");
 */
export default function Sonner() {
  return (
    <Toaster
      position="bottom-right"
      visibleToasts={3}
      closeButton
      duration={4000}
      icons={{
        success: (
          <Check size={17} strokeWidth={2.75} className="text-emerald-600" />
        ),
        error: (
          <CircleAlert
            size={17}
            strokeWidth={2.25}
            className="text-red-600"
          />
        ),
        warning: (
          <TriangleAlert
            size={17}
            strokeWidth={2.25}
            className="text-amber-500"
          />
        ),
        info: <Info size={17} strokeWidth={2.25} className="text-primary" />,
        loading: (
          <LoaderCircle size={17} className="animate-spin text-primary" />
        ),
      }}
      toastOptions={{
        style: {
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          color: "#111827",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
          padding: "14px 16px",
          gap: "12px",
        },
        classNames: {
          title: "text-sm font-semibold text-gray-900",
          description: "text-xs leading-relaxed text-gray-500",
          closeButton:
            "!h-5 !w-5 !bg-white !border-gray-200 !text-gray-400 hover:!text-gray-700 focus-visible:!ring-2 focus-visible:!ring-primary/40",
        },
      }}
    />
  );
}

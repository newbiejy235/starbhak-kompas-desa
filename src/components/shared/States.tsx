import { Loader2, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#025246] mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = "Belum Ada Data",
  message = "Data belum tersedia saat ini.",
  children,
}: {
  title?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center w-full">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-bold text-[#111111] mb-2">{title}</h2>
      <p className="text-gray-500 text-sm max-w-md">{message}</p>
      {children}
    </div>
  );
}

export function formatImage(src?: string | null) {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("/") || src.startsWith("http")) {
    return src;
  }
  return src;
}

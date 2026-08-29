import { CircleAlert, Loader2, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
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

export function ErrorState({
  title = "Terjadi kesalahan",
  message = "Data belum dapat dimuat. Silakan coba lagi.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center w-full">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <CircleAlert className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-[#111111] mb-2">{title}</h2>
      <p className="text-gray-500 text-sm max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-smooth hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97]"
        >
          Coba Lagi
        </button>
      )}
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

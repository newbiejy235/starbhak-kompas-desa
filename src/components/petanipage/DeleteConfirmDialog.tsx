"use client";

import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  commodityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function DeleteConfirmDialog({
  open,
  commodityName,
  onConfirm,
  onCancel,
  isPending,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={!isPending ? onCancel : undefined}
      />
      <div className="relative bg-white rounded-card shadow-lift w-full max-w-sm mx-4 p-6 animate-scale-in">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 mb-4 mx-auto animate-pulse-soft">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Hapus Komoditas?
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Apakah Anda yakin ingin menghapus{" "}
          <span className="font-medium text-gray-700">{commodityName}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-danger text-sm font-medium text-white hover:bg-danger/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface CancelDialogProps {
  orderCode: string;
  onConfirm: () => Promise<void>;
  onDismiss: () => void;
}

export default function CancelDialog({
  orderCode,
  onConfirm,
  onDismiss,
}: CancelDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in-fast"
        onClick={submitting ? undefined : onDismiss}
      />
      <div
        role="alertdialog"
        aria-labelledby="cancel-dialog-title"
        className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lift animate-scale-in"
      >
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-danger" />
          <h3 id="cancel-dialog-title" className="font-bold text-gray-900">
            Batalkan pesanan?
          </h3>
        </div>
        <p className="mb-5 text-sm text-gray-500">
          Pesanan <span className="font-semibold text-gray-800">{orderCode}</span>{" "}
          akan dibatalkan, stok komoditas dikembalikan, dan pembeli akan diberi
          tahu. Tindakan ini tidak bisa dibatalkan kembali.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            disabled={submitting}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

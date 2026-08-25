"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Penjelasan dampak aksi, ditulis dengan bahasa yang jelas. */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

/**
 * Dialog konfirmasi untuk aksi berisiko (hapus, batal, ubah status penting).
 * Pola visual sama dengan CancelDialog & DeleteConfirmDialog agar konsisten.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const busy = isPending || submitting;

  if (!open) return null;

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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in-fast"
        onClick={busy ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lift animate-scale-in"
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle size={20} className="text-danger" />
          </span>
          <h3 id="confirm-dialog-title" className="pt-1.5 font-bold text-gray-900">
            {title}
          </h3>
        </div>
        <p
          id="confirm-dialog-message"
          className="mb-5 break-words text-sm text-gray-500"
        >
          {message}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {busy ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

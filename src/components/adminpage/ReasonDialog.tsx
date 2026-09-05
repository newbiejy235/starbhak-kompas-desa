"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReasonDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** Warna aksi konfirmasi. */
  tone?: "danger" | "success" | "primary";
  /** Jika true, alasan WAJIB diisi sebelum submit. */
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

/**
 * Dialog konfirmasi untuk aksi sensitif (Approve/Reject/Suspend/Restore).
 * - Approve: konfirmasi biasa.
 * - Reject / Suspend: wajib memberikan alasan.
 * Menggantikan window.confirm() sesuai PRD.
 */
export default function ReasonDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = "danger",
  requireReason = false,
  reasonPlaceholder = "Tuliskan alasan (wajib diisi)...",
  onConfirm,
  onCancel,
  isPending = false,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset alasan saat dialog baru dibuka (pola penyesuaian state saat render,
  // bukan setState dalam effect)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setReason("");
  }

  if (!open) return null;

  const busy = isPending || submitting;
  const invalid = requireReason && reason.trim().length < 5;

  const handleConfirm = async () => {
    if (invalid) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  const toneCls = {
    danger: "bg-danger hover:brightness-95",
    success: "bg-success hover:brightness-95",
    primary: "bg-primary hover:bg-primary-dark",
  }[tone];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in-fast"
        onClick={busy ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-labelledby="reason-dialog-title"
        aria-describedby="reason-dialog-message"
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lift animate-scale-in"
      >
        <div className="mb-3 flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              tone === "success"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            <AlertTriangle size={20} />
          </span>
          <h3 id="reason-dialog-title" className="pt-1.5 font-bold text-gray-900">
            {title}
          </h3>
        </div>

        <p
          id="reason-dialog-message"
          className="mb-4 break-words text-sm text-gray-500"
        >
          {message}
        </p>

        {requireReason && (
          <div className="mb-4">
            <label
              htmlFor="reason-input"
              className="mb-1.5 block text-xs font-semibold text-gray-600"
            >
              Alasan <span className="text-danger">*</span>
            </label>
            <textarea
              id="reason-input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={busy}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                invalid
                  ? "border-danger focus:border-danger focus:ring-danger/10"
                  : "border-gray-200 focus:border-primary focus:ring-primary/10"
              }`}
            />
            {invalid && (
              <p className="mt-1 text-xs text-danger">
                Alasan minimal 5 karakter dan wajib diisi.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || invalid}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${toneCls}`}
          >
            {busy && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {busy ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
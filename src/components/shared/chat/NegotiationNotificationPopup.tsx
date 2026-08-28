"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { formatRupiah, formatWeight } from "@/lib/format";
import type { NegotiationNotification } from "@/lib/hooks/useNegotiationNotification";

interface Props {
  notification: NegotiationNotification;
  onDismiss: () => void;
  onAction: (roomId: number) => void;
  autoDismissMs?: number;
}

export default function NegotiationNotificationPopup({
  notification,
  onDismiss,
  onAction,
  autoDismissMs = 5000,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(autoDismissMs);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const startAutoDismiss = useCallback(() => {
    clearTimers();
    startTimeRef.current = Date.now();
    const remaining = remainingRef.current;

    progressRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.max(0, 100 - (elapsed / autoDismissMs) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      if (!isPausedRef.current) {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }
    }, remaining);
  }, [autoDismissMs, clearTimers, onDismiss]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    startAutoDismiss();
    return clearTimers;
  }, [startAutoDismiss, clearTimers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  const handleMouseEnter = () => {
    isPausedRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimers();
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
    startAutoDismiss();
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleAction = () => {
    onAction(notification.roomId);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 sm:right-6 sm:top-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      {/* Progress bar */}
      <div className="absolute left-0 top-0 h-0.5 w-full bg-gray-100">
        <div
          className="h-full bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Negosiasi Diterima
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {notification.commodityName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup notifikasi"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>

        {/* Price info */}
        <div className="mb-4 rounded-xl bg-gray-50 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-gray-900">
            {formatRupiah(notification.price)}
            <span className="ml-1 text-xs font-normal text-gray-500">
              / {notification.unit}
            </span>
          </p>
          {(Number(notification.quantity) || 0) > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              Kuantitas: {formatWeight(notification.quantity, notification.unit)}
            </p>
          )}
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleAction}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
        >
          Lihat Negosiasi
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

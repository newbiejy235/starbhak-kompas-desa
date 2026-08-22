"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "warning" | "info" | "error";

const icons: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
};

const styles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: {
  message: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}) {
  const Icon = icons[type];

  useEffect(() => {
    if (!onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      // Toast slide-in dari atas + fade (PRD 8.8 & 9.2)
      className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 max-w-sm border rounded-xl px-4 py-3 text-sm font-medium shadow-lift animate-slide-down ${styles[type]}`}
    >
      <Icon size={18} className="shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

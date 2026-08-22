"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    // Tutup dengan animasi reverse simetris (PRD 8.11)
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closing ? "animate-fade-out" : "animate-fade-in-fast"}`}
    >
      {/* Backdrop fade + blur halus (PRD 8.11) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      {/* Panel scale + fade in/out (PRD 8.11 & 9.2) */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-card shadow-lift p-6 ${closing ? "animate-scale-out" : "animate-scale-in"} ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button
            onClick={close}
            aria-label="Tutup dialog"
            className="p-2 -m-1 rounded-lg text-gray-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

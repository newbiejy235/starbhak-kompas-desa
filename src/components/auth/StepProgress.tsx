"use client";

import { useEffect, useState } from "react";

export default function StepProgress({ current, total = 3 }: { current: number; total?: number }) {
  const [mounted, setMounted] = useState(false);

  // Trigger animasi fill setelah mount agar transisi terlihat
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex items-center gap-2 mb-6" aria-label={`Langkah ${current} dari ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            {/* Progress bar terisi bertahap via scaleX (PRD 8.5) */}
            <div
              className={`h-full w-full rounded-full bg-primary origin-left transition-transform duration-500 ease-smooth ${
                done || active ? (mounted ? "scale-x-100" : "scale-x-0") : "scale-x-0"
              } ${active ? "opacity-100" : done ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        );
      })}
    </div>
  );
}

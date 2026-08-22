"use client";

import { useId } from "react";

interface DotPatternProps {
  size?: number;
  color?: string;
  spacing?: number;
  fade?: boolean;
  className?: string;
}

export default function DotPattern({
  size = 1,
  color = "rgba(1, 90, 77, 0.8)",
  spacing = 20,
  fade = true,
  className = "",
}: DotPatternProps) {
  const id = useId();

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{
        WebkitMaskImage: fade
          ? "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)"
          : undefined,
        maskImage: fade
          ? "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)"
          : undefined,
      }}
    >
      <svg className="w-full h-full">
        <defs>
          <pattern
            id={id}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle cx={spacing / 2} cy={spacing / 2} r={size} fill={color} />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
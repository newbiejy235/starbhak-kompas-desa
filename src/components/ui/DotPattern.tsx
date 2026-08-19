"use client";

import { useId } from "react";
import { motion } from "framer-motion";

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

  // Konfigurasi koordinat pergerakan bola
  const floatingOrbs = [
    { initialX: "10%", initialY: "20%", moveX: [0, 40, -20, 0], moveY: [0, -30, 20, 0], duration: 12 },
    { initialX: "80%", initialY: "30%", moveX: [0, -50, 30, 0], moveY: [0, 40, -10, 0], duration: 15 },
    { initialX: "50%", initialY: "70%", moveX: [0, 30, -40, 0], moveY: [0, -40, 30, 0], duration: 10 },
  ];

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

        {/* Layer 1: Dot Pattern Statis */}
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>

      {/* Layer 2: Animated Floating Orbs di atas SVG Pattern */}
      <div className="absolute inset-0">
        {floatingOrbs.map((orb, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full blur-[1px]"
            style={{
              left: orb.initialX,
              top: orb.initialY,
              width: size * 6,
              height: size * 6,
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`,
            }}
            animate={{
              x: orb.moveX,
              y: orb.moveY,
              scale: [1, 1.4, 0.8, 1],
              opacity: [0.4, 0.9, 0.5, 0.4],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
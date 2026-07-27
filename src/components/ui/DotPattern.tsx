"use client";

interface DotPatternProps {
  size?: number;
  color?: string;
  spacing?: number;
  className?: string;
}

export default function DotPattern({
  size = 2.3,
  color = "rgba(255,255,255,0.3)",
  spacing = 30,
  className = "",
}: DotPatternProps) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
}
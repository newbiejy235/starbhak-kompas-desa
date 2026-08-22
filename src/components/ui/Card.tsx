import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      // Kartu: soft shadow, radius 16px, hover lift halus (PRD 7.4 & 9.2)
      className={`bg-white border border-gray-200/80 rounded-card shadow-soft ${
        hover ? "transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

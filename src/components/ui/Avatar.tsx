"use client";

import Image from "next/image";
import { formatImage } from "@/components/shared/States";

const sizeMap = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
} as const;

const imgSizeMap = { xs: 28, sm: 36, md: 44, lg: 56, xl: 80 } as const;

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

function getInitial(name?: string): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

function hashColor(name?: string): string {
  if (!name) return "from-gray-400 to-gray-500";
  const colors = [
    "from-[#025246] to-[#047857]",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-blue-500 to-indigo-500",
    "from-purple-500 to-pink-500",
    "from-rose-400 to-red-500",
    "from-cyan-500 to-blue-500",
    "from-lime-500 to-green-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const imgSrc = formatImage(src);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 ${sizeMap[size]} ${className}`}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={name || "Avatar"}
          fill
          sizes={`${imgSizeMap[size]}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${hashColor(name)} flex items-center justify-center text-white font-bold rounded-full`}
        >
          {getInitial(name)}
        </div>
      )}
    </div>
  );
}

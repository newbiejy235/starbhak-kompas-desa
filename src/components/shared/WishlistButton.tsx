"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleWishlist, isCommodityWishlisted } from "@/actions/wishlist";

interface WishlistButtonProps {
  commodityId: number;
  userId: number | null;
  size?: "sm" | "md";
  className?: string;
}

export default function WishlistButton({
  commodityId,
  userId,
  size = "md",
  className = "",
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!userId) return;
    isCommodityWishlisted(userId, commodityId).then(setWishlisted);
  }, [userId, commodityId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;

    startTransition(async () => {
      const result = await toggleWishlist(userId, commodityId);
      if (result.success && result.wishlisted !== undefined) {
        setWishlisted(result.wishlisted);
      }
    });
  };

  const iconSize = size === "sm" ? 16 : 20;
  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending || !userId}
      className={`${btnSize} rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
        wishlisted
          ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
          : "bg-white/80 text-gray-400 hover:bg-white hover:text-amber-500 shadow-sm"
      } disabled:opacity-50 ${className}`}
      aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
    >
      <Bookmark
        size={iconSize}
        fill={wishlisted ? "currentColor" : "none"}
        className="transition-transform duration-200"
      />
    </button>
  );
}

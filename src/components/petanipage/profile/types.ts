import type { AuthUser } from "@/lib/types/market";

export type ProfileData = AuthUser & {
  farmImages: Array<{
    id: number;
    publicId: string;
    secureUrl: string;
    caption: string | null;
    sortOrder: number;
    createdAt: Date;
  }>;
  avgRating: number;
  reviewCount: number;
};

export type CommodityData = {
  id: number;
  name: string;
  price: string;
  stock: string;
  unit: string;
  image: string | null;
  images: string[] | null;
  status: string;
  categoryName: string;
};

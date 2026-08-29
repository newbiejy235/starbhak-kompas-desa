import { Star, Package, MessageSquare } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-primary mb-1.5">{icon}</div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function StatistikCard({
  profile,
  commodityCount,
}: {
  profile: ProfileData;
  commodityCount: number;
}) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <Star size={16} className="text-primary" />
          Statistik
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatTile
            icon={<Package size={18} />}
            value={commodityCount}
            label="Komoditas"
          />
          <StatTile
            icon={<MessageSquare size={18} />}
            value={profile.reviewCount}
            label="Ulasan"
          />
          <StatTile
            icon={<Star size={18} />}
            value={profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "-"}
            label="Rating"
          />
        </div>
      </div>
    </div>
  );
}

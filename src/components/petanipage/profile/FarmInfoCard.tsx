import { Sprout, Clock, Ruler, FlaskConical } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

function FarmInfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50/80 border border-gray-100">
      <div className="w-10 h-10 rounded-full bg-[#025246]/10 flex items-center justify-center text-[#025246] mb-2">
        {icon}
      </div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-xs font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function InformasiLahanCard({ profile }: { profile: ProfileData }) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sprout size={16} className="text-[#025246]" />
          Informasi Lahan
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <FarmInfoTile
            icon={<Clock size={18} />}
            label="Pengalaman"
            value={profile.farmingExperience || "-"}
          />
          <FarmInfoTile
            icon={<Ruler size={18} />}
            label="Luas Lahan"
            value={profile.farmArea || "-"}
          />
          <FarmInfoTile
            icon={<FlaskConical size={18} />}
            label="Metode"
            value={profile.farmingMethod || "-"}
          />
        </div>
      </div>
    </div>
  );
}

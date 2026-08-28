import { Mail, Phone, MapPin } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function KontakCard({ profile }: { profile: ProfileData }) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mail size={16} className="text-primary" />
          Kontak
        </h2>
        <div className="space-y-3.5">
          <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone size={15} />} label="Telepon" value={profile.noTelp} />
          <InfoRow icon={<MapPin size={15} />} label="Alamat" value={profile.address || "-"} />
        </div>
      </div>
    </div>
  );
}

import { Mail, Phone, MapPin } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

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
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function KontakCard({ profile }: { profile: ProfileData }) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <Mail size={16} className="text-primary" />
          Kontak
        </h2>
        <div>
          <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone size={15} />} label="Telepon" value={profile.noTelp} />
          <InfoRow icon={<MapPin size={15} />} label="Alamat" value={profile.address || "-"} />
        </div>
      </div>
    </div>
  );
}

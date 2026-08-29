import { ShieldCheck } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, BUSINESS_TYPE_LABEL } from "@/lib/format";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

function TrustRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500">{label}</span>
      {value}
    </div>
  );
}

export default function InformasiPenjualCard({
  profile,
}: {
  profile: ProfileData;
}) {
  return (
    <div className={`${cardCls} border-[#E4F1EB] bg-[#F7FBF9]`}>
      <div className="p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          Informasi Penjual
        </h2>
        <div className="space-y-3">
          <TrustRow label="Status Akun" value={<StatusBadge status={profile.status} />} />
          <TrustRow
            label="Bergabung Sejak"
            value={
              <span className="text-xs font-medium text-gray-700">
                {formatDate(profile.createdAt)}
              </span>
            }
          />
          {profile.businessType && (
            <TrustRow
              label="Jenis Usaha"
              value={
                <span className="text-xs font-medium text-gray-700">
                  {BUSINESS_TYPE_LABEL[profile.businessType] ?? profile.businessType}
                </span>
              }
            />
          )}
          <TrustRow
            label="Lokasi Usaha"
            value={
              <span className="text-xs font-medium text-gray-700">
                {profile.village || profile.address || "-"}
              </span>
            }
          />
          <TrustRow
            label="Informasi Kontak"
            value={
              <span className="text-xs font-medium text-gray-700">{profile.noTelp}</span>
            }
          />
        </div>
      </div>
    </div>
  );
}

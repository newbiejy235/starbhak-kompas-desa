import { MapPin, Store, CalendarDays } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, ROLE_LABEL, BUSINESS_TYPE_LABEL } from "@/lib/format";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

export default function HeroSection({
  profile,
  currentFoto,
}: {
  profile: ProfileData;
  currentFoto: string | null;
}) {
  const p = profile;

  return (
    <div className={cardCls}>
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-primary via-primary-dark to-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" viewBox="0 0 800 200" fill="none">
            <path d="M100 180C100 180 120 100 200 80C280 60 300 140 300 140" stroke="white" strokeWidth="2" />
            <path d="M200 80C200 80 180 40 220 20C260 0 280 40 280 40" stroke="white" strokeWidth="1.5" />
            <path d="M500 190C500 190 530 110 600 90C670 70 690 150 690 150" stroke="white" strokeWidth="2" />
            <path d="M600 90C600 90 580 50 620 30C660 10 680 50 680 50" stroke="white" strokeWidth="1.5" />
            <circle cx="150" cy="50" r="3" fill="white" opacity="0.4" />
            <circle cx="400" cy="30" r="2" fill="white" opacity="0.3" />
            <circle cx="650" cy="60" r="3" fill="white" opacity="0.4" />
          </svg>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-6 -mt-14 text-center relative">
        <Avatar
          src={currentFoto}
          name={p.fullName}
          size="xl"
          className="w-28 h-28 text-4xl ring-4 ring-white shadow-lg"
        />
        <h1 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900">{p.fullName}</h1>
        <p className="text-sm text-gray-500">@{p.username}</p>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <StatusBadge status={p.role} label={ROLE_LABEL[p.role]} />
          <StatusBadge status={p.status} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500 flex-wrap">
          {p.businessType && (
            <span className="inline-flex items-center gap-1.5">
              <Store size={13} className="text-primary" />
              {BUSINESS_TYPE_LABEL[p.businessType] ?? p.businessType}
            </span>
          )}
          {(p.village || p.address) && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" />
              {p.village || p.address}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} className="text-primary" />
            Bergabung {formatDate(p.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

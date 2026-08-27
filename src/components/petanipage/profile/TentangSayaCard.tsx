import { UserRound } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls =
  "bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden";

export default function TentangSayaCard({ profile }: { profile: ProfileData }) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <UserRound size={16} className="text-[#025246]" />
          Tentang Saya
        </h2>
        {profile.bio ? (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Belum ada informasi yang ditambahkan.
          </p>
        )}
      </div>
    </div>
  );
}

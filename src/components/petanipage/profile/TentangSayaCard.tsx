import { UserRound } from "lucide-react";
import type { ProfileData } from "./types";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

export default function TentangSayaCard({ profile }: { profile: ProfileData }) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <UserRound size={16} className="text-primary" />
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

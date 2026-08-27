"use client";

import { useSyncExternalStore } from "react";
import { getProfile } from "@/actions/profile";
import { getFarmerCommodities } from "@/actions/commodity";
import { getClientUser, subscribeToUserChanges } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";

import ProfileSkeleton from "@/components/petanipage/profile/ProfileSkeleton";
import HeroSection from "@/components/petanipage/profile/HeroSection";
import TentangSayaCard from "@/components/petanipage/profile/TentangSayaCard";
import InformasiLahanCard from "@/components/petanipage/profile/FarmInfoCard";
import FotoUsahaCard from "@/components/petanipage/profile/FotoUsahaCard";
import KomoditasCard from "@/components/petanipage/profile/KomoditasCard";
import StatistikCard from "@/components/petanipage/profile/StatistikCard";
import InformasiPenjualCard from "@/components/petanipage/profile/InformasiPenjualCard";
import KontakCard from "@/components/petanipage/profile/KontakCard";
import EditProfileForm from "@/components/petanipage/profile/EditProfileForm";
import type { ProfileData, CommodityData } from "@/components/petanipage/profile/types";

export default function PetaniProfile() {
  const user = useSyncExternalStore(subscribeToUserChanges, getClientUser, () => null);

  const {
    data: profile,
    loading,
    reload,
  } = useFetch(
    () => (user ? getProfile(user.id) : Promise.resolve(null)),
    [user?.id],
  );

  const { data: commodities } = useFetch(
    () => (user ? getFarmerCommodities(user.id) : Promise.resolve([])),
    [user?.id],
  );

  if (loading || !profile) return <ProfileSkeleton />;

  const p = profile as ProfileData;
  const commodityList = (commodities as CommodityData[]) || [];
  const currentFoto = p.fotoProfile;

  return (
    <div className="space-y-6 animate-fade-up">
      <HeroSection profile={p} currentFoto={currentFoto} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* Left Column */}
        <div className="space-y-6 min-w-0">
          <TentangSayaCard profile={p} />
          <InformasiLahanCard profile={p} />
          <FotoUsahaCard profile={p} userId={user!.id} onReload={reload} />
          <KomoditasCard commodities={commodityList} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <StatistikCard profile={p} commodityCount={commodityList.length} />
          <InformasiPenjualCard profile={p} />
          <KontakCard profile={p} />
          <EditProfileForm
            profile={p}
            userId={user!.id}
            currentFoto={currentFoto}
            onReload={reload}
          />
        </div>
      </div>
    </div>
  );
}

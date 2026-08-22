"use client";

import UserSidebar from "@/components/userpage/Sidebar";
import UserHeader from "@/components/userpage/Header";
import { useAuth } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth("pembeli");

  // Skeleton loading, bukan spinner polos (PRD 8.3 & 16)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-8" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
        <div className="lg:pl-64">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="lg:pl-64 p-4 sm:p-6 lg:p-8 space-y-6">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <UserSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <UserHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-4">{children}</main>
      </div>
    </div>
  );
}

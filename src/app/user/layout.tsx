"use client";

import { useAuth } from "@/lib/hooks";
import UserSidebar from "@/components/userpage/Sidebar";
import UserHeader from "@/components/userpage/Header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth("pembeli");

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#025246] border-t-transparent rounded-full animate-spin" />
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

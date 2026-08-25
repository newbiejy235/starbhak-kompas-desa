"use client";

import UserSidebar from "@/components/userpage/Sidebar";
import { HeaderSearch, HeaderActions } from "@/components/userpage/Header";
import DashboardShell from "@/components/shared/DashboardShell";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      role="pembeli"
      sidebar={<UserSidebar />}
      headerLabel="Panel Pembeli"
      headerLeft={<HeaderSearch />}
      headerRight={<HeaderActions />}
    >
      {/* Padding mobile dari layout; sm+ memakai padding bawaan shell */}
      <div className="p-4 sm:p-0">{children}</div>
    </DashboardShell>
  );
}

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
      {children}
    </DashboardShell>
  );
}

"use client";

import AdminSidebar from "@/components/adminpage/Sidebar";
import DashboardShell from "@/components/shared/DashboardShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="admin" sidebar={<AdminSidebar />} headerLabel="Panel Administrator">
      {children}
    </DashboardShell>
  );
}

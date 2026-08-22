"use client";

import PetaniSidebar from "@/components/petanipage/Sidebar";
import DashboardShell from "@/components/shared/DashboardShell";

export default function PetaniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="petani" sidebar={<PetaniSidebar />} headerLabel="Panel Petani">
      {children}
    </DashboardShell>
  );
}

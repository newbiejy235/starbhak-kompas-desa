"use client";

import { useAuth } from "@/lib/hooks";
import AdminSidebar from "@/components/adminpage/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth("admin");

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#025246] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <AdminSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}

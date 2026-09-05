import { redirect } from "next/navigation";
import AdminSidebar from "@/components/adminpage/Sidebar";
import DashboardShell from "@/components/shared/DashboardShell";
import { verifyAuth, getAuthUser } from "@/lib/auth/auth.service";

/**
 * Guard otorisasi admin SERVER-SIDE (PRD: authorization tidak boleh
 * hanya di frontend). Flow:
 *   Request → cek cookie token → cek user di DB → role == admin?
 * Bukan admin diarahkan ke halaman sesuai rolenya masing-masing.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAuth();
  if (!session) {
    redirect("/auth/login");
  }

  const user = await getAuthUser(session.userId);
  if (!user || user.role !== "admin") {
    if (user?.role === "petani") redirect("/petani/dashboard");
    if (user?.role === "pembeli") redirect("/user/home");
    redirect("/auth/login");
  }

  return (
    <DashboardShell
      role="admin"
      sidebar={<AdminSidebar />}
      headerLabel="Panel Administrator"
    >
      {children}
    </DashboardShell>
  );
}
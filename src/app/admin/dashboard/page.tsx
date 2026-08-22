import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  UserRound,
  Store,
  Boxes,
  ShoppingBag,
  Wallet,
  BadgeCheck,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardStats,
  getTopCommodities,
  getSalesPerCategory,
  getMonthlyRevenue,
  getMonthlyOrders,
} from "@/actions/admin";
import { formatRupiah, formatNumber } from "@/lib/format";
import CountUp from "@/components/ui/CountUp";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

// Server Component: data diambil paralel per section dengan Suspense (PRD 8.3)
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard Admin</h1>
        <p className="text-sm text-gray-500">Pantau kinerja platform Kompas Desa.</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<QuickActionsSkeleton />}>
        <QuickActions />
      </Suspense>

      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <CategoryChart />
        </Suspense>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TopCommoditiesList />
        </Suspense>
      </div>
    </div>
  );
}

/* ------------------------------ Sections ------------------------------ */

async function StatsSection() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Pendapatan Fee", value: Number(stats.totalFeeRevenue), money: true, icon: Wallet, color: "bg-primary" },
    { label: "Total Petani", value: Number(stats.totalFarmers), icon: UserRound, color: "bg-green-600" },
    { label: "Total Pembeli", value: Number(stats.totalBuyers), icon: Store, color: "bg-blue-600" },
    { label: "Total Transaksi", value: Number(stats.totalPaidPayments), icon: ShoppingBag, color: "bg-indigo-600" },
    { label: "Total Komoditas", value: Number(stats.totalCommodities), icon: Boxes, color: "bg-amber-500" },
    { label: "Total Pengguna", value: Number(stats.totalUsers), icon: Users, color: "bg-purple-600" },
  ];

  return (
    // Stat card muncul staggered fade-up + count-up angka (PRD 8.3 & 9.2)
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          style={{ animationDelay: `${i * 80}ms` }}
          className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift"
        >
          <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-3 shadow-soft`}>
            <c.icon size={20} />
          </div>
          <p className="text-xl font-extrabold text-neutral-900 truncate">
            {c.money ? (
              <CountUp value={c.value} prefix="Rp " />
            ) : (
              <CountUp value={c.value} />
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

async function QuickActions() {
  const stats = await getDashboardStats();

  const actions = [
    {
      href: "/admin/users",
      label: "Menunggu Verifikasi",
      desc: "Akun pengguna belum diverifikasi",
      value: Number(stats.pendingUsers),
      icon: Clock,
      tone: "warning",
    },
    {
      href: "/admin/commodities",
      label: "Komoditas Baru",
      desc: "Komoditas menunggu verifikasi",
      value: Number(stats.pendingCommodities),
      icon: BadgeCheck,
      tone: "info",
    },
    {
      href: "/admin/orders",
      label: "Pesanan Baru",
      desc: "Pesanan menunggu konfirmasi",
      value: Number(stats.pendingOrders),
      icon: ShoppingBag,
      tone: "primary",
    },
  ] as const;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {actions.map((a, i) => (
        <Link
          key={a.href}
          href={a.href}
          style={{ animationDelay: `${400 + i * 80}ms` }}
          className="bg-white border border-gray-200/80 rounded-card p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <a.icon size={18} className="text-primary" /> {a.label}
            </span>
            {a.value > 0 && <Badge tone={a.tone} pulse>{a.value}</Badge>}
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">
            <CountUp value={a.value} />
          </p>
          <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
        </Link>
      ))}
    </div>
  );
}

async function RevenueChart() {
  const monthlyRevenue = await getMonthlyRevenue();
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => Number(m.total)), 1);

  return (
    <ChartCard title="Pendapatan Fee per Bulan" icon={<TrendingUp size={18} className="text-primary" />}
      subtitle={`Total: ${formatRupiah(monthlyRevenue.reduce((acc, m) => acc + Number(m.total), 0))}`}>
      {monthlyRevenue.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="flex items-end gap-3 h-48">
          {monthlyRevenue.map((m, i) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-gray-500 truncate max-w-full">
                {formatNumber(Number(m.total))}
              </span>
              {/* Bar chart draw-in bertahap via scaleY (PRD 8.3 & 9.2) */}
              <div
                className="w-full bg-gradient-to-t from-primary to-emerald-600 rounded-t-lg origin-bottom animate-grow-y"
                style={{
                  height: `${Math.max((Number(m.total) / maxRevenue) * 130, 4)}px`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
              <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

async function CategoryChart() {
  const salesByCategory = await getSalesPerCategory();
  const maxCategory = Math.max(...salesByCategory.map((c) => Number(c.totalRevenue)), 1);

  return (
    <ChartCard title="Statistik Penjualan per Kategori">
      {salesByCategory.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="space-y-4">
          {salesByCategory.map((c, i) => (
            <div key={c.categoryName}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{c.categoryName}</span>
                <span className="font-semibold text-primary">{formatRupiah(c.totalRevenue)}</span>
              </div>
              {/* Progress bar draw-in via scaleX (PRD 9.2) */}
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full w-full bg-gradient-to-r from-primary to-emerald-600 rounded-full origin-left animate-grow-x"
                  style={{
                    transform: `scaleX(${Number(c.totalRevenue) / maxCategory})`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

async function OrdersChart() {
  const monthlyOrders = await getMonthlyOrders();
  const maxOrders = Math.max(...monthlyOrders.map((m) => Number(m.total)), 1);

  return (
    <ChartCard title="Jumlah Pesanan per Bulan">
      {monthlyOrders.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="flex items-end gap-3 h-40">
          {monthlyOrders.map((m, i) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-gray-500">{Number(m.total)}</span>
              {/* Bar chart draw-in bertahap via scaleY (PRD 8.3 & 9.2) */}
              <div
                className="w-full bg-indigo-500 rounded-t-lg origin-bottom animate-grow-y"
                style={{
                  height: `${Math.max((Number(m.total) / maxOrders) * 100, 4)}px`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
              <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

async function TopCommoditiesList() {
  const topCommodities = await getTopCommodities(5);

  return (
    <ChartCard title="Komoditas Terlaris">
      {topCommodities.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="space-y-3">
          {topCommodities.map((c, i) => (
            // Item list reveal bertahap (PRD 8.6)
            <div
              key={c.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className="flex items-center gap-4 opacity-0 animate-fade-up"
            >
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {formatNumber(c.sold)} kg terjual ·{" "}
                  {Number(c.rating) > 0 ? Number(c.rating).toFixed(1) : "-"} ⭐ ({c.reviewCount})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

/* ------------------------------ Helpers ------------------------------ */

function monthLabel(m: string) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("id-ID", { month: "short" });
}

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
      <h2 className="font-bold text-neutral-900 mb-1 flex items-center gap-2">
        {icon} {title}
      </h2>
      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function EmptyChart() {
  return <p className="text-sm text-gray-400 py-10 text-center">Belum ada data</p>;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-card" />
      ))}
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-card" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
      <Skeleton className="h-5 w-52 mb-6" />
      <div className="flex items-end gap-3 h-44">
        {[45, 70, 55, 85, 65, 90].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Boxes,
  ShoppingBag,
  BadgeCheck,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  ScrollText,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentActivity,
  getPendingFarmerVerifications,
  getPendingCommodityVerifications,
} from "@/actions/admin";
import { formatRupiah, formatNumber, formatDateTime } from "@/lib/format";
import CountUp from "@/components/ui/CountUp";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Dashboard Admin
        </h1>
        <p className="text-sm text-gray-500">
          Pusat operasional KompasDesa — pantau kondisi platform dan tindakan
          yang membutuhkan admin.
        </p>
      </div>

      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsSection />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Suspense fallback={<QueueSkeleton />}>
            <VerificationQueue />
          </Suspense>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<QuickActionsSkeleton />}>
        <QuickActions />
      </Suspense>
    </div>
  );
}

/* ── Alerts: hal yang membutuhkan tindakan admin ─────────── */
async function AlertsSection() {
  const stats = await getDashboardStats();

  const alerts = [
    {
      count: Number(stats.pendingFarmers),
      label: "Petani menunggu verifikasi",
      href: "/admin/verification/farmers",
      tone: "amber",
    },
    {
      count: Number(stats.pendingCommodities),
      label: "Komoditas menunggu verifikasi",
      href: "/admin/verification/commodities",
      tone: "amber",
    },
    {
      count: Number(stats.problematicOrders),
      label: "Pesanan bermasalah",
      href: "/admin/orders",
      tone: "red",
    },
    {
      count: Number(stats.unreadMessages),
      label: "Pesan masuk belum dibaca",
      href: "/admin/messages",
      tone: "blue",
    },
  ];

  const visible = alerts.filter((a) => a.count > 0);

  if (visible.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-success/30 bg-success/5 px-5 py-4 text-sm text-success-dark">
        <CheckCircle2 size={18} className="shrink-0" />
        <span>
          Tidak ada item yang membutuhkan tindakan admin saat ini.
        </span>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {visible.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className={`flex items-center gap-3 rounded-card border px-4 py-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft ${
            a.tone === "red"
              ? "border-danger/30 bg-danger/5 hover:bg-danger/10"
              : a.tone === "blue"
                ? "border-blue-300 bg-blue-50 hover:bg-blue-100"
                : "border-amber-300 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <AlertTriangle
            size={18}
            className={`shrink-0 ${
              a.tone === "red"
                ? "text-danger"
                : a.tone === "blue"
                  ? "text-blue-600"
                  : "text-amber-600"
            }`}
          />
          <span className="flex-1 min-w-0">
            <span className="block truncate font-semibold text-neutral-800">
              {a.label}
            </span>
            <span className="text-xs text-neutral-500">
              {a.count} item perlu ditindaklanjuti
            </span>
          </span>
          <Badge
            tone={a.tone === "blue" ? "info" : a.tone === "red" ? "danger" : "warning"}
            pulse
          >
            {a.count}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

/* ── Primary stats ──────────────────────────────────────── */
async function StatsSection() {
  const stats = await getDashboardStats();

  const primary = [
    {
      label: "Total User",
      value: Number(stats.totalUsers),
      icon: Users,
      color: "bg-blue-600",
      href: "/admin/users",
    },
    {
      label: "Total Petani",
      value: Number(stats.totalFarmers),
      icon: Store,
      color: "bg-green-600",
      href: "/admin/farmers",
    },
    {
      label: "Pending Verification",
      value:
        Number(stats.pendingFarmers) + Number(stats.pendingCommodities),
      icon: BadgeCheck,
      color: "bg-amber-500",
      href: "/admin/verification",
    },
    {
      label: "Total Orders",
      value: Number(stats.totalOrders),
      icon: ShoppingBag,
      color: "bg-primary",
      href: "/admin/orders",
    },
  ];

  const secondary = [
    {
      label: "Komoditas Terverifikasi",
      value: Number(stats.verifiedCommodities),
      icon: Boxes,
    },
    {
      label: "Order Berjalan",
      value: Number(stats.activeOrders),
      icon: Clock,
    },
    {
      label: "Order Selesai",
      value: Number(stats.completedOrders),
      icon: CheckCircle2,
    },
    {
      label: "Order Bermasalah",
      value: Number(stats.problematicOrders),
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primary.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift"
          >
            <div
              className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-3 shadow-soft`}
            >
              <c.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 truncate">
              <CountUp value={c.value} />
            </p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondary.map((c) => (
          <div
            key={c.label}
            className="bg-white/70 rounded-card border border-gray-200/60 px-5 py-4 flex items-center gap-3"
          >
            <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <c.icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-neutral-900 leading-tight">
                {formatNumber(c.value)}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Antrean verifikasi ─────────────────────────────────── */
async function VerificationQueue() {
  const [farmers, commodities, stats] = await Promise.all([
    getPendingFarmerVerifications(5),
    getPendingCommodityVerifications(5),
    getDashboardStats(),
  ]);

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-neutral-900 flex items-center gap-2">
          <BadgeCheck size={18} className="text-primary" />
          Menunggu Verifikasi
        </h2>
        <Link
          href="/admin/verification"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Buka Pusat Verifikasi <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <UserCheck size={13} /> Petani
            <span className="ml-auto normal-case text-gray-500">
              {formatNumber(Number(stats.pendingFarmers))} menunggu
            </span>
          </p>
          {farmers.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
              Tidak ada petani menunggu verifikasi
            </p>
          ) : (
            <ul className="space-y-2">
              {farmers.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/admin/verification/farmers/${f.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {f.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {f.fullName}
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {f.village || "-"} · {formatDateTime(f.createdAt)}
                      </span>
                    </span>
                    <Badge tone="warning">Review</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <PackageCheck size={13} /> Komoditas
            <span className="ml-auto normal-case text-gray-500">
              {formatNumber(Number(stats.pendingCommodities))} menunggu
            </span>
          </p>
          {commodities.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
              Tidak ada komoditas menunggu verifikasi
            </p>
          ) : (
            <ul className="space-y-2">
              {commodities.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/verification/commodities/${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-600">
                      {c.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {c.name}
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {c.farmerName} · {c.categoryName} ·{" "}
                        {formatRupiah(c.price)}
                      </span>
                    </span>
                    <Badge tone="warning">Review</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Recent activity ────────────────────────────────────── */
async function RecentActivity() {
  const entries = await getRecentActivity(10);

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-neutral-900 flex items-center gap-2">
          <ScrollText size={18} className="text-primary" />
          Aktivitas Terbaru
        </h2>
        <Link
          href="/admin/activity"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Lihat Semua <ArrowRight size={13} />
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">
          Belum ada aktivitas
        </p>
      ) : (
        <ol className="relative space-y-0">
          {entries.map((e, i) => (
            <li key={e.key} className="relative flex gap-3 pb-4 last:pb-0">
              {i < entries.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200"
                />
              )}
              <span
                className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white shadow ${
                  e.type === "order" || e.type === "payment"
                    ? "bg-blue-500"
                    : e.type === "commodity"
                      ? "bg-amber-500"
                      : e.type === "audit"
                        ? "bg-purple-500"
                        : "bg-green-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={e.href}
                  className="block truncate text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
                >
                  {e.title}
                </Link>
                <p className="truncate text-xs text-gray-400">{e.description}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {formatDateTime(e.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ── Quick actions ──────────────────────────────────────── */
async function QuickActions() {
  const stats = await getDashboardStats();

  const actions = [
    {
      href: "/admin/verification",
      label: "Review Verifikasi",
      desc: `${Number(stats.pendingFarmers) + Number(stats.pendingCommodities)} antrean`,
      icon: BadgeCheck,
    },
    {
      href: "/admin/orders",
      label: "Lihat Pesanan Bermasalah",
      desc: `${Number(stats.problematicOrders)} pesanan`,
      icon: AlertTriangle,
    },
    {
      href: "/admin/farmers",
      label: "Kelola Petani",
      desc: `${Number(stats.totalFarmers)} petani`,
      icon: Store,
    },
    {
      href: "/admin/commodities",
      label: "Kelola Komoditas",
      desc: `${Number(stats.totalCommodities)} komoditas`,
      icon: Boxes,
    },
    {
      href: "/admin/payments",
      label: "Monitor Pembayaran",
      desc: `${formatRupiah(stats.totalTransactionVolume)} volume`,
      icon: ShoppingBag,
    },
    {
      href: "/admin/activity",
      label: "Lihat Activity Logs",
      desc: "Jejak aksi admin",
      icon: ScrollText,
    },
  ];

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
      <h2 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-primary" />
        Aksi Cepat
      </h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.02]"
          >
            <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <a.icon size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-800 truncate">
                {a.label}
              </span>
              <span className="block text-xs text-gray-400 truncate">
                {a.desc}
              </span>
            </span>
            <ArrowRight size={15} className="text-gray-300 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Skeletons ──────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-card" />
        ))}
      </div>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-card" />
      ))}
    </div>
  );
}

function QueueSkeleton() {
  return <Skeleton className="h-80 rounded-card" />;
}

function ActivitySkeleton() {
  return <Skeleton className="h-80 rounded-card" />;
}

function QuickActionsSkeleton() {
  return <Skeleton className="h-56 rounded-card" />;
}
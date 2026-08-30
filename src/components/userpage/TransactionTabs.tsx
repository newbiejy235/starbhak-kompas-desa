"use client";

import Link from "next/link";

const TABS: { label: string; href: string }[] = [
  { label: "Checkout", href: "/user/checkout" },
  { label: "Riwayat", href: "/user/transactions" },
  { label: "Gagal", href: "/user/transactions/failed" },
];

export default function TransactionTabs({ active }: { active: "checkout" | "transactions" | "failed" }) {
  return (
    <nav className="mb-6 flex items-center gap-6 border-b border-gray-200">
      {TABS.map((tab) => {
        const isActive =
          (tab.href === "/user/checkout" && active === "checkout") ||
          (tab.href === "/user/transactions" && active === "transactions") ||
          (tab.href === "/user/transactions/failed" && active === "failed");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px inline-flex border-b-2 px-1 pb-3 pt-2 text-sm font-semibold transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

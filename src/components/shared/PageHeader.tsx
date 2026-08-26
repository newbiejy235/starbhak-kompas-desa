import type { ComponentType } from "react";

interface PageHeaderProps {
  icon: ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
  title: string;
  subtitle: string;
  /** Aksi opsional di sisi kanan header (mis. tombol tambah). */
  action?: React.ReactNode;
}

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={22} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-0.5 truncate text-sm text-gray-500">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

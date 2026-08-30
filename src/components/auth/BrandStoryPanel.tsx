import type { LucideIcon } from "lucide-react";

interface StoryStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

interface BrandStoryPanelProps {
  kicker: string;
  title: string;
  highlight: string;
  description: string;
  stats: StoryStat[];
}

/**
 * Konten editorial panel kiri (desktop split-screen).
 * Background curve/gradient/slideshow/orb TETAP di masing-masing page
 * (agar selector GSAP ".bg-curve-container" / ".ambient-orb" tidak berubah).
 * Komponen ini hanya berisi lapisan konten: kicker, headline, deskripsi,
 * dan kartu "story" mengambang (bukan dashboard, murni storytelling).
 */
export default function BrandStoryPanel({
  kicker,
  title,
  highlight,
  description,
  stats,
}: BrandStoryPanelProps) {
  return (
    <div className="relative z-10 w-full max-w-[400px]">
      <span className="left-anim-item inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200 backdrop-blur-sm mb-6">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {kicker}
      </span>

      <h1 className="left-anim-item text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 text-white">
        {title}
        <br />
        <span className="text-emerald-400">{highlight}</span>
      </h1>

      <p className="left-anim-item text-sm lg:text-base text-emerald-100/80 leading-relaxed font-medium mb-10 max-w-[340px]">
        {description}
      </p>

      <div className="flex flex-col gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`story-float-card left-anim-item flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md px-4 py-3 w-fit shadow-lg shadow-black/10 ${
                i === 1 ? "ml-7" : i === 2 ? "ml-3" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <Icon size={16} strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-white">{stat.value}</p>
                <p className="text-[11px] font-medium text-emerald-100/60">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

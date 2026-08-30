interface MobileBrandBannerProps {
  title: string;
  highlight: string;
}

/**
 * Versi compact dari BrandStoryPanel khusus mobile (lg:hidden).
 * Sebelumnya di mobile panel kiri sepenuhnya hilang (hidden lg:block),
 * sehingga brand presence hanya logo kecil di header. Banner ini
 * memberi sedikit "napas" brand tanpa mengorbankan ruang form.
 */
export default function MobileBrandBanner({
  title,
  highlight,
}: MobileBrandBannerProps) {
  return (
    <div className="header-item lg:hidden mx-6 mb-5 rounded-2xl bg-gradient-to-br from-[#022c22] to-[#064e3b] px-5 py-4 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300 mb-1">
        Kompas&apos;Desa
      </p>
      <p className="relative text-[15px] font-extrabold text-white leading-snug">
        {title} <span className="text-emerald-400">{highlight}</span>
      </p>
    </div>
  );
}

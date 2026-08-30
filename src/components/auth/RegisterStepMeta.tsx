interface RegisterStepMetaProps {
  current: number;
  total?: number;
  label: string;
}

/**
 * Baris kecil di atas StepProgress: "Langkah 1 dari 3 • Informasi Akun".
 * Murni presentational, tidak menyentuh logic StepProgress yang sudah ada.
 */
export default function RegisterStepMeta({
  current,
  total = 3,
  label,
}: RegisterStepMetaProps) {
  return (
    <p className="right-anim-item flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700/70 mb-2">
      <span>
        Langkah {current} dari {total}
      </span>
      <span className="text-neutral-300">•</span>
      <span className="text-neutral-500">{label}</span>
    </p>
  );
}

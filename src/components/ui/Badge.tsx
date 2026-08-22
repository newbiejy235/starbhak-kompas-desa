type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-600",
  info: "bg-cyan-100 text-cyan-700",
  neutral: "bg-neutral-100 text-neutral-500",
};

export default function Badge({
  tone = "neutral",
  pulse = false,
  className = "",
  children,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {pulse && (
        // Badge unread berdenyut halus, bukan blink kasar (PRD 8.8 & 9.2)
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" aria-hidden />
      )}
      {children}
    </span>
  );
}

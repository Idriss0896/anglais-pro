import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "flame" | "xp" | "heart" | "neutral" | "mint" | "sky";

const tones: Record<Tone, { wrap: string; icon: string; fill?: boolean }> = {
  flame: { wrap: "bg-amber-50 ring-amber-100", icon: "text-amber-500", fill: true },
  xp: { wrap: "bg-violet-50 ring-violet-100", icon: "text-violet-500" },
  heart: { wrap: "bg-rose-50 ring-rose-100", icon: "text-rose-500", fill: true },
  mint: { wrap: "bg-emerald-50 ring-emerald-100", icon: "text-emerald-500" },
  sky: { wrap: "bg-sky-50 ring-sky-100", icon: "text-sky-500" },
  neutral: { wrap: "bg-[#f2f6ff] ring-slate-200/70", icon: "text-slate-500" },
};

interface StatPillProps {
  icon: LucideIcon;
  value: ReactNode;
  label?: string;
  tone?: Tone;
  compact?: boolean;
  onDark?: boolean;
  className?: string;
  title?: string;
}

export function StatPill({
  icon: Icon,
  value,
  label,
  tone = "neutral",
  compact = false,
  onDark = false,
  className,
  title,
}: StatPillProps) {
  const base = tones[tone];
  const theme = onDark
    ? { wrap: "bg-white/10 ring-white/20", icon: "text-white/85", fill: base.fill }
    : base;
  return (
    <span
      className={cn(
        "group inline-flex items-center rounded-full ring-1 transition-transform duration-200 hover:-translate-y-0.5",
        theme.wrap,
        compact ? "gap-1 px-2 py-1" : "gap-1.5 px-2.5 py-1.5",
        className,
      )}
      title={title}
    >
      <Icon
        size={compact ? 13 : 15}
        strokeWidth={2.5}
        className={cn(theme.icon, "transition-transform duration-300 group-hover:scale-110")}
        fill={theme.fill ? "currentColor" : "none"}
      />
      <b
        key={String(value)}
        className={cn(
          "animate-pop text-[12px] font-extrabold tabular-nums",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {value}
      </b>
      {label && !compact && (
        <span className={cn("text-[11px] font-bold", onDark ? "text-white/60" : "text-slate-400")}>
          {label}
        </span>
      )}
    </span>
  );
}

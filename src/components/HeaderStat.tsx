import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Heart, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeaderStatTone = "violet" | "rose" | "amber" | "emerald" | "sky" | "slate";

const tiles: Record<HeaderStatTone, string> = {
  violet: "from-violet-400 to-violet-600",
  rose: "from-rose-400 to-rose-600",
  amber: "from-amber-300 to-orange-500",
  emerald: "from-emerald-300 to-teal-500",
  sky: "from-sky-300 to-blue-500",
  slate: "from-slate-300 to-slate-500",
};

interface HeaderStatProps {
  icon: LucideIcon;
  /** Petite légende affichée au-dessus de la valeur (« Cœurs », « Points »…). */
  label: string;
  value?: ReactNode;
  content?: ReactNode;
  tone?: HeaderStatTone;
  filled?: boolean;
  to?: string;
  compact?: boolean;
  title?: string;
  className?: string;
}

/**
 * Statistique de la barre supérieure : une pastille bien arrondie, l'icône sur
 * une tuile colorée, la légende puis la valeur réelle (XP, cœurs, série…).
 */
export function HeaderStat({
  icon: Icon,
  label,
  value,
  content,
  tone = "violet",
  filled = false,
  to,
  compact = false,
  title,
  className,
}: HeaderStatProps) {
  const inner = (
    <>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[13px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
          tiles[tone],
          compact ? "h-6 w-6" : "h-7 w-7",
        )}
      >
        <Icon
          size={compact ? 13 : 14}
          strokeWidth={2.6}
          fill={filled ? "currentColor" : "none"}
        />
      </span>
      <span className="min-w-0 leading-none">
        {!compact && (
          <span className="block truncate text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-indigo-100/55">
            {label}
          </span>
        )}
        <span
          className={cn(
            "block truncate font-extrabold tabular-nums text-white",
            compact ? "text-[12px]" : "mt-1 text-[12.5px]",
          )}
        >
          {content ?? value}
        </span>
      </span>
    </>
  );

  const classes = cn(
    "group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/[0.17]",
    compact ? "h-10 px-2" : "h-11 px-2.5",
    className,
  );

  const hint =
    title ??
    (typeof value === "string" || typeof value === "number" ? `${label} : ${value}` : label);

  if (to) {
    return (
      <Link to={to} className={classes} title={hint} aria-label={hint}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={classes} title={hint} aria-label={hint}>
      {inner}
    </span>
  );
}

/**
 * Les cœurs sont affichés en pictogrammes (pleins / éteints) plutôt qu'en
 * chiffres, comme dans les grandes applications d'apprentissage.
 */
export function HeartsMeter({
  hearts,
  max,
  size = 9,
  className,
}: {
  hearts: number;
  max: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-[3px]", className)} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => (
        <Heart
          key={index}
          size={size}
          strokeWidth={1.6}
          fill={index < hearts ? "currentColor" : "none"}
          className={cn(
            "transition-colors duration-300",
            index < hearts ? "text-rose-300" : "text-white/30",
          )}
        />
      ))}
    </span>
  );
}

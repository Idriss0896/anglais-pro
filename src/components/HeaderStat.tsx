import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type HeaderStatTone = "violet" | "rose" | "amber" | "emerald" | "sky" | "slate";

/** Tuiles pleines (aucun dégradé) : une couleur franche par statistique. */
const tiles: Record<HeaderStatTone, string> = {
  violet: "bg-violet-500 text-white",
  rose: "bg-rose-500 text-white",
  amber: "bg-amber-400 text-amber-strong",
  emerald: "bg-emerald-400 text-emerald-strong",
  sky: "bg-sky-400 text-sky-strong",
  slate: "bg-slate-400 text-white",
};

interface HeaderStatProps {
  icon: ReactNode;
  /** Petite légende affichée au-dessus de la valeur (« Série », « Points »…). */
  label: string;
  value?: ReactNode;
  content?: ReactNode;
  tone?: HeaderStatTone;
  to?: string;
  compact?: boolean;
  title?: string;
  className?: string;
}

/**
 * Statistique de la barre supérieure : une pastille arrondie, l'icône sur une
 * tuile de couleur pleine, la légende puis la valeur réelle (XP, série…).
 */
export function HeaderStat({
  icon,
  label,
  value,
  content,
  tone = "violet",
  to,
  compact = false,
  title,
  className,
}: HeaderStatProps) {
  const hint =
    title ??
    (typeof value === "string" || typeof value === "number" ? `${label} : ${value}` : label);

  const inner = (
    <>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[13px]",
          tiles[tone],
          compact ? "h-6 w-6" : "h-7 w-7",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 leading-none">
        {!compact && (
          <span className="block truncate text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-white">
            {label}
          </span>
        )}
        <span
          className={cn(
            "block truncate font-extrabold tabular-nums leading-[1.25] text-white",
            compact ? "text-[12px]" : "mt-1 text-[12.5px]",
          )}
        >
          {content ?? value}
        </span>
      </span>
      {compact && <span className="sr-only">{hint}</span>}
    </>
  );

  const classes = cn(
    "group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20",
    compact ? "h-11 px-2" : "h-11 px-2.5",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} title={hint}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={classes} title={hint}>
      {inner}
    </span>
  );
}

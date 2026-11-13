import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ListChecks,
  Play,
} from "lucide-react";
import type { CurriculumUnit, LessonProgress } from "@/types";
import { CATEGORIES } from "@/lib/categories";
import { LEVEL_THEMES } from "@/lib/levels";
import { cn } from "@/lib/utils";
import { unitMinutes } from "@/data/curriculum";
import { CategoryBadge } from "./CategoryBadge";
import { ProgressBar } from "./ProgressBar";

interface UnitCardProps {
  unit: CurriculumUnit;
  progress?: LessonProgress;
  featured?: boolean;
  /** Carte bleu clair, pour alterner avec les cartes blanches. */
  tinted?: boolean;
  className?: string;
}

export function UnitCard({
  unit,
  progress,
  featured = false,
  tinted = false,
  className,
}: UnitCardProps) {
  const theme = CATEGORIES[unit.cat];
  const levelTheme = LEVEL_THEMES[unit.level];
  const done = Boolean(progress?.completed);
  const minutes = unitMinutes(unit);

  return (
    <Link
      to={`/lesson/${unit.id}`}
      className={cn(
        "card card-hover group relative flex flex-col overflow-hidden p-4 sm:p-5",
        featured ? "card-blue-deep" : done || tinted ? "card-blue" : "",
        className,
      )}
    >
      {featured && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-[#1d4ed8] shadow-sm">
          <Play size={11} className="fill-current" />
          Prochaine
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ring-1 ring-inset",
            featured ? "bg-white/15 ring-white/25" : cn(theme.soft, "ring-white/60"),
          )}
          aria-hidden="true"
        >
          {unit.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={unit.cat} />
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold",
                featured ? "bg-white/15 text-white ring-1 ring-white/20" : levelTheme.badge,
              )}
            >
              Niv. {unit.level}
            </span>
            {done && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold",
                  featured
                    ? "bg-white/15 text-white ring-1 ring-white/20"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
                )}
              >
                <CheckCircle2 size={11} strokeWidth={2.8} />
                Terminé
              </span>
            )}
          </div>
          <h3
            className={cn(
              "mt-2 pr-10 text-[15px] font-extrabold leading-tight transition-colors",
              featured ? "text-white" : "text-ink group-hover:text-[#1d4ed8]",
            )}
          >
            {unit.title}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-xs font-medium leading-5",
              featured ? "text-white/70" : "text-slate-500",
            )}
          >
            {unit.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold",
            featured ? "text-white/60" : "text-slate-400",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <ListChecks size={12.5} />
            {unit.quiz.length} exercices
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12.5} />
            {minutes} min
          </span>
          {done && progress && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                featured ? "text-emerald-200" : "text-emerald-600",
              )}
            >
              <CheckCircle2 size={12.5} />
              {progress.bestAccuracy}% de réussite
            </span>
          )}
        </div>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all",
            featured
              ? "bg-white text-[#1d4ed8]"
              : "bg-[#eef4ff] text-[#2563eb] group-hover:bg-[#1d4ed8] group-hover:text-white",
          )}
        >
          <ArrowUpRight size={15} strokeWidth={2.6} />
        </span>
      </div>

      {done && progress && (
        <ProgressBar
          value={progress.bestAccuracy}
          height="h-1.5"
          className={cn("mt-3", featured && "bg-white/20")}
          barClassName={featured ? "bg-emerald-300" : "bg-emerald-500"}
          label={`Meilleur score : ${progress.bestAccuracy}%`}
        />
      )}
    </Link>
  );
}

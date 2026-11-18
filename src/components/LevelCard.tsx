import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Play } from "@/lib/icons";
import type { LevelMeta, LessonProgress } from "@/types";
import { LEVEL_ICONS, LEVEL_THEMES } from "@/lib/levels";
import { cn, percent, plural } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

interface LevelCardProps {
  level: LevelMeta;
  lessons: Record<string, LessonProgress>;
  className?: string;
}

export function LevelCard({ level, lessons, className }: LevelCardProps) {
  const theme = LEVEL_THEMES[level.num];
  const completed = level.units.filter((unit) => lessons[unit.id]?.completed).length;
  const progress = percent(completed, level.units.length);
  const next = level.units.find((unit) => !lessons[unit.id]?.completed);
  const finished = completed === level.units.length;
  const LevelIcon = LEVEL_ICONS[level.num];

  return (
    <Link
      to={`/learn?level=${level.num}`}
      className={cn(
        "card card-hover level-card-accent group relative flex flex-col overflow-hidden",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden px-4 pb-3.5 pt-4", theme.chip)}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-5 select-none font-display text-[74px] font-extrabold leading-none text-white/10"
        >
          {level.num}
        </span>
        <div className="relative flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
            aria-hidden="true"
          >
            <LevelIcon size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/65">
              Niveau {level.num}
            </p>
            <h3 className="truncate text-[15px] font-extrabold leading-tight text-white">
              {level.title}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[9.5px] font-extrabold text-white ring-1 ring-white/20">
            {level.cefr}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="line-clamp-2 text-[11px] font-medium leading-5 text-slate-500">
          {level.subtitle}
        </p>

        <div className="mt-3 flex items-center justify-between text-[10px] font-extrabold">
          <span className="text-slate-400">
            {completed}/{level.units.length} {plural(level.units.length, "leçon")}
          </span>
          <span className={theme.text}>{progress}%</span>
        </div>
        <ProgressBar
          value={progress}
          height="h-1.5"
          className="mt-1.5 bg-surface-soft"
          barClassName={theme.bar}
          label={`Progression niveau ${level.num}`}
        />

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1 text-[10px] font-bold",
              finished ? "text-emerald-strong" : "text-slate-400",
            )}
          >
            {finished ? (
              <>
                <CheckCircle2 size={12} />
                Niveau terminé
              </>
            ) : (
              <>
                <Play size={11} className="shrink-0 fill-current" />
                <span className="truncate">{next?.title}</span>
              </>
            )}
          </span>
          <ArrowRight
            size={15}
            className={cn(
              "shrink-0 transition-transform duration-300 group-hover:translate-x-0.5",
              theme.text,
            )}
          />
        </div>
      </div>
    </Link>
  );
}

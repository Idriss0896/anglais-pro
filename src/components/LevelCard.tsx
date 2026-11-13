import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import type { LevelMeta, LessonProgress } from "@/types";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
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

  return (
    <Link
      to={`/learn?level=${level.num}`}
      className={cn(
        "card-blue card-hover group relative overflow-hidden p-4 sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity group-hover:opacity-20",
          theme.gradient,
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-sm",
            theme.gradient,
          )}
          aria-hidden="true"
        >
          {LEVEL_EMOJIS[level.num]}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1",
            theme.soft,
            theme.text,
            theme.ring,
          )}
        >
          {level.cefr}
        </span>
      </div>

      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#2563eb]/70">
        Niveau {level.num}
      </p>
      <h3 className="mt-0.5 text-[17px] font-extrabold text-ink">{level.title}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-slate-600">
        {level.subtitle}
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold">
          <span className="text-[#1d4ed8]/70">
            {completed}/{level.units.length} {plural(level.units.length, "leçon")}
          </span>
          <span className={theme.text}>{progress}%</span>
        </div>
        <ProgressBar
          value={progress}
          height="h-1.5"
          className="bg-white/80"
          barClassName={theme.bar}
          label={`Progression niveau ${level.num}`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1d4ed8]/70">
          {completed === level.units.length ? (
            <>
              <CheckCircle2 size={12} className="text-emerald-500" />
              Niveau terminé
            </>
          ) : (
            <>
              <BookOpen size={12} />
              {level.units.length - completed} leçons restantes
            </>
          )}
        </span>
        <ArrowRight
          size={15}
          className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
        />
      </div>
    </Link>
  );
}

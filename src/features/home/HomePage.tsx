import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  Flame,
  Gem,
  Play,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "@/lib/icons";
import { useAuth } from "@/auth/AuthProvider";
import { ButtonLink } from "@/components/Button";
import { DeferredBlock } from "@/components/DeferredSection";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { englishGreeting, formatLongDate, lastNDays, percent, cn } from "@/lib/utils";
import { LEVEL_OVERVIEW, TOTAL_UNITS } from "@/data/overview";
import {
  completedCount,
  todayXp,
  useProgressStore,
} from "@/store/useProgressStore";

/** Contenu détaillé chargé après le premier rendu (voir HomeCurriculum). */
type HomeContent = typeof import("./HomeCurriculum");

function useHomeContent() {
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    let alive = true;
    void import("./HomeCurriculum")
      .then((module) => {
        if (alive) setContent(module);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return content;
}

/** Réserve exactement la place de la prochaine leçon pendant son arrivée. */
function NextLessonSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[356px] animate-pulse rounded-[30px] bg-[#16265c] p-5 ring-1 ring-white/10 sm:p-7 lg:min-h-[285px]"
    >
      <div className="h-7 w-44 rounded-full bg-white/10" />
      <div className="mt-5 flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-[22px] bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="h-7 w-3/4 rounded bg-white/15" />
          <div className="h-3 w-full rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-6 h-2 w-full rounded-full bg-white/10" />
      <div className="mt-4 h-11 w-full rounded-full bg-white/10 sm:w-44" />
    </div>
  );
}



/** Nom lisible déduit de l'email quand aucun nom n'est renseigné. */
function nameFromEmail(email?: string | null) {
  if (!email) return "";
  return (email.split("@")[0] ?? "")
    .replace(/\d+/g, " ")
    .split(/[._\-+\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function DailyGoalCard() {
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const activity = useProgressStore((state) => state.activity);
  const goalXp = todayXp(activity);
  const progress = dailyGoal ? Math.min(100, Math.round((goalXp / dailyGoal) * 100)) : 0;
  const remaining = Math.max(0, dailyGoal - goalXp);

  return (
    <section className="card animate-fade-up p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20">
            <Target size={17} strokeWidth={2.4} />
          </span>
          <div>
            <p className="eyebrow">Aujourd'hui</p>
            <h2 className="text-[16px] font-extrabold text-ink">Objectif quotidien</h2>
          </div>
        </div>
        <Link
          to="/progress"
          className="grid h-11 w-11 place-items-center rounded-full text-slate-400 transition hover:bg-surface-soft hover:text-brand-strong"
          aria-label="Modifier l'objectif quotidien"
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing
          value={progress}
          size={94}
          stroke={9}
          trackClassName="stroke-slate-100"
          barClassName={progress >= 100 ? "stroke-emerald-500" : "stroke-brand-500"}
          label="Objectif quotidien"
        >
          <div className="text-center">
            <span className="block text-[24px] font-extrabold leading-none text-ink">{goalXp}</span>
            <span className="mt-0.5 block text-[9px] font-extrabold text-slate-400">
              / {dailyGoal} XP
            </span>
          </div>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-ink">
            {progress >= 100 ? "Objectif atteint 🎉" : "Garde le rythme"}
          </p>
          <p className="mt-0.5 text-[11.5px] font-medium leading-5 text-slate-500">
            {progress >= 100
              ? "Belle régularité, chaque jour compte."
              : `Encore ${remaining} XP pour valider ta journée.`}
          </p>
          <ButtonLink
            to="/practice"
            variant="soft"
            size="sm"
            icon={Dumbbell}
            className="mt-3"
          >
            Réviser 5 min
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function WeekCard() {
  const activity = useProgressStore((state) => state.activity);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const streak = useProgressStore((state) => state.streak);
  const days = lastNDays(7).map((day) => ({
    ...day,
    xp: activity[day.key]?.xp ?? 0,
  }));
  const max = Math.max(dailyGoal, ...days.map((day) => day.xp), 1);
  const total = days.reduce((sum, day) => sum + day.xp, 0);

  return (
    <section className="card-blue animate-fade-up p-5" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-amber-strong ring-1 ring-amber-strong/20">
            <Flame size={17} strokeWidth={2.4} fill="currentColor" />
          </span>
          <div>
            <p className="eyebrow">Régularité</p>
            <h2 className="text-[16px] font-extrabold text-ink">Cette semaine</h2>
          </div>
        </div>
        <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[10px] font-extrabold text-amber-strong ring-1 ring-amber-strong/20">
          {streak} j
        </span>
      </div>

      <div className="mt-5 flex h-24 items-end justify-between gap-1.5">
        {days.map((day, index) => {
          const height = Math.max(6, Math.round((day.xp / max) * 100));
          return (
            <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex h-[76px] w-full items-end justify-center">
                <div
                  className={cn(
                    "animate-bar w-full max-w-7 rounded-t-lg rounded-b-sm transition-colors",
                    day.xp >= dailyGoal
                      ? "bg-emerald-500"
                      : day.xp > 0
                        ? "bg-[#2563eb]"
                        : "bg-surface/80",
                    day.isToday && "ring-2 ring-azure-500/30 ring-offset-1",
                  )}
                  style={{
                    height: `${height}%`,
                    animationDelay: `${index * 55}ms`,
                  }}
                  title={`${day.xp} XP`}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-extrabold uppercase",
                  day.isToday ? "text-azure-strong" : "text-azure-strong/50",
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-azure-500/12 pt-3">
        <span className="text-[11px] font-bold text-azure-strong">Total de la semaine</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-ink">
          <Gem size={12} className="text-violet-strong" fill="currentColor" />
          {total} XP
        </span>
      </div>
    </section>
  );
}

export function HomePage() {
  const lessons = useProgressStore((state) => state.lessons);
  const streak = useProgressStore((state) => state.streak);
  const { user } = useAuth();
  const content = useHomeContent();
  const [now, setNow] = useState(() => new Date());

  // La salutation suit l'horloge : elle bascule seule en soirée puis la nuit.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);
  const hello = englishGreeting(now);
  const displayName = user?.name?.trim() || nameFromEmail(user?.email) || "there";
  const actionLabel =
    completed >= TOTAL_UNITS ? "Réviser" : completed > 0 ? "Reprendre" : "Commencer";
  const subtitle =
    hello.moment === "night"
      ? "Une petite session avant de dormir : cinq minutes, une leçon, et ton anglais avance même la nuit."
      : hello.moment === "evening"
        ? "Belle soirée pour progresser : une leçon courte, quelques exercices, et tu gardes ton rythme."
        : "Cinq minutes suffisent : une leçon courte, quelques exercices, et tu repars avec une nouvelle phrase d'anglais.";

  return (
    <div className="home-motion-page space-y-6 lg:space-y-8">
      <header className="home-motion-hero motion-surface animate-fade-up relative overflow-hidden rounded-[30px] px-5 py-6 ring-1 ring-line sm:px-7 sm:py-8">
        <div className="pattern-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,45,255,0.16),transparent_70%)]" />
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute -bottom-8 right-8 hidden select-none text-[144px] font-extrabold leading-none tracking-[-0.06em] text-ink/[0.035] sm:block dark:hidden"
        >
          Speak
        </span>

        <div className="home-motion-hero__content relative">
          <span className="font-nav inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_26px_-18px_rgba(46,16,101,0.95)]">
            <MaterialIcon name="event_available" size={14} />
            {formatLongDate(now)}
          </span>

          <h1 className="font-display mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.045em] text-ink sm:text-[44px]">
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span>{hello.text},</span>
              <span
                aria-hidden="true"
                className="greeting-emoji order-2 text-[0.88em] leading-none sm:order-3"
              >
                {hello.emoji}
              </span>
              <span className="order-3 inline-flex items-center rounded-[0.55em] bg-brand-soft px-2.5 py-0.5 text-brand-strong ring-1 ring-brand-strong/15 sm:order-2">
                {displayName}
              </span>
            </span>
          </h1>

          <p className="mt-2.5 max-w-xl text-[13.5px] font-medium leading-6 text-slate-500 sm:text-[14.5px]">
            {subtitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
            <ButtonLink
              to="/learn"
              size="lg"
              icon={Play}
              iconRight={ArrowRight}
              className="col-span-2 w-full rounded-full sm:col-span-1 sm:w-auto"
            >
              {actionLabel}
            </ButtonLink>
            <ButtonLink
              to="/practice"
              variant="secondary"
              size="md"
              icon={Dumbbell}
              className="w-full whitespace-nowrap rounded-full sm:w-auto"
            >
              <span className="sm:hidden">Réviser</span>
              <span className="hidden sm:inline">Réviser 5 min</span>
            </ButtonLink>
            <ButtonLink
              to="/reglages"
              variant="ghost"
              size="md"
              icon={SlidersHorizontal}
              className="w-full whitespace-nowrap rounded-full ring-1 ring-line hover:bg-surface-soft hover:text-ink sm:w-auto"
            >
              <span className="sm:hidden">Réglages</span>
              <span className="hidden sm:inline">Personnaliser</span>
            </ButtonLink>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1.5 text-[11px] font-extrabold text-emerald-strong ring-1 ring-emerald-strong/20">
              <MaterialIcon name="local_fire_department" size={15} />
              {streak} jour{streak > 1 ? "s" : ""} de série
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-azure-soft px-3 py-1.5 text-[11px] font-extrabold text-azure-strong ring-1 ring-azure-strong/20">
              <MaterialIcon name="track_changes" size={15} />
              {overall}% du parcours
            </span>
            <span className="hidden items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-[11px] font-extrabold text-slate-500 ring-1 ring-line sm:inline-flex">
              <Sparkles size={13} strokeWidth={2.6} className="text-brand-strong" />
              {TOTAL_UNITS} leçons · {LEVEL_OVERVIEW.length} niveaux
            </span>
          </div>
        </div>
      </header>

      <div className="home-motion-grid grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)] lg:items-start">
        <div className="animate-fade-up space-y-6" style={{ animationDelay: "70ms" }}>
          {content ? <content.NextLessonCard /> : <NextLessonSkeleton />}
          <DeferredBlock minHeight={180}>
            {content ? <content.CoachCard /> : null}
          </DeferredBlock>

          {content ? <content.LevelsSection /> : null}

          {content ? <content.ExploreGrid /> : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <DeferredBlock minHeight={250}>
            <DailyGoalCard />
          </DeferredBlock>
          <DeferredBlock minHeight={220}>
            <WeekCard />
          </DeferredBlock>
          <DeferredBlock minHeight={200}>
            {content ? <content.FeaturedPhraseCard /> : null}
          </DeferredBlock>
          <DeferredBlock minHeight={90}>
            {content ? <content.NextAchievementCard /> : null}
          </DeferredBlock>
        </aside>
      </div>
    </div>
  );
}

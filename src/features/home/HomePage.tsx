import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Clock3,
  Dumbbell,
  Flame,
  Gem,
  ListChecks,
  MessageCircle,
  Play,
  PlayCircle,
  Target,
  Trophy,
  Volume2,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { LevelCard } from "@/components/LevelCard";
import { Mascot, mascotFor, MASCOTS } from "@/components/Mascot";
import { ProgressBar } from "@/components/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { SectionHeading } from "@/components/SectionHeading";
import {
  ACHIEVEMENTS,
  type AchievementStats,
} from "@/lib/achievements";
import { speak } from "@/lib/audio";
import { CATEGORIES } from "@/lib/categories";
import { LEVEL_THEMES } from "@/lib/levels";
import {
  formatLongDate,
  greeting,
  lastNDays,
  percent,
  plural,
} from "@/lib/utils";
import {
  CURRICULUM,
  LEVELS,
  TOTAL_PHRASES,
  TOTAL_QUESTIONS,
  TOTAL_UNITS,
  countByCategory,
  getFeaturedPhrase,
  getNextUnit,
  unitMinutes,
} from "@/data/curriculum";
import {
  accuracyAverage,
  completedCount,
  todayXp,
  useProgressStore,
} from "@/store/useProgressStore";
import { cn } from "@/lib/utils";

function NextLessonCard() {
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);
  const unit = getNextUnit(lessons);
  const levelTheme = LEVEL_THEMES[unit.level];
  const category = CATEGORIES[unit.cat];
  const minutes = unitMinutes(unit);
  const progress = lessons[unit.id];
  const isDone = Boolean(progress?.completed);

  return (
    <section className="card-blue-deep animate-fade-up relative overflow-hidden rounded-[30px] p-5 sm:p-7">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75 ring-1 ring-white/10">
            <PlayCircle size={12} className="text-amber-300" />
            {isDone ? "À consolider" : "Ta prochaine leçon"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/55 ring-1 ring-white/10">
            <span className={cn("h-1.5 w-1.5 rounded-full", levelTheme.bar)} />
            Niveau {unit.level} · {unit.levelCefr}
          </span>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-white/10 text-3xl ring-1 ring-white/15 backdrop-blur-sm">
            {unit.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/35">
              {category.label} · {unit.levelTitle}
            </p>
            <h2 className="mt-1 text-balance text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-[30px]">
              {unit.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 max-w-md text-[13px] font-medium leading-5 text-white/55">
              {unit.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold">
              <span className="text-white/45">
                {completed}/{TOTAL_UNITS} leçons terminées
              </span>
              <span className="text-white/75">{overall}%</span>
            </div>
            <ProgressBar
              value={overall}
              height="h-2"
              className="bg-white/15"
              barClassName="bg-gradient-to-r from-emerald-300 to-teal-300"
              label="Progression globale"
            />
          </div>
          <ButtonLink
            to={`/lesson/${unit.id}`}
            variant="secondary"
            size="md"
            iconRight={ArrowRight}
            className="w-full bg-white text-ink shadow-none hover:bg-[#f2f6ff] sm:w-auto"
          >
            {isDone ? "Réviser" : "Continuer"}
          </ButtonLink>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-white/40">
          <span className="inline-flex items-center gap-1.5">
            <ListChecks size={12.5} />
            {unit.quiz.length} exercices
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={12.5} />
            {minutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy size={12.5} />
            +{unit.quiz.length * 10 + 20} XP possible
          </span>
        </div>
      </div>
    </section>
  );
}

function CoachCard() {
  const lessons = useProgressStore((state) => state.lessons);
  const unit = getNextUnit(lessons);
  const phraseBlock = unit.theory.find((block) => block.t === "phrases");
  const phrase = phraseBlock?.items?.[0];
  if (!phrase) return null;
  const coach = mascotFor(unit.id);
  const meta = MASCOTS[coach];

  return (
    <section className="card animate-fade-up flex items-center gap-4 p-4 sm:p-5">
      <Mascot id={coach} mood="hello" size={82} className="hidden sm:block" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">
          {meta.name} · {unit.title}
        </p>
        <p className="mt-1 font-display text-[16px] font-extrabold leading-snug text-ink">
          « {phrase.en} »
        </p>
        <p className="mt-0.5 text-[12px] font-medium leading-5 text-slate-500">{phrase.fr}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => speak(phrase.en)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-[11px] font-extrabold text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-100"
          >
            <Volume2 size={13} strokeWidth={2.6} />
            Écouter
          </button>
          <Link
            to={`/lesson/${unit.id}`}
            className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-extrabold text-slate-500 transition hover:text-ink"
          >
            Voir la leçon
            <ArrowRight size={12.5} />
          </Link>
        </div>
      </div>
      <Mascot id={coach} mood="hello" size={62} className="sm:hidden" />
    </section>
  );
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Target size={17} strokeWidth={2.4} />
          </span>
          <div>
            <p className="eyebrow">Aujourd'hui</p>
            <h2 className="text-[16px] font-extrabold text-ink">Objectif quotidien</h2>
          </div>
        </div>
        <Link
          to="/progress"
          className="grid h-8 w-8 place-items-center rounded-full text-slate-300 transition hover:bg-[#f2f6ff] hover:text-brand-600"
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-amber-500 ring-1 ring-amber-100">
            <Flame size={17} strokeWidth={2.4} fill="currentColor" />
          </span>
          <div>
            <p className="eyebrow">Régularité</p>
            <h2 className="text-[16px] font-extrabold text-ink">Cette semaine</h2>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 ring-1 ring-amber-100">
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
                      ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                      : day.xp > 0
                        ? "bg-gradient-to-t from-[#2563eb] to-[#60a5fa]"
                        : "bg-white/80",
                    day.isToday && "ring-2 ring-[#2563eb]/30 ring-offset-1",
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
                  day.isToday ? "text-[#1d4ed8]" : "text-[#1d4ed8]/50",
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#2563eb]/12 pt-3">
        <span className="text-[11px] font-bold text-[#1d4ed8]/60">Total de la semaine</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-ink">
          <Gem size={12} className="text-violet-500" fill="currentColor" />
          {total} XP
        </span>
      </div>
    </section>
  );
}

function FeaturedPhraseCard() {
  const favorites = useProgressStore((state) => state.favorites);
  const toggleFavorite = useProgressStore((state) => state.toggleFavorite);
  const phrase = getFeaturedPhrase();
  if (!phrase) return null;
  const favorite = favorites.includes(phrase.id);

  return (
    <section className="card animate-fade-up overflow-hidden p-5" style={{ animationDelay: "90ms" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-600">
          <MessageCircle size={13} strokeWidth={2.5} />
          Expression du jour
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(phrase.id)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full ring-1 transition",
            favorite
              ? "bg-amber-500 text-white ring-amber-500"
              : "bg-amber-50 text-amber-500 ring-amber-100 hover:bg-amber-100",
          )}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {favorite ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>

      <p className="mt-3 font-display text-[20px] font-extrabold leading-snug text-ink">
        “{phrase.en}”
      </p>
      <p className="mt-1 text-[12.5px] font-medium leading-5 text-slate-500">{phrase.fr}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => speak(phrase.en)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-100"
        >
          <Volume2 size={13} strokeWidth={2.5} />
          Écouter
        </button>
        <Link
          to="/expressions"
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1d4ed8] hover:text-[#1e40af]"
        >
          Voir tout
          <ArrowRight size={13} />
        </Link>
      </div>

      <p className="mt-3 border-t border-amber-100 pt-3 text-[10px] font-bold text-slate-400">
        {phrase.unitTitle} · Niveau {phrase.level}
      </p>
    </section>
  );
}

function NextAchievementCard() {
  const lessons = useProgressStore((state) => state.lessons);
  const streak = useProgressStore((state) => state.streak);
  const bestStreak = useProgressStore((state) => state.bestStreak);
  const xp = useProgressStore((state) => state.xp);
  const completed = completedCount(lessons);
  const level1 = LEVELS[0];
  const stats: AchievementStats = {
    completed,
    total: TOTAL_UNITS,
    streak,
    bestStreak,
    xp,
    bestAccuracy: accuracyAverage(lessons),
    perfectLessons: Object.values(lessons).filter((lesson) => lesson.bestAccuracy === 100)
      .length,
    level1Complete: level1.units.every((unit) => lessons[unit.id]?.completed),
  };
  const candidate = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    current: achievement.value(stats),
  }))
    .filter((achievement) => achievement.current < achievement.goal)
    .sort(
      (a, b) => b.current / b.goal - a.current / a.goal,
    )[0];

  if (!candidate) {
    return (
      <section className="card flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
          <Trophy size={18} />
        </span>
        <div>
          <p className="text-[12px] font-extrabold text-ink">Tous les succès débloqués</p>
          <p className="text-[11px] font-medium text-slate-400">Champion !</p>
        </div>
      </section>
    );
  }

  const Icon = candidate.icon;
  const progress = Math.min(100, Math.round((candidate.current / candidate.goal) * 100));

  return (
    <Link
      to="/progress"
      className="card card-hover flex items-center gap-3 p-4"
      style={{ animationDelay: "120ms" }}
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white",
          candidate.tone,
        )}
      >
        <Icon size={19} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Prochain succès
        </p>
        <p className="truncate text-[12.5px] font-extrabold text-ink">{candidate.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar value={progress} height="h-1.5" barClassName="bg-brand-500" />
          <span className="shrink-0 text-[9px] font-extrabold text-slate-400">
            {candidate.current}/{candidate.goal}
          </span>
        </div>
      </div>
    </Link>
  );
}

const exploreCards = [
  {
    to: "/grammar",
    title: "Grammaire",
    description: `${countByCategory("grammar")} fiches claires`,
    icon: CATEGORIES.grammar.icon,
    tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    accent: "text-indigo-700",
  },
  {
    to: "/expressions",
    title: "Expressions",
    description: `${TOTAL_PHRASES} phrases utiles`,
    icon: MessageCircle,
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "text-amber-700",
  },
  {
    to: "/vocabulary",
    title: "Vocabulaire",
    description: `${countByCategory("vocabulary")} thèmes de mots`,
    icon: CATEGORIES.vocabulary.icon,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "text-emerald-700",
  },
  {
    to: "/practice",
    title: "Entraînement",
    description: `${TOTAL_QUESTIONS} exercices`,
    icon: Dumbbell,
    tone: "bg-brand-50 text-brand-600 ring-brand-100",
    accent: "text-brand-700",
  },
];

function ExploreGrid() {
  return (
    <section>
      <SectionHeading title="Explorer" description="Tout ce qu'il faut pour progresser" />
      <div className="grid grid-cols-2 gap-3">
        {exploreCards.map((card, index) => (
          <Link
            key={card.to}
            to={card.to}
            className={cn(
              "card-hover group flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4",
              index % 2 === 0 ? "card-blue" : "card",
            )}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 sm:h-10 sm:w-10",
                card.tone,
              )}
            >
              <card.icon size={18} strokeWidth={2.3} className="sm:hidden" />
              <card.icon size={19} strokeWidth={2.3} className="hidden sm:block" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-extrabold text-ink sm:text-[12.5px]">
                {card.title}
              </span>
              <span className="block truncate text-[9.5px] font-semibold text-slate-400 sm:text-[10px]">
                {card.description}
              </span>
            </span>
            <ArrowUpRight
              size={14}
              className="hidden shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:text-brand-600 sm:block"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const lessons = useProgressStore((state) => state.lessons);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="animate-fade-up">
        <p className="eyebrow">{formatLongDate()}</p>
        <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.04em] text-ink sm:text-4xl">
          {greeting()}{" "}
          <span className="inline-block animate-float">👋</span>
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Prêt(e) à faire progresser ton anglais aujourd'hui ?
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)] lg:items-start">
        <div className="animate-fade-up space-y-6" style={{ animationDelay: "70ms" }}>
          <NextLessonCard />
          <CoachCard />

          <section>
            <SectionHeading
              title="Ton parcours"
              description="3 niveaux, un seul objectif : oser parler"
              to="/learn"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((level) => (
                <LevelCard key={level.id} level={level} lessons={lessons} />
              ))}
            </div>
          </section>

          <ExploreGrid />
        </div>

        <aside className="animate-fade-up space-y-4 lg:sticky lg:top-6" style={{ animationDelay: "150ms" }}>
          <DailyGoalCard />
          <WeekCard />
          <FeaturedPhraseCard />
          <NextAchievementCard />
        </aside>
      </div>
    </div>
  );
}

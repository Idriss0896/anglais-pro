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
import { MaterialIcon } from "@/components/MaterialIcon";
import { Mascot, mascotFor, MASCOTS } from "@/components/Mascot";
import { ProgressBar } from "@/components/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { SectionHeading } from "@/components/SectionHeading";
import { SoundBars } from "@/components/SoundBars";
import {
  ACHIEVEMENTS,
  type AchievementStats,
} from "@/lib/achievements";
import { speak } from "@/lib/audio";
import { CATEGORIES } from "@/lib/categories";
import { LEVEL_THEMES } from "@/lib/levels";
import { useSpeaking } from "@/lib/useSpeaking";
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
      <div className="animate-float-slow pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

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
              barClassName="bg-emerald-300"
              label="Progression globale"
            />
          </div>
          <ButtonLink
            to={`/lesson/${unit.id}`}
            variant="secondary"
            size="md"
            iconRight={ArrowRight}
            className="w-full bg-surface text-ink shadow-none hover:bg-surface-soft sm:w-auto"
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
  const speaking = useSpeaking(phrase?.en ?? "");
  if (!phrase) return null;
  const coach = mascotFor(unit.id);
  const meta = MASCOTS[coach];

  return (
    <section className="card lift animate-fade-up flex items-center gap-4 p-4 sm:p-5">
      <Mascot id={coach} mood="hello" size={82} className="hidden sm:block" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">
          {meta.name} · {unit.title}
        </p>
        <p className="mt-1 font-display text-[17px] font-extrabold leading-snug tracking-[-0.02em] text-ink">
          « {phrase.en} »
        </p>
        <p className="mt-0.5 text-[12px] font-medium leading-5 text-slate-500">{phrase.fr}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => speak(phrase.en)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-[11px] font-extrabold text-brand-strong ring-1 ring-brand-strong/20 transition hover:bg-brand-soft hover:ring-brand-strong/40"
          >
            {speaking ? (
              <SoundBars className="text-brand-strong" />
            ) : (
              <Volume2 size={13} strokeWidth={2.6} />
            )}
            {speaking ? "En lecture" : "Écouter"}
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
          className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-surface-soft hover:text-brand-strong"
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
        <span className="text-[11px] font-bold text-azure-strong/60">Total de la semaine</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-ink">
          <Gem size={12} className="text-violet-strong" fill="currentColor" />
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
  const speaking = useSpeaking(phrase?.en ?? "");
  if (!phrase) return null;
  const favorite = favorites.includes(phrase.id);

  return (
    <section className="card animate-fade-up overflow-hidden p-5" style={{ animationDelay: "90ms" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-strong">
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
              : "bg-amber-soft text-amber-strong ring-amber-strong/20 hover:bg-amber-soft",
          )}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {favorite ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>

      <p className="mt-3 font-display text-[21px] font-extrabold leading-[1.25] tracking-[-0.025em] text-ink">
        “{phrase.en}”
      </p>
      <p className="mt-1 text-[12.5px] font-medium leading-5 text-slate-500">{phrase.fr}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => speak(phrase.en)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-[11px] font-extrabold text-amber-strong ring-1 ring-amber-strong/20 transition hover:-translate-y-0.5 hover:ring-amber-strong/40"
        >
          {speaking ? <SoundBars className="text-amber-strong" /> : <Volume2 size={13} strokeWidth={2.5} />}
          {speaking ? "En lecture" : "Écouter"}
        </button>
        <Link
          to="/expressions"
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-azure-strong hover:text-azure-strong"
        >
          Voir tout
          <ArrowRight size={13} />
        </Link>
      </div>

      <p className="mt-3 border-t border-amber-strong/20 pt-3 text-[10px] font-bold text-slate-400">
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
  const completedLevels = LEVELS.filter((level) =>
    level.units.every((unit) => lessons[unit.id]?.completed),
  ).map((level) => level.num);
  const stats: AchievementStats = {
    completed,
    total: TOTAL_UNITS,
    streak,
    bestStreak,
    xp,
    bestAccuracy: accuracyAverage(lessons),
    perfectLessons: Object.values(lessons).filter((lesson) => lesson.bestAccuracy === 100)
      .length,
    completedLevels,
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
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-soft text-amber-strong">
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
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white",
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
    surface: "bg-[#4f46e5] text-white ring-1 ring-indigo-300/30",
    tone: "bg-white/15 text-white ring-white/25",
    accent: "text-white",
  },
  {
    to: "/expressions",
    title: "Expressions",
    description: `${TOTAL_PHRASES} phrases utiles`,
    icon: MessageCircle,
    surface: "bg-[#f59e0b] text-white ring-1 ring-amber-200/30",
    tone: "bg-white/15 text-white ring-white/25",
    accent: "text-white",
  },
  {
    to: "/vocabulary",
    title: "Vocabulaire",
    description: `${countByCategory("vocabulary")} thèmes de mots`,
    icon: CATEGORIES.vocabulary.icon,
    surface: "bg-[#059669] text-white ring-1 ring-emerald-200/30",
    tone: "bg-white/15 text-white ring-white/25",
    accent: "text-white",
  },
  {
    to: "/practice",
    title: "Entraînement",
    description: `${TOTAL_QUESTIONS} exercices`,
    icon: Dumbbell,
    surface: "bg-[#7c3aed] text-white ring-1 ring-violet-300/30",
    tone: "bg-white/15 text-white ring-white/25",
    accent: "text-white",
  },
];

function ExploreGrid() {
  return (
    <section>
      <SectionHeading title="Explorer" description="Tout ce qu'il faut pour progresser" />
      <div className="stagger grid grid-cols-2 gap-3">
        {exploreCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className={cn("card lift group flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4", card.surface)}
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
              <span className="block truncate text-[11.5px] font-extrabold text-white sm:text-[12.5px]">
                {card.title}
              </span>
              <span className="block truncate text-[9.5px] font-semibold text-white/75 sm:text-[10px]">
                {card.description}
              </span>
            </span>
            <ArrowUpRight
              size={14}
              className={cn(
                "hidden shrink-0 transition group-hover:-translate-y-0.5 sm:block",
                card.accent,
              )}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const lessons = useProgressStore((state) => state.lessons);
  const streak = useProgressStore((state) => state.streak);
  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="motion-surface animate-fade-up relative overflow-hidden rounded-[30px] px-5 py-6 ring-1 ring-line sm:px-7 sm:py-8">
        <div className="pattern-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="animate-glow pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-brand-soft blur-2xl" />
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute -bottom-8 right-8 hidden select-none text-[144px] font-extrabold leading-none tracking-[-0.06em] text-ink/[0.035] sm:block dark:hidden"
        >
          Speak
        </span>

        <div className="relative">
          <span className="font-nav inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_26px_-18px_rgba(46,16,101,0.95)]">
            <MaterialIcon name="event_available" size={14} />
            {formatLongDate()}
          </span>

          <h1 className="font-display mt-4 text-balance text-[32px] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[44px]">
            {greeting()}{" "}
            <span className="inline-block origin-bottom animate-wave">👋</span>
          </h1>

          <p className="mt-2.5 max-w-xl text-pretty text-[13.5px] font-medium leading-6 text-slate-500 sm:text-[14.5px]">
            Cinq minutes suffisent : une leçon courte, quelques exercices, et tu repars avec une
            nouvelle phrase d'anglais.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1.5 text-[11px] font-extrabold text-emerald-strong ring-1 ring-emerald-strong/20">
              <MaterialIcon name="local_fire_department" size={15} />
              {streak} jour{streak > 1 ? "s" : ""} de série
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-azure-soft px-3 py-1.5 text-[11px] font-extrabold text-azure-strong ring-1 ring-azure-strong/20">
              <MaterialIcon name="track_changes" size={15} />
              {overall}% du parcours
            </span>
            <Link
              to="/reglages"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-[11px] font-extrabold text-slate-500 ring-1 ring-line transition hover:text-ink hover:ring-brand-strong/30"
            >
              <MaterialIcon name="tune" size={15} />
              Personnaliser
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)] lg:items-start">
        <div className="animate-fade-up space-y-6" style={{ animationDelay: "70ms" }}>
          <NextLessonCard />
          <CoachCard />

          <section>
            <SectionHeading
              title="Ton parcours"
              description="4 niveaux colorés, un seul objectif : oser parler"
              to="/learn"
            />
            <div className="stagger grid gap-3 sm:grid-cols-2">
              {LEVELS.map((level) => (
                <LevelCard key={level.id} level={level} lessons={lessons} />
              ))}
            </div>
          </section>

          <ExploreGrid />
        </div>

        <aside className="stagger space-y-4 lg:sticky lg:top-6">
          <DailyGoalCard />
          <WeekCard />
          <FeaturedPhraseCard />
          <NextAchievementCard />
        </aside>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  Flame,
  Gem,
  GraduationCap,
  Medal,
  RotateCcw,
  Settings2,
  Target,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatPill } from "@/components/StatPill";
import { ProgressBar } from "@/components/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import {
  ACHIEVEMENTS,
  RANKS,
  getRank,
  type AchievementStats,
} from "@/lib/achievements";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
import { LEVELS, TOTAL_UNITS } from "@/data/curriculum";
import {
  accuracyAverage,
  completedCount,
  todayXp,
  useProgressStore,
} from "@/store/useProgressStore";
import { cn, lastNDays, percent, plural } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function WeeklyChart() {
  const activity = useProgressStore((state) => state.activity);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const days = lastNDays(7).map((day) => ({ ...day, xp: activity[day.key]?.xp ?? 0 }));
  const max = Math.max(dailyGoal, ...days.map((day) => day.xp), 1);
  const total = days.reduce((sum, day) => sum + day.xp, 0);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-500 ring-1 ring-amber-100">
            <Flame size={17} fill="currentColor" />
          </span>
          <div>
            <p className="eyebrow">7 derniers jours</p>
            <h2 className="text-[16px] font-extrabold text-ink">Activité</h2>
          </div>
        </div>
        <span className="text-[11px] font-extrabold text-ink">{total} XP</span>
      </div>
      <div className="mt-5 flex h-28 items-end justify-between gap-2">
        {days.map((day, index) => {
          const height = Math.max(6, Math.round((day.xp / max) * 100));
          return (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-[90px] w-full items-end justify-center">
                <div
                  className={cn(
                    "animate-bar w-full max-w-9 rounded-t-lg rounded-b-sm",
                    day.xp >= dailyGoal
                      ? "bg-gradient-to-t from-emerald-400 to-emerald-300"
                      : day.xp > 0
                        ? "bg-gradient-to-t from-brand-500 to-brand-300"
                        : "bg-slate-100",
                    day.isToday && "ring-2 ring-brand-200 ring-offset-1",
                  )}
                  style={{ height: `${height}%`, animationDelay: `${index * 50}ms` }}
                  title={`${day.xp} XP`}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-extrabold uppercase",
                  day.isToday ? "text-brand-600" : "text-slate-400",
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ProgressPage() {
  const xp = useProgressStore((state) => state.xp);
  const lessons = useProgressStore((state) => state.lessons);
  const streak = useProgressStore((state) => state.streak);
  const bestStreak = useProgressStore((state) => state.bestStreak);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const activity = useProgressStore((state) => state.activity);
  const favorites = useProgressStore((state) => state.favorites);
  const sound = useProgressStore((state) => state.sound);
  const setDailyGoal = useProgressStore((state) => state.setDailyGoal);
  const setSound = useProgressStore((state) => state.setSound);
  const resetProgress = useProgressStore((state) => state.resetProgress);
  const [resetOpen, setResetOpen] = useState(false);

  const completed = completedCount(lessons);
  const accuracy = accuracyAverage(lessons);
  const goalXp = todayXp(activity);
  const rank = getRank(xp);
  const rankIndex = RANKS.findIndex((item) => item.label === rank.label);
  const nextRank = RANKS[rankIndex + 1];
  const rankProgress = nextRank
    ? Math.min(100, Math.round(((xp - rank.min) / (nextRank.min - rank.min)) * 100))
    : 100;
  const perfectLessons = Object.values(lessons).filter(
    (lesson) => lesson.bestAccuracy === 100,
  ).length;
  const level1 = LEVELS[0];
  const level1Complete = level1.units.every((unit) => lessons[unit.id]?.completed);

  const achievementStats: AchievementStats = {
    completed,
    total: TOTAL_UNITS,
    streak,
    bestStreak,
    xp,
    bestAccuracy: accuracy,
    perfectLessons,
    level1Complete,
  };

  const unlocked = useMemo(
    () =>
      ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        current: achievement.value(achievementStats),
      })).filter((achievement) => achievement.current >= achievement.goal),
    [achievementStats],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mon espace"
        title="Ta progression"
        description="Chaque leçon terminée, chaque série de jours et chaque bonne réponse construit ta confiance en anglais."
        icon={BarChart3}
        iconTone="from-brand-500 to-brand-700"
        actions={
          <>
            <StatPill icon={Gem} value={xp} label="XP" tone="xp" />
            <StatPill icon={Flame} value={bestStreak} label="record" tone="flame" />
            <StatPill icon={Trophy} value={unlocked.length} label="succès" tone="mint" />
          </>
        }
      />

      <div className="animate-fade-up grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1b1938] via-[#262153] to-[#3a2c78] p-5 text-white shadow-[0_28px_60px_-30px_rgba(23,22,43,.85)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-400/30 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/70 ring-1 ring-white/10">
              <Medal size={12} className="text-amber-300" />
              Niveau {rank.label}
            </span>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Points d'expérience
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
                  {xp}
                  <span className="ml-1 text-base font-bold text-white/40">XP</span>
                </p>
              </div>
              <ProgressRing
                value={rankProgress}
                size={76}
                stroke={7}
                trackClassName="stroke-white/15"
                barClassName="stroke-emerald-300"
                label="Progression du rang"
              >
                <span className="text-[11px] font-extrabold text-white">{rankProgress}%</span>
              </ProgressRing>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-white/45">
                <span>
                  {nextRank ? `Prochain rang : ${nextRank.label}` : "Rang maximum atteint"}
                </span>
                <span>{nextRank ? `${Math.max(0, nextRank.min - xp)} XP restants` : "Bravo !"}</span>
              </div>
              <ProgressBar
                value={rankProgress}
                height="h-2"
                className="bg-white/15"
                barClassName="bg-gradient-to-r from-emerald-300 to-teal-300"
                label="Progression vers le prochain rang"
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                <p className="text-xl font-extrabold">{completed}</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-white/45">
                  Leçons
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                <p className="text-xl font-extrabold">{accuracy}%</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-white/45">
                  Précision
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                <p className="text-xl font-extrabold">{streak}</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-white/45">
                  Série
                </p>
              </div>
            </div>
          </div>
        </section>

        <WeeklyChart />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: CheckCircle2,
            value: `${completed}/${TOTAL_UNITS}`,
            label: "Leçons terminées",
            tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
          },
          {
            icon: Target,
            value: `${accuracy}%`,
            label: "Précision moyenne",
            tone: "bg-brand-50 text-brand-600 ring-brand-100",
          },
          {
            icon: Flame,
            value: `${bestStreak} j`,
            label: "Meilleure série",
            tone: "bg-amber-50 text-amber-600 ring-amber-100",
          },
          {
            icon: Bookmark,
            value: favorites.length,
            label: "Expressions favorites",
            tone: "bg-rose-50 text-rose-500 ring-rose-100",
          },
        ].map((stat) => (
          <div key={stat.label} className="card animate-fade-up flex items-center gap-3 p-4">
            <span className={cn("grid h-11 w-11 place-items-center rounded-2xl ring-1", stat.tone)}>
              <stat.icon size={19} strokeWidth={2.3} />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight text-ink">{stat.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold text-ink">Progression par niveau</h2>
            <p className="text-xs font-medium text-slate-400">
              {completed} leçons validées sur {TOTAL_UNITS}
            </p>
          </div>
          <Link
            to="/learn"
            className="text-[11px] font-extrabold text-brand-600 hover:text-brand-700"
          >
            Voir le parcours
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((level) => {
            const theme = LEVEL_THEMES[level.num];
            const done = level.units.filter((unit) => lessons[unit.id]?.completed).length;
            const value = percent(done, level.units.length);
            return (
              <div key={level.id} className="card p-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-base text-white",
                      theme.gradient,
                    )}
                  >
                    {LEVEL_EMOJIS[level.num]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold text-ink">{level.title}</p>
                    <p className="text-[10px] font-bold text-slate-400">{level.cefr}</p>
                  </div>
                  <span className={cn("text-[12px] font-extrabold", theme.text)}>{value}%</span>
                </div>
                <ProgressBar
                  value={value}
                  height="h-1.5"
                  className="mt-3"
                  barClassName={theme.bar}
                  label={`Progression ${level.title}`}
                />
                <p className="mt-1.5 text-[10px] font-bold text-slate-400">
                  {done}/{level.units.length} leçons
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold text-ink">Succès</h2>
            <p className="text-xs font-medium text-slate-400">
              {unlocked.length}/{ACHIEVEMENTS.length} débloqués
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 ring-1 ring-amber-100">
            <Award size={12} />
            {plural(unlocked.length, "succès")}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACHIEVEMENTS.map((achievement) => {
            const current = achievement.value(achievementStats);
            const done = current >= achievement.goal;
            const progress = Math.min(100, Math.round((current / achievement.goal) * 100));
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={cn(
                  "card flex items-start gap-3 p-4 transition",
                  done ? "bg-white" : "bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white",
                    done ? achievement.tone : "from-slate-200 to-slate-300",
                  )}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12.5px] font-extrabold text-ink">
                      {achievement.title}
                    </p>
                    {done && (
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                        <Check size={10} strokeWidth={3.5} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10.5px] font-medium leading-4 text-slate-400">
                    {achievement.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar
                      value={progress}
                      height="h-1.5"
                      barClassName={done ? "bg-emerald-500" : "bg-brand-400"}
                      label={`Progression : ${achievement.title}`}
                    />
                    <span className="shrink-0 text-[8.5px] font-extrabold text-slate-400">
                      {Math.min(current, achievement.goal)}/{achievement.goal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-500">
            <Settings2 size={16} />
          </span>
          <h2 className="text-[15px] font-extrabold text-ink">Préférences</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Target size={16} />
              </span>
              <div>
                <p className="text-[12.5px] font-extrabold text-ink">Objectif quotidien</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  {goalXp} XP aujourd'hui · {dailyGoal} XP visés
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[20, 30, 50, 100].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  className={cn(
                    "h-8 rounded-full px-3 text-[10px] font-extrabold transition",
                    dailyGoal === goal
                      ? "bg-ink text-white"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-200/70 hover:text-ink",
                  )}
                >
                  {goal} XP
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </span>
              <div>
                <p className="text-[12.5px] font-extrabold text-ink">Prononciation audio</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  Active ou désactive la synthèse vocale anglaise.
                </p>
              </div>
            </div>
            <Toggle checked={sound} onChange={setSound} label="Activer la prononciation audio" />
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                <CalendarDays size={16} />
              </span>
              <div>
                <p className="text-[12.5px] font-extrabold text-ink">Coeurs</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  Les erreurs retirent un cœur. Recharge-les à tout moment.
                </p>
              </div>
            </div>
            <Link
              to="/practice"
              className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-extrabold text-rose-600 ring-1 ring-rose-100"
            >
              Réviser
            </Link>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                <RotateCcw size={16} />
              </span>
              <div>
                <p className="text-[12.5px] font-extrabold text-ink">Réinitialiser la progression</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  Efface XP, leçons, favoris et succès. Action irréversible.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setResetOpen(true)}
              icon={RotateCcw}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] font-bold text-slate-400">
        Anglais Pro · {TOTAL_UNITS} leçons · Progression sauvegardée sur cet appareil
      </p>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Réinitialiser la progression ?"
        description="Toute ta progression sera effacée : XP, leçons terminées, favoris et succès. Tes préférences resteront intactes."
        icon={RotateCcw}
        iconTone="bg-rose-50 text-rose-500"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="danger"
              full
              onClick={() => {
                resetProgress();
                setResetOpen(false);
              }}
              icon={RotateCcw}
            >
              Oui, tout effacer
            </Button>
            <Button variant="secondary" full onClick={() => setResetOpen(false)}>
              Annuler
            </Button>
          </div>
        }
      />
    </div>
  );
}

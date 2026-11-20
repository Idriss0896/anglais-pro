import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Blocks,
  BookOpenCheck,
  CircleHelp,
  Dumbbell,
  FileText,
  Flame,
  Gauge,
  Gem,
  Layers,
  Link2,
  ListChecks,
  MousePointerClick,
  PenLine,
  Target,
  Trophy,
  type LucideIcon,
} from "@/lib/icons";
import { PageHeader } from "@/components/PageHeader";
import { StatPill } from "@/components/StatPill";
import { ProgressBar } from "@/components/ProgressBar";
import { ALL_QUESTIONS, TOTAL_PHRASES, TOTAL_QUESTIONS } from "@/data/curriculum";
import {
  accuracyAverage,
  completedCount,
  todayXp,
  useProgressStore,
} from "@/store/useProgressStore";
import { cn, plural } from "@/lib/utils";

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  questions: number;
  tone: string;
  soft: string;
  text: string;
  label: string;
}

const choiceCount = ALL_QUESTIONS.filter((question) => question.t === "choice").length;
const typeCount = ALL_QUESTIONS.filter((question) => question.t === "type").length;
const tilesCount = ALL_QUESTIONS.filter((question) => question.t === "tiles").length;
const matchCount = ALL_QUESTIONS.filter((question) => question.t === "match").length;

const modes: PracticeMode[] = [
  {
    id: "express",
    title: "Quiz express",
    description: "10 questions variées pour s'échauffer en quelques minutes.",
    icon: Gauge,
    questions: 10,
    tone: "bg-brand-500",
    soft: "bg-brand-soft",
    text: "text-brand-strong",
    label: "Le plus populaire",
  },
  {
    id: "marathon",
    title: "Marathon",
    description: "20 questions pour tester ton endurance et ta mémoire.",
    icon: Trophy,
    questions: 20,
    tone: "bg-[#131a33]",
    soft: "bg-slate-100",
    text: "text-ink",
    label: "Défi",
  },
  {
    id: "choice",
    title: "QCM",
    description: "Choisis la bonne réponse parmi plusieurs propositions.",
    icon: ListChecks,
    questions: 10,
    tone: "bg-sky-500",
    soft: "bg-sky-soft",
    text: "text-sky-strong",
    label: `${choiceCount} disponibles`,
  },
  {
    id: "type",
    title: "Saisie libre",
    description: "Écris la réponse en anglais, sans aide, comme en situation.",
    icon: PenLine,
    questions: 10,
    tone: "bg-emerald-500",
    soft: "bg-emerald-soft",
    text: "text-emerald-strong",
    label: `${typeCount} disponibles`,
  },
  {
    id: "tiles",
    title: "Assemblage",
    description: "Remets les mots dans le bon ordre pour reconstruire la phrase.",
    icon: Blocks,
    questions: 10,
    tone: "bg-amber-400",
    soft: "bg-amber-soft",
    text: "text-amber-strong",
    label: `${tilesCount} disponibles`,
  },
  {
    id: "match",
    title: "Association",
    description: "Associe chaque expression anglaise à sa traduction française.",
    icon: Link2,
    questions: 6,
    tone: "bg-rose-400",
    soft: "bg-rose-soft",
    text: "text-rose-strong",
    label: `${matchCount} disponibles`,
  },
];

function ModeCard({ mode }: { mode: PracticeMode }) {
  return (
    <Link
      to={`/practice/session/${mode.id}`}
      className="card card-hover group relative isolate flex min-h-[210px] flex-col overflow-hidden border border-line/80 p-4 transition-all duration-300 focus-visible:ring-4 focus-visible:ring-brand-300/45 sm:p-5"
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-1 opacity-80", mode.tone)}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-[0.08] blur-3xl transition duration-300 group-hover:opacity-20",
          mode.tone,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-12 w-12 place-items-center rounded-[18px] text-white shadow-md ring-1 ring-black/5 transition duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]",
            mode.tone,
          )}
        >
          <mode.icon size={22} strokeWidth={2.2} />
        </span>
        <span
          className={cn(
            "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-[10px] font-extrabold ring-1 ring-inset ring-black/5",
            mode.soft,
            mode.text,
          )}
        >
          {mode.label}
        </span>
      </div>
      <h3 className="relative mt-4 text-[17px] font-extrabold tracking-[-0.02em] text-ink sm:text-[18px]">
        {mode.title}
      </h3>
      <p className="relative mt-1.5 max-w-[38ch] text-[12px] font-medium leading-[1.65] text-slate-500 sm:text-[12.5px]">
        {mode.description}
      </p>
      <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-line/80 pt-3.5">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
          <CircleHelp size={14} className={mode.text} />
          {mode.questions} questions
        </span>
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[11.5px] font-extrabold text-brand-strong transition-all duration-200 group-hover:bg-brand-600 group-hover:text-white group-focus-visible:bg-brand-600 group-focus-visible:text-white">
          Commencer
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function PracticePage() {
  const { pathname } = useLocation();
  const exercisesMode = pathname === "/exercices";
  const xp = useProgressStore((state) => state.xp);
  const lessons = useProgressStore((state) => state.lessons);
  const activity = useProgressStore((state) => state.activity);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const streak = useProgressStore((state) => state.streak);
  const completed = completedCount(lessons);
  const accuracy = accuracyAverage(lessons);
  const goalXp = todayXp(activity);
  const goalPercent = dailyGoal ? Math.min(100, Math.round((goalXp / dailyGoal) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={exercisesMode ? "Exercices guidés" : "Salle d'entraînement"}
        title={exercisesMode ? "Comprendre, pratiquer, progresser" : "Réviser, encore et encore"}
        description={
          exercisesMode
            ? "Choisis un exercice, lis la consigne, réponds à ton rythme et découvre immédiatement pourquoi ta réponse est juste."
            : "Des sessions courtes et variées pour ancrer ce que tu apprends. Choisis ton format, on s'occupe du reste."
        }
        icon={exercisesMode ? ListChecks : Dumbbell}
        iconTone="bg-brand-500"
        actions={
          <>
            <StatPill icon={Gem} value={xp} label="XP" tone="xp" />
            <StatPill icon={Target} value={`${accuracy}%`} label="précision" tone="mint" />
            <StatPill icon={BookOpenCheck} value={completed} label="leçons" tone="neutral" />
          </>
        }
      />

      <div className="animate-fade-up grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-600 p-5 text-white shadow-[0_26px_56px_-28px_rgba(90,69,232,.9)] sm:p-6">
          <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75 ring-1 ring-white/10">
              <Flame size={12} className="text-amber-300" fill="currentColor" />
              {streak} jour{streak > 1 ? "s" : ""} de série
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Un petit entraînement vaut mieux qu'une longue pause.
            </h2>
            <p className="mt-2 max-w-lg text-[12.5px] font-medium leading-6 text-white/65">
              {goalPercent >= 100
                ? "Ton objectif du jour est atteint. Une session bonus pour consolider ?"
                : `Il te reste ${Math.max(0, dailyGoal - goalXp)} XP pour atteindre ton objectif. C'est le moment.`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/practice/session/express"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-surface px-5 text-sm font-extrabold text-ink transition hover:-translate-y-0.5"
              >
                <Gauge size={17} />
                Quiz express
              </Link>
              <Link
                to="/practice/flashcards"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-extrabold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <Layers size={17} />
                Cartes mémoire
              </Link>
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-center p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20">
                <Target size={17} />
              </span>
              <div>
                <p className="eyebrow">Aujourd'hui</p>
                <h2 className="text-[15px] font-extrabold text-ink">Objectif du jour</h2>
              </div>
            </div>
            <span className="text-lg font-extrabold text-emerald-strong">{goalPercent}%</span>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={goalPercent}
              height="h-2.5"
              barClassName="bg-emerald-400"
              label="Objectif quotidien"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>
                {goalXp} / {dailyGoal} XP
              </span>
              <span>{Math.max(0, dailyGoal - goalXp)} XP restants</span>
            </div>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[11px] font-medium leading-5 text-slate-500">
            {TOTAL_QUESTIONS} exercices et {TOTAL_PHRASES} expressions t'attendent dans
            la bibliothèque.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold text-ink">Choisis ton format</h2>
            <p className="text-xs font-medium text-slate-400">
              6 modes, {ALL_QUESTIONS.length} questions au total
            </p>
          </div>
          <span className="hidden items-center gap-1 text-[10px] font-bold text-slate-400 sm:inline-flex">
            <Gem size={12} className="text-violet-strong" fill="currentColor" />
            10 XP par bonne réponse
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modes.map((mode) => (
            <ModeCard key={mode.id} mode={mode} />
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand-strong">
            <CircleHelp size={16} />
          </span>
          <h2 className="text-[15px] font-extrabold text-ink">Comment ça marche ?</h2>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          {[
            {
              icon: MousePointerClick,
              title: "1. Choisis un mode",
              text: "Quiz express, QCM, saisie, assemblage ou association.",
            },
            {
              icon: PenLine,
              title: "2. Réponds à ton rythme",
              text: "Chaque réponse est corrigée avec une explication claire.",
            },
            {
              icon: Trophy,
              title: "3. Gagne de l'XP",
              text: "10 XP par bonne réponse. La régularité fait le reste.",
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "flex gap-3 p-5",
                index < 2 && "border-b border-line sm:border-b-0 sm:border-r",
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-slate-500">
                <step.icon size={16} />
              </span>
              <div>
                <p className="text-[12px] font-extrabold text-ink">{step.title}</p>
                <p className="mt-0.5 text-[10.5px] font-medium leading-5 text-slate-500">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

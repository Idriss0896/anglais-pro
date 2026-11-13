import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Heart,
  ListChecks,
  MessageCircle,
  Play,
  RotateCcw,
  Table2,
  Trophy,
  Volume2,
} from "lucide-react";
import { FocusShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Mascot, MascotSay, mascotFor, MASCOTS } from "@/components/Mascot";
import { StatPill } from "@/components/StatPill";
import { QuizSession } from "@/features/lesson/QuizSession";
import { ALL_QUESTIONS, getUnit, makePhraseId, unitMinutes } from "@/data/curriculum";
import { CATEGORIES } from "@/lib/categories";
import { LEVEL_THEMES } from "@/lib/levels";
import { speak } from "@/lib/audio";
import { cn, plural } from "@/lib/utils";
import { useProgressStore } from "@/store/useProgressStore";
import type { CurriculumUnit, TheoryBlock } from "@/types";

function PhraseLine({
  unit,
  block,
  blockIndex,
  itemIndex,
}: {
  unit: CurriculumUnit;
  block: TheoryBlock;
  blockIndex: number;
  itemIndex: number;
}) {
  const item = block.items?.[itemIndex];
  const favorites = useProgressStore((state) => state.favorites);
  const toggleFavorite = useProgressStore((state) => state.toggleFavorite);
  if (!item) return null;
  const id = makePhraseId(unit.id, blockIndex, itemIndex);
  const favorite = favorites.includes(id);

  return (
    <div className="group flex items-start gap-2.5 rounded-xl px-2 py-2 transition hover:bg-white">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-extrabold leading-snug text-ink">{item.en}</p>
        <p className="mt-0.5 text-[11.5px] font-medium leading-5 text-slate-500">{item.fr}</p>
        {item.note && (
          <p className="mt-1 text-[10px] font-bold text-slate-400">{item.note}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => speak(item.en)}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
          aria-label={`Écouter : ${item.en}`}
        >
          <Volume2 size={15} strokeWidth={2.3} />
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(id)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition",
            favorite
              ? "text-amber-500"
              : "text-slate-400 hover:bg-amber-50 hover:text-amber-500",
          )}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {favorite ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>
    </div>
  );
}

function TheoryContent({ unit }: { unit: CurriculumUnit }) {
  return (
    <div className="space-y-5">
      {unit.theory.map((block, blockIndex) => {
        if (block.t === "h") {
          return (
            <div key={blockIndex} className="flex items-center gap-2.5 pt-2">
              <span className="h-5 w-1 rounded-full bg-brand-500" />
              <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
                {block.text}
              </h3>
            </div>
          );
        }

        if (block.t === "p") {
          return (
            <p
              key={blockIndex}
              className="text-[14px] font-medium leading-7 text-slate-600 text-pretty"
            >
              {block.text}
            </p>
          );
        }

        if (block.t === "tip") {
          return (
            <div
              key={blockIndex}
              className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100"
            >
              <Mascot id="sam" mood="think" size={36} />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-600">
                  Sam te conseille
                </p>
                <p className="mt-0.5 text-[12.5px] font-semibold leading-6 text-amber-950/80">
                  {block.text}
                </p>
              </div>
            </div>
          );
        }

        if (block.t === "table") {
          return (
            <div
              key={blockIndex}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.07]"
            >
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-3.5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                <Table2 size={12.5} />
                Tableau
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse text-left">
                  {block.head && (
                    <thead>
                      <tr className="bg-[#f1f5ff]">
                        {block.head.map((head) => (
                          <th
                            key={head}
                            className="px-3.5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {(block.rows ?? []).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t border-slate-100/80 odd:bg-white even:bg-[#f8faff]"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={cn(
                              "px-3.5 py-2.5 text-[12.5px] font-medium leading-5 text-slate-600",
                              cellIndex === 0 && "font-extrabold text-ink",
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (block.t === "phrases") {
          return (
            <div
              key={blockIndex}
              className="rounded-2xl bg-[#f4f7ff] p-3.5 ring-1 ring-slate-900/[0.05] sm:p-4"
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <Mascot id={mascotFor(unit.id)} mood="talk" size={28} />
                <h4 className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                  {block.title ?? "À retenir"}
                </h4>
              </div>
              <div className="divide-y divide-slate-100/80">
                {(block.items ?? []).map((_, itemIndex) => (
                  <PhraseLine
                    key={itemIndex}
                    unit={unit}
                    block={block}
                    blockIndex={blockIndex}
                    itemIndex={itemIndex}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export function LessonPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const unit = getUnit(unitId);
  const [phase, setPhase] = useState<"theory" | "quiz">("theory");
  const lessons = useProgressStore((state) => state.lessons);
  const hearts = useProgressStore((state) => state.hearts);
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const progress = unit ? lessons[unit.id] : undefined;

  const questions = useMemo(
    () => (unit ? ALL_QUESTIONS.filter((question) => question.unitId === unit.id) : []),
    [unit],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [phase]);

  if (!unit) {
    return (
      <FocusShell>
        <div className="card mx-auto mt-16 max-w-md p-8 text-center">
          <p className="text-5xl">🧭</p>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">Leçon introuvable</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Cette leçon n'existe pas ou a été déplacée.
          </p>
          <Link
            to="/learn"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-brand-600 px-5 text-sm font-extrabold text-white"
          >
            Retour au parcours
          </Link>
        </div>
      </FocusShell>
    );
  }

  const theme = CATEGORIES[unit.cat];
  const levelTheme = LEVEL_THEMES[unit.level];
  const minutes = unitMinutes(unit);
  const phraseCount = unit.theory
    .filter((block) => block.t === "phrases")
    .reduce((sum, block) => sum + (block.items?.length ?? 0), 0);
  const tableCount = unit.theory.filter((block) => block.t === "table").length;

  if (phase === "quiz") {
    return (
      <FocusShell>
        <QuizSession
          title={unit.title}
          subtitle={unit.subtitle}
          questions={questions}
          context="lesson"
          exitLabel="Quitter la leçon"
          onExit={() => navigate(`/learn?level=${unit.level}`)}
          onComplete={(result) => {
            completeLesson(unit.id, result.accuracy, result.xp);
          }}
        />
      </FocusShell>
    );
  }

  return (
    <FocusShell>
      <header className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-extrabold text-slate-500 ring-1 ring-slate-900/[0.07] transition hover:text-ink"
        >
          <ArrowLeft size={15} />
          Retour
        </button>
        <div className="flex items-center gap-1.5">
          <StatPill icon={Heart} value={hearts} tone="heart" compact />
          <span className="rounded-full bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-900/[0.06]">
            Théorie · Exercice
          </span>
        </div>
      </header>

      <div className="animate-fade-up">
        <section
          className={cn(
            "relative overflow-hidden rounded-[30px] bg-gradient-to-br p-5 text-white shadow-[0_26px_56px_-28px_rgba(23,22,43,.5)] sm:p-7",
            theme.gradient,
          )}
        >
          <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/85 ring-1 ring-white/20">
                <GraduationCap size={11} />
                Niveau {unit.level} · {unit.levelCefr}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 ring-1 ring-white/15">
                {unit.levelTitle}
              </span>
              {progress?.completed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/90 px-2.5 py-1 text-[10px] font-extrabold text-emerald-950">
                  <CheckCircle2 size={11} strokeWidth={3} />
                  Terminé · {progress.bestAccuracy}%
                </span>
              )}
            </div>

            <div className="mt-5 flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur-sm sm:h-20 sm:w-20 sm:text-4xl">
                {unit.emoji}
              </span>
              <div className="min-w-0">
                <h1 className="text-balance text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-[32px]">
                  {unit.title}
                </h1>
                <p className="mt-1.5 max-w-xl text-[13px] font-medium leading-6 text-white/70">
                  {unit.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/70">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10">
                <ListChecks size={12.5} />
                {unit.quiz.length} exercices
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10">
                <Clock3 size={12.5} />
                {minutes} min
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10">
                <MessageCircle size={12.5} />
                {phraseCount} {plural(phraseCount, "expression")}
              </span>
              {tableCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10">
                  <Table2 size={12.5} />
                  {tableCount} {plural(tableCount, "tableau")}
                </span>
              )}
            </div>
          </div>
        </section>
      </div>

      <MascotSay
        id={mascotFor(unit.id)}
        mood="talk"
        label={`${MASCOTS[mascotFor(unit.id)].name}, ton coach`}
        className="mt-3"
      >
        Aujourd'hui, on travaille « {unit.title} ». Lis le cours ci-dessous, puis lance les{" "}
        {unit.quiz.length} exercices : tu peux gagner jusqu'à {unit.quiz.length * 10 + 20} XP.
      </MascotSay>

      <div className="mt-5 flex items-center gap-2">
        <CategoryBadge category={unit.cat} size="md" />
        <span
          className={cn(
            "rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ring-1",
            levelTheme.soft,
            levelTheme.text,
            levelTheme.ring,
          )}
        >
          {levelTheme.badge ? unit.levelTitle : unit.levelTitle}
        </span>
      </div>

      <article className="card mt-4 p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <BookmarkCheck size={15} strokeWidth={2.3} />
          </span>
          <div>
            <p className="eyebrow">Le cours</p>
            <h2 className="text-[16px] font-extrabold text-ink">Comprendre l'essentiel</h2>
          </div>
        </div>
        <TheoryContent unit={unit} />
      </article>

      <div className="sticky bottom-4 z-20 mt-5">
        <div className="glass flex items-center justify-between gap-3 rounded-[24px] border border-white/70 p-3 shadow-[0_18px_40px_-18px_rgba(23,22,43,.4)] sm:p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-600">
              {progress?.completed ? "Tu connais déjà ?" : "Prêt(e) à pratiquer ?"}
            </p>
            <p className="truncate text-[12px] font-extrabold text-ink">
              {unit.quiz.length} exercices corrigés · +{unit.quiz.length * 10 + 20} XP
            </p>
          </div>
          <Button
            onClick={() => setPhase("quiz")}
            size="md"
            icon={progress?.completed ? RotateCcw : Play}
            className="shrink-0"
          >
            {progress?.completed ? "Refaire" : "Commencer"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
        <Trophy size={12} />
        Chaque bonne réponse rapporte 10 XP · série maintenue à la fin de la leçon
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-900/[0.05]">
        <Link
          to={`/learn?level=${unit.level}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={14} />
          Toutes les leçons du niveau {unit.level}
        </Link>
        <Link
          to="/grammar"
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-600 hover:text-brand-700"
        >
          Grammaire
          <ArrowRight size={13} />
        </Link>
      </div>
    </FocusShell>
  );
}

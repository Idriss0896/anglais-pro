import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Flame,
  Gem,
  Heart,
  Lightbulb,
  PencilLine,
  RotateCcw,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatPill } from "@/components/StatPill";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Modal } from "@/components/Modal";
import { fireConfetti } from "@/components/Confetti";
import { useProgressStore } from "@/store/useProgressStore";
import { normalizeAnswer, shuffle, cn, plural } from "@/lib/utils";
import { speak } from "@/lib/audio";
import type { CurriculumQuestion, SessionResult } from "@/types";

interface FeedbackState {
  correct: boolean;
  explanation?: string;
  correctAnswer?: string;
}

interface QuestionViewProps {
  question: CurriculumQuestion;
  answered: boolean;
  isCorrect: boolean | null;
  onAnswer: (correct: boolean, explanation?: string, correctAnswer?: string) => void;
}

const typeLabels: Record<CurriculumQuestion["t"], string> = {
  choice: "Choisis la bonne réponse",
  tiles: "Assemble la phrase",
  type: "Écris la réponse",
  match: "Associe les paires",
};

function ChoiceQuestion({ question, answered, isCorrect, onAnswer }: QuestionViewProps) {
  const options = question.opts ?? [];
  const correctIndex = typeof question.a === "number" ? question.a : 0;
  const [selected, setSelected] = useState<number | null>(null);

  const choose = useCallback(
    (index: number) => {
      if (answered) return;
      setSelected(index);
      onAnswer(index === correctIndex, question.x, options[correctIndex]);
    },
    [answered, correctIndex, onAnswer, options, question.x],
  );

  useEffect(() => {
    if (answered) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const value = Number(event.key);
      if (value >= 1 && value <= options.length) {
        event.preventDefault();
        choose(value - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answered, choose, options.length]);

  return (
    <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="Réponses possibles">
      {options.map((option, index) => {
        const isRight = index === correctIndex;
        const isPicked = index === selected;
        return (
          <button
            key={`${option}-${index}`}
            type="button"
            role="radio"
            aria-checked={isPicked}
            disabled={answered}
            onClick={() => choose(index)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left text-[13.5px] font-bold ring-1 ring-slate-900/[0.08] transition-all sm:p-4",
              !answered && "hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-sm",
              answered && isRight && "bg-emerald-50 ring-2 ring-emerald-300",
              answered && isPicked && !isRight && "bg-rose-50 ring-2 ring-rose-300",
              answered && !isRight && !isPicked && "opacity-45",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-50 text-[11px] font-extrabold text-slate-400 transition",
                !answered && "group-hover:bg-brand-50 group-hover:text-brand-600",
                answered && isRight && "bg-emerald-500 text-white",
                answered && isPicked && !isRight && "bg-rose-500 text-white",
              )}
            >
              {answered && isRight ? (
                <Check size={15} strokeWidth={3} />
              ) : answered && isPicked && !isRight ? (
                <XCircle size={15} />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>
            <span className="min-w-0 flex-1">{option}</span>
            {index < 9 && !answered && (
              <span className="hidden h-5 w-5 place-items-center rounded-md bg-slate-50 text-[9px] font-extrabold text-slate-300 sm:grid">
                {index + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TypeQuestion({ question, answered, isCorrect, onAnswer }: QuestionViewProps) {
  const [value, setValue] = useState("");
  const answer = String(question.a ?? "");

  const check = () => {
    const normalized = normalizeAnswer(value);
    if (!normalized || answered) return;
    const accepted = [answer, ...(question.accept ?? [])].map(normalizeAnswer);
    onAnswer(accepted.includes(normalized), question.x, answer);
  };

  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
        check();
      }}
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={answered}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Écris ta réponse en anglais…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            "h-14 w-full rounded-2xl bg-white px-4 pr-12 text-[15px] font-bold text-ink shadow-sm ring-1 ring-slate-900/[0.08] transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-brand-300",
            answered && isCorrect && "bg-emerald-50 ring-2 ring-emerald-300",
            answered && isCorrect === false && "bg-rose-50 ring-2 ring-rose-300",
          )}
          aria-label="Ta réponse"
        />
        {answered && isCorrect && (
          <CheckCircle2
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
          />
        )}
        {answered && isCorrect === false && (
          <XCircle
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500"
          />
        )}
      </div>
      {!answered && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="hidden text-[10px] font-bold text-slate-400 sm:block">
            Appuie sur Entrée pour valider
          </p>
          <Button type="submit" size="md" disabled={!value.trim()}>
            Vérifier
          </Button>
        </div>
      )}
    </form>
  );
}

function TilesQuestion({ question, answered, onAnswer }: QuestionViewProps) {
  const tiles = question.tiles ?? [];
  const bank = useMemo(
    () => shuffle(tiles.map((word, index) => ({ word, index }))),
    // The question identity is enough: each new question gets its own bank.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );
  const [chosen, setChosen] = useState<number[]>([]);
  const answer = String(question.a ?? "");

  const check = () => {
    if (!chosen.length || answered) return;
    const built = normalizeAnswer(chosen.map((index) => tiles[index]).join(" "));
    const accepted = [answer, ...(question.accept ?? [])].map(normalizeAnswer);
    onAnswer(accepted.includes(built), question.x, answer);
  };

  return (
    <div className="mt-5">
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-900/[0.05]">
        {chosen.length === 0 && (
          <span className="px-2 text-[11px] font-bold text-slate-400">
            Clique sur les mots pour construire la phrase…
          </span>
        )}
        {chosen.map((index, position) => (
          <button
            key={`${index}-${position}`}
            type="button"
            disabled={answered}
            onClick={() => setChosen((current) => current.filter((_, i) => i !== position))}
            className="rounded-xl bg-white px-3 py-2 text-[13px] font-extrabold text-ink shadow-sm ring-1 ring-slate-900/[0.07] transition hover:bg-rose-50 hover:text-rose-600"
          >
            {tiles[index]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {bank.map(({ word, index }) => {
          const used = chosen.includes(index);
          return (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={answered || used}
              onClick={() => setChosen((current) => [...current, index])}
              className={cn(
                "rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-extrabold text-ink shadow-sm ring-1 ring-slate-900/[0.08] transition hover:-translate-y-0.5 hover:ring-brand-300",
                used && "pointer-events-none opacity-20",
              )}
            >
              {word}
            </button>
          );
        })}
      </div>

      {!answered && (
        <div className="mt-4 flex justify-end">
          <Button size="md" onClick={check} disabled={chosen.length === 0}>
            Vérifier
          </Button>
        </div>
      )}
    </div>
  );
}

function MatchQuestion({ question, answered, onAnswer }: QuestionViewProps) {
  const pairs = question.pairs ?? [];
  const rightOrder = useMemo(
    () => shuffle(pairs.map((pair, index) => ({ pair, index }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const resolved = useRef(false);

  useEffect(() => {
    if (matched.size !== pairs.length || pairs.length === 0 || resolved.current) return;
    resolved.current = true;
    onAnswer(
      mistakes === 0,
      mistakes === 0
        ? question.x || "Toutes les paires sont correctes."
        : `Tu as fait ${mistakes} erreur${mistakes > 1 ? "s" : ""} d'association.`,
      "Toutes les paires ont été associées.",
    );
  }, [matched, mistakes, onAnswer, pairs.length, question.x]);

  const pickRight = (index: number) => {
    if (answered || selectedLeft === null || matched.has(index)) return;
    if (selectedLeft === index) {
      setMatched((current) => new Set(current).add(index));
      setSelectedLeft(null);
    } else {
      setMistakes((value) => value + 1);
      setWrongRight(index);
      setSelectedLeft(null);
      window.setTimeout(() => setWrongRight(null), 420);
    }
  };

  return (
    <div className="mt-5">
      <p className="mb-3 text-[10px] font-bold text-slate-400">
        Sélectionne un mot anglais, puis sa traduction française.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-2">
          {pairs.map((pair, index) => {
            const isMatched = matched.has(index);
            return (
              <button
                key={`${pair.en}-${index}`}
                type="button"
                disabled={answered || isMatched}
                onClick={() => setSelectedLeft(index)}
                className={cn(
                  "w-full rounded-xl bg-white px-3 py-3 text-left text-[12.5px] font-extrabold text-ink ring-1 ring-slate-900/[0.08] transition",
                  selectedLeft === index && "bg-brand-50 ring-2 ring-brand-300",
                  isMatched && "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  !isMatched && !answered && "hover:-translate-y-0.5 hover:ring-brand-300",
                )}
              >
                <span className="flex items-center justify-between gap-1">
                  <span>{pair.en}</span>
                  {isMatched && <Check size={13} strokeWidth={3} className="text-emerald-500" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rightOrder.map(({ pair, index }) => {
            const isMatched = matched.has(index);
            return (
              <button
                key={`${pair.fr}-${index}`}
                type="button"
                disabled={answered || isMatched}
                onClick={() => pickRight(index)}
                className={cn(
                  "w-full rounded-xl bg-white px-3 py-3 text-left text-[12.5px] font-extrabold text-ink ring-1 ring-slate-900/[0.08] transition",
                  isMatched && "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  wrongRight === index && "bg-rose-50 text-rose-700 ring-2 ring-rose-300",
                  !isMatched && !answered && "hover:-translate-y-0.5 hover:ring-brand-300",
                )}
              >
                {pair.fr}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] font-bold text-slate-400">
        {matched.size}/{pairs.length} {plural(pairs.length, "paire")} associée
        {matched.size > 1 ? "s" : ""}
      </p>
    </div>
  );
}

function QuestionInput(props: QuestionViewProps) {
  switch (props.question.t) {
    case "choice":
      return <ChoiceQuestion {...props} />;
    case "type":
      return <TypeQuestion {...props} />;
    case "tiles":
      return <TilesQuestion {...props} />;
    case "match":
      return <MatchQuestion {...props} />;
    default:
      return null;
  }
}

interface QuizSessionProps {
  title: string;
  subtitle?: string;
  questions: CurriculumQuestion[];
  context: "lesson" | "practice";
  onExit: () => void;
  onComplete?: (result: SessionResult) => void;
  exitLabel?: string;
}

export function QuizSession({
  title,
  subtitle,
  questions,
  context,
  onExit,
  onComplete,
  exitLabel = "Quitter",
}: QuizSessionProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [result, setResult] = useState<SessionResult | null>(null);
  const [heartsOpen, setHeartsOpen] = useState(false);
  const resolved = useRef(false);
  const completed = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const hearts = useProgressStore((state) => state.hearts);
  const loseHeart = useProgressStore((state) => state.loseHeart);
  const restoreHearts = useProgressStore((state) => state.restoreHearts);

  const total = questions.length;
  const question = questions[index];

  useEffect(() => {
    if (useProgressStore.getState().hearts === 0) restoreHearts();
    // Only on mount: start each session with usable hearts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = window.setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [feedback]);

  const resolve = useCallback(
    (ok: boolean, explanation?: string, correctAnswer?: string) => {
      if (resolved.current) return;
      resolved.current = true;
      setIsCorrect(ok);
      setFeedback({ correct: ok, explanation, correctAnswer });
      if (ok) {
        setCorrect((value) => value + 1);
      } else {
        setMistakes((value) => value + 1);
        const currentHearts = useProgressStore.getState().hearts;
        loseHeart();
        if (currentHearts <= 1) setHeartsOpen(true);
      }
    },
    [loseHeart],
  );

  const finish = useCallback(() => {
    if (!completed.current) {
      completed.current = true;
      const accuracy = total ? Math.round((correct / total) * 100) : 0;
      const bonus = accuracy === 100 ? 25 : accuracy >= 80 ? 15 : 5;
      const xp = correct * 10 + bonus;
      const sessionResult: SessionResult = {
        correct,
        total,
        accuracy,
        xp,
        mistakes,
      };
      setResult(sessionResult);
      onComplete?.(sessionResult);
      if (accuracy >= 80) fireConfetti();
    }
    setPhase("result");
  }, [correct, mistakes, onComplete, total]);

  const next = () => {
    if (!feedback) return;
    resolved.current = false;
    setFeedback(null);
    setIsCorrect(null);
    if (index + 1 >= total) {
      finish();
    } else {
      setIndex((value) => value + 1);
    }
  };

  const restart = () => {
    resolved.current = false;
    completed.current = false;
    setIndex(0);
    setCorrect(0);
    setMistakes(0);
    setFeedback(null);
    setIsCorrect(null);
    setResult(null);
    setPhase("quiz");
    if (useProgressStore.getState().hearts === 0) restoreHearts();
  };

  if (phase === "result" && result) {
    const perfect = result.accuracy === 100;
    const excellent = result.accuracy >= 80;
    const good = result.accuracy >= 60;
    const heading = perfect
      ? "Parfait, sans faute !"
      : excellent
        ? "Excellent travail !"
        : good
          ? "Bien joué !"
          : "Continue, tu progresses !";
    const emoji = perfect ? "🏆" : excellent ? "🎉" : good ? "👏" : "💪";
    const streak = useProgressStore.getState().streak;

    return (
      <div className="animate-fade-up mx-auto max-w-2xl py-6 sm:py-10">
        <div className="card relative overflow-hidden p-6 text-center sm:p-9">
          <div className="pointer-events-none absolute inset-0 pattern-dots opacity-[0.06]" />
          <div className="relative">
            <div
              className={cn(
                "animate-pop mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br text-4xl shadow-xl sm:h-28 sm:w-28 sm:text-5xl",
                perfect
                  ? "from-amber-400 to-orange-500 shadow-amber-200"
                  : excellent
                    ? "from-brand-500 to-brand-700 shadow-brand-200"
                    : good
                      ? "from-emerald-400 to-teal-500 shadow-emerald-200"
                      : "from-sky-400 to-blue-500 shadow-sky-200",
              )}
              aria-hidden="true"
            >
              {emoji}
            </div>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-600">
              {context === "lesson" ? "Leçon terminée" : "Session terminée"}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
              {heading}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              {subtitle ?? title} · {result.correct}/{result.total}{" "}
              {plural(result.total, "bonne réponse", "bonnes réponses")}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <CheckCircle2 size={17} className="mx-auto text-emerald-500" />
                <p className="mt-1 text-lg font-extrabold text-ink">
                  {result.correct}/{result.total}
                </p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                  Correct
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <Trophy size={17} className="mx-auto text-amber-500" />
                <p className="mt-1 text-lg font-extrabold text-ink">{result.accuracy}%</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                  Précision
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <Gem size={17} className="mx-auto text-violet-500" fill="currentColor" />
                <p className="mt-1 text-lg font-extrabold text-ink">+{result.xp}</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                  XP gagnés
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">
                <Flame size={11} className="fill-current" />
                Série : {streak} jour{streak > 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-rose-600 ring-1 ring-rose-100">
                <Heart size={11} className="fill-current" />
                {result.mistakes} erreur{result.mistakes > 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={onExit} iconRight={ArrowRight} size="lg">
                {context === "lesson" ? "Retour au parcours" : "Retour à l'entraînement"}
              </Button>
              <Button variant="secondary" onClick={restart} icon={RotateCcw} size="lg">
                Refaire
              </Button>
            </div>
            <Link
              to="/progress"
              className="mt-4 inline-flex text-[11px] font-extrabold text-brand-600 hover:text-brand-700"
            >
              Voir ma progression
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = total ? (index / total) * 100 : 0;
  const correctAnswer =
    question.t === "choice"
      ? question.opts?.[Number(question.a)] ?? ""
      : String(question.a ?? "");

  return (
    <div className="mx-auto max-w-3xl">
      <header className="glass sticky top-0 z-20 -mx-4 mb-5 border-b border-slate-900/[0.06] px-4 pb-3 pt-3 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-900/[0.07] transition hover:text-ink"
            aria-label={exitLabel}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {context === "lesson" ? "Leçon en cours" : "Entraînement"}
            </p>
            <p className="truncate text-[12.5px] font-extrabold text-ink">{title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatPill
              icon={Heart}
              value={hearts}
              tone="heart"
              compact
              title="Cœurs restants"
            />
            <span className="text-[11px] font-extrabold tabular-nums text-slate-400">
              {index + 1}/{total}
            </span>
          </div>
        </div>
        <ProgressBar
          value={progress}
          height="h-1.5"
          className="mt-2.5"
          barClassName="bg-gradient-to-r from-brand-500 to-violet-400"
          label="Progression de la session"
        />
      </header>

      <div key={question.id} className="animate-slide-up">
        <div className="card overflow-hidden p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-700 ring-1 ring-brand-100">
              <PencilLine size={11} />
              {typeLabels[question.t]}
            </span>
            <CategoryBadge category={question.category} />
            <span className="ml-auto max-w-[45%] truncate text-[10px] font-bold text-slate-400">
              {question.unitEmoji} {question.unitTitle}
            </span>
          </div>

          <h2 className="mt-4 text-balance text-xl font-extrabold leading-snug tracking-[-0.02em] text-ink sm:text-[24px]">
            {question.q}
          </h2>
          {question.hint && (
            <p className="mt-2 inline-flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-800">
              <Lightbulb size={13} className="mt-0.5 shrink-0" />
              {question.hint}
            </p>
          )}

          <QuestionInput
            question={question}
            answered={Boolean(feedback)}
            isCorrect={isCorrect}
            onAnswer={resolve}
          />

          {question.t === "type" && feedback && (
            <button
              type="button"
              onClick={() => speak(correctAnswer)}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-600 hover:text-brand-700"
            >
              <Volume2 size={14} />
              Écouter la réponse
            </button>
          )}
        </div>

        {feedback && (
          <div
            ref={feedbackRef}
            className={cn(
              "animate-slide-up mt-3 rounded-[24px] p-4 ring-1 sm:p-5",
              feedback.correct
                ? "bg-emerald-50 ring-emerald-200"
                : "bg-rose-50 ring-rose-200",
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white",
                  feedback.correct ? "bg-emerald-500" : "bg-rose-500",
                )}
              >
                {feedback.correct ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <XCircle size={19} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "text-[14px] font-extrabold",
                      feedback.correct ? "text-emerald-800" : "text-rose-800",
                    )}
                  >
                    {feedback.correct ? "Correct !" : "Pas tout à fait…"}
                  </p>
                  {feedback.correct && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      <Gem size={10} fill="currentColor" />
                      +10 XP
                    </span>
                  )}
                </div>
                {!feedback.correct && feedback.correctAnswer && (
                  <p className="mt-1 text-[12px] font-bold text-rose-900/80">
                    Réponse attendue :{" "}
                    <span className="text-rose-950">{feedback.correctAnswer}</span>
                  </p>
                )}
                {feedback.explanation && (
                  <p className="mt-1 text-[11.5px] font-medium leading-5 text-slate-600">
                    {feedback.explanation}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant={feedback.correct ? "success" : "primary"}
                size="md"
                onClick={next}
                iconRight={index + 1 >= total ? Trophy : ArrowRight}
              >
                {index + 1 >= total ? "Voir les résultats" : "Continuer"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={heartsOpen}
        onClose={() => {
          restoreHearts();
          setHeartsOpen(false);
        }}
        title="Plus de cœurs !"
        description="On ne va pas te laisser t'arrêter en si bon chemin. Recharge tes cœurs et continue ta session."
        icon={Heart}
        iconTone="bg-rose-100 text-rose-500"
        hideClose
        footer={
          <div className="space-y-2">
            <Button
              full
              size="lg"
              onClick={() => {
                restoreHearts();
                setHeartsOpen(false);
              }}
              icon={Heart}
            >
              Recharger mes cœurs
            </Button>
            <button
              type="button"
              onClick={onExit}
              className="w-full py-1 text-[11px] font-extrabold text-slate-400 hover:text-ink"
            >
              Quitter la session
            </button>
          </div>
        }
      />
    </div>
  );
}

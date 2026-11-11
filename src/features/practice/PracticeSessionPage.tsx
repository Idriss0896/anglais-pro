import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FocusShell } from "@/components/AppShell";
import { QuizSession } from "@/features/lesson/QuizSession";
import { getQuestionsForMode } from "@/data/curriculum";
import { useProgressStore } from "@/store/useProgressStore";

const MODE_COPY: Record<
  string,
  { title: string; subtitle: string; context: "lesson" | "practice" }
> = {
  express: {
    title: "Quiz express",
    subtitle: "10 questions variées pour s'échauffer",
    context: "practice",
  },
  marathon: {
    title: "Marathon",
    subtitle: "20 questions pour aller au bout de toi-même",
    context: "practice",
  },
  choice: {
    title: "QCM",
    subtitle: "Choisis la bonne réponse",
    context: "practice",
  },
  type: {
    title: "Saisie libre",
    subtitle: "Écris la réponse en anglais",
    context: "practice",
  },
  tiles: {
    title: "Assemblage",
    subtitle: "Remets les mots dans le bon ordre",
    context: "practice",
  },
  match: {
    title: "Association",
    subtitle: "Relie les expressions à leur traduction",
    context: "practice",
  },
};

export function PracticeSessionPage() {
  const { mode = "express" } = useParams();
  const navigate = useNavigate();
  const addXp = useProgressStore((state) => state.addXp);
  const copy = MODE_COPY[mode] ?? MODE_COPY.express;
  const questions = useMemo(() => getQuestionsForMode(mode), [mode]);

  return (
    <FocusShell>
      <QuizSession
        title={copy.title}
        subtitle={copy.subtitle}
        questions={questions}
        context="practice"
        exitLabel="Quitter l'entraînement"
        onExit={() => navigate("/practice")}
        onComplete={(result) => addXp(result.xp)}
      />
    </FocusShell>
  );
}

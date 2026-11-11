import { useEffect } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HomePage } from "@/features/home/HomePage";
import { LearnPage } from "@/features/learn/LearnPage";
import { GrammarPage } from "@/features/grammar/GrammarPage";
import { VocabularyPage } from "@/features/vocabulary/VocabularyPage";
import { ExpressionsPage } from "@/features/expressions/ExpressionsPage";
import { PracticePage } from "@/features/practice/PracticePage";
import { PracticeSessionPage } from "@/features/practice/PracticeSessionPage";
import { FlashcardsPage } from "@/features/practice/FlashcardsPage";
import { LessonPage } from "@/features/lesson/LessonPage";
import { ProgressPage } from "@/features/progress/ProgressPage";
import { useProgressStore } from "@/store/useProgressStore";
import { primeSpeech, setAudioEnabled } from "@/lib/audio";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Compass size={28} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">Page introuvable</h1>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">
        Ce chemin ne mène nulle part. Reviens à l'accueil pour reprendre ton parcours.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex h-11 items-center rounded-2xl bg-brand-600 px-5 text-sm font-extrabold text-white"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function App() {
  const sound = useProgressStore((state) => state.sound);

  useEffect(() => {
    primeSpeech();
  }, []);

  useEffect(() => {
    setAudioEnabled(sound);
  }, [sound]);

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/lesson/:unitId" element={<LessonPage />} />
        <Route path="/practice/session/:mode" element={<PracticeSessionPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/expressions" element={<ExpressionsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/flashcards" element={<FlashcardsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

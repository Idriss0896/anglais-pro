import { useEffect, useState } from "react";
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { HomePage } from "@/features/home/HomePage";
import { LandingPage } from "@/features/landing/LandingPage";
import { LearnPage } from "@/features/learn/LearnPage";
import { GrammarPage } from "@/features/grammar/GrammarPage";
import { VocabularyPage } from "@/features/vocabulary/VocabularyPage";
import { ExpressionsPage } from "@/features/expressions/ExpressionsPage";
import { PracticePage } from "@/features/practice/PracticePage";
import { PracticeSessionPage } from "@/features/practice/PracticeSessionPage";
import { FlashcardsPage } from "@/features/practice/FlashcardsPage";
import { LessonPage } from "@/features/lesson/LessonPage";
import { ProgressPage } from "@/features/progress/ProgressPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AuthPage } from "@/features/auth/AuthPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { useSettingsStore } from "@/store/useSettingsStore";
import { primeSpeech, setAudioEnabled } from "@/lib/audio";
import { hasEnteredApp } from "@/lib/entry";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Applique le thème sur <html>. La page de présentation reste toujours en
 * clair : c'est une page marketing au fond violet, pensée pour ce rendu.
 */
function ThemeSync({ resolved, reducedMotion }: { resolved: string; reducedMotion: boolean }) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = pathname === "/" ? "light" : resolved;
  }, [resolved, pathname]);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "normal";
  }, [reducedMotion]);

  return null;
}

function Entry() {
  const { user, loading } = useAuth();
  const [entered] = useState(hasEnteredApp);

  if (!loading && user) return <Navigate to="/accueil" replace />;
  return <LandingPage returning={entered} />;
}

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-brand-strong">
        <Compass size={28} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">Page introuvable</h1>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">
        Ce chemin ne mène nulle part. Reviens à l'accueil pour reprendre ton parcours.
      </p>
      <Link
        to="/accueil"
        className="mt-5 inline-flex h-11 items-center rounded-2xl bg-brand-700 px-5 text-sm font-extrabold text-white transition-colors hover:bg-brand-800"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function App() {
  const theme = useSettingsStore((state) => state.theme);
  const audio = useSettingsStore((state) => state.audio);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    primeSpeech();
  }, []);

  // Suit le thème du système quand le réglage est sur « Système ».
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    setAudioEnabled(audio);
  }, [audio]);

  return (
    <HashRouter>
      <ThemeSync resolved={resolved} reducedMotion={reducedMotion} />
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/lesson/:unitId" element={<LessonPage />} />
          <Route path="/practice/session/:mode" element={<PracticeSessionPage />} />
          <Route element={<AppShell />}>
            <Route path="/accueil" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/expressions" element={<ExpressionsPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/flashcards" element={<FlashcardsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/reglages" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

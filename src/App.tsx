import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Compass } from "@/lib/icons";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LandingPage } from "@/features/landing/LandingPage";
import { useSettingsStore } from "@/store/useSettingsStore";
import { primeSpeech, setAudioEnabled } from "@/lib/audio";
import { hasEnteredApp } from "@/lib/entry";

/**
 * Les pages de l'application sont chargées à la demande : la première visite
 * n'embarque que la présentation, puis chaque écran arrive en quelques
 * millisecondes grâce au préchargement lancé pendant les temps morts.
 */
function page<T extends Record<string, unknown>>(name: keyof T, load: () => Promise<T>) {
  return lazy(() =>
    load().then((module) => ({ default: module[name] as ComponentType })),
  );
}

const loadHome = () => import("@/features/home/HomePage");
const loadLearn = () => import("@/features/learn/LearnPage");
const loadShell = () => import("@/components/AppShell");
const loadGrammar = () => import("@/features/grammar/GrammarPage");
const loadVocabulary = () => import("@/features/vocabulary/VocabularyPage");
const loadExpressions = () => import("@/features/expressions/ExpressionsPage");
const loadPractice = () => import("@/features/practice/PracticePage");
const loadPracticeSession = () => import("@/features/practice/PracticeSessionPage");
const loadFlashcards = () => import("@/features/practice/FlashcardsPage");
const loadLesson = () => import("@/features/lesson/LessonPage");
const loadProgress = () => import("@/features/progress/ProgressPage");
const loadSettings = () => import("@/features/settings/SettingsPage");
const loadAuth = () => import("@/features/auth/AuthPage");
const loadProfile = () => import("@/features/profile/ProfilePage");

const HomePage = page("HomePage", loadHome);
const AppShell = page("AppShell", loadShell);
const LearnPage = page("LearnPage", loadLearn);
const GrammarPage = page("GrammarPage", loadGrammar);
const VocabularyPage = page("VocabularyPage", loadVocabulary);
const ExpressionsPage = page("ExpressionsPage", loadExpressions);
const PracticePage = page("PracticePage", loadPractice);
const PracticeSessionPage = page("PracticeSessionPage", loadPracticeSession);
const FlashcardsPage = page("FlashcardsPage", loadFlashcards);
const LessonPage = page("LessonPage", loadLesson);
const ProgressPage = page("ProgressPage", loadProgress);
const SettingsPage = page("SettingsPage", loadSettings);
const AuthPage = page("AuthPage", loadAuth);
const ProfilePage = page("ProfilePage", loadProfile);

/**
 * Précharge les écrans principaux, mais seulement après le premier rendu et
 * jamais depuis la page de présentation. Le chargement à la demande reste la
 * priorité : on ne vole pas la bande passante ni le thread principal au écran
 * que le visiteur est en train de lire.
 */
function usePrefetchPages() {
  useEffect(() => {
    let timer = 0;
    let idleId = 0;
    let done = false;

    const load = () => {
      if (done) return;
      done = true;
      void loadHome();
      void loadLearn();
      void loadProgress();
      void loadGrammar();
      void loadVocabulary();
      void loadExpressions();
      void loadLesson();
      void loadPractice();
    };

    const isLanding = () => {
      const hash = window.location.hash;
      return !hash || hash === "#" || hash === "#/" || hash.startsWith("#/auth");
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (done || isLanding()) return;
      // 15 s : le visiteur a largement le temps de lire son écran avant que
      // les autres pages ne se préparent en arrière-plan.
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") {
          idleId = window.requestIdleCallback(load, { timeout: 2500 });
        } else {
          load();
        }
      }, 15_000);
    };

    const onInteract = () => {
      if (!isLanding()) load();
    };

    window.addEventListener("pointerdown", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("hashchange", schedule);
    schedule();

    return () => {
      window.clearTimeout(timer);
      if (idleId) window.cancelIdleCallback(idleId);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("hashchange", schedule);
    };
  }, []);
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <span
        aria-label="Chargement de la page"
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500/25 border-t-brand-600"
      />
    </div>
  );
}

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
function ThemeSync({ resolved }: { resolved: string }) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = pathname === "/" ? "light" : resolved;
  }, [resolved, pathname]);

  return null;
}

function Entry() {
  const { user, loading } = useAuth();
  const [entered] = useState(hasEnteredApp);

  if (!loading && user) return <Navigate to="/accueil" replace />;
  if (entered) return <Navigate to="/accueil" replace />;
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
  usePrefetchPages();
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
      <ThemeSync resolved={resolved} />
      <ErrorBoundary>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
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
                <Route path="/exercices" element={<PracticePage />} />
                <Route path="/practice/flashcards" element={<FlashcardsPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/reglages" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </HashRouter>
  );
}

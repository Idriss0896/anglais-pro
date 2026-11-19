import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Gem,
  Layers,
  Menu,
  MessageCircle,
  Mic,
  ShieldCheck,
  Target,
  Volume2,
  X,
} from "@/lib/icons";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Reveal } from "@/components/Reveal";
import { LEVEL_OVERVIEW, TOTAL_PHRASES, TOTAL_QUESTIONS, TOTAL_UNITS } from "@/data/overview";
import { markEnteredApp } from "@/lib/entry";
import { LEVEL_THEMES } from "@/lib/levels";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "methode", label: "La méthode" },
  { id: "lecons", label: "Les leçons" },
  { id: "securite", label: "Sécurité" },
];

const WAVE_BARS = [12, 22, 34, 18, 40, 26, 14, 32, 46, 24, 36, 16, 28, 20, 38, 13];

const STATS = [
  { value: TOTAL_UNITS, label: "leçons guidées" },
  { value: TOTAL_QUESTIONS, label: "exercices corrigés" },
  { value: TOTAL_PHRASES, label: "expressions prêtes à l'emploi" },
  { value: "4", label: "niveaux, de A1 à C1" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Des leçons qui tiennent en 5 minutes",
    text: "Un objectif clair par leçon, une règle expliquée simplement, puis des exercices qui vérifient que c'est acquis.",
    tone: "blue" as const,
  },
  {
    icon: Mic,
    title: "Une prononciation que tu entends vraiment",
    text: "Chaque mot et chaque expression se lit à voix haute. Tu écoutes, tu répètes, tu prends confiance.",
    tone: "white" as const,
  },
  {
    icon: BarChart3,
    title: "Une progression que tu vois",
    text: "XP, série de jours, précision et leçons terminées : tu sais toujours où tu en es et quoi faire ensuite.",
    tone: "blue" as const,
  },
];

const STEPS = [
  {
    title: "Choisis ton point de départ",
    text: "Débutant ou déjà à l'aise : le parcours s'adapte à ton niveau réel, sans test interminable.",
  },
  {
    title: "Écoute, réponds, répète",
    text: "Chaque leçon mêle compréhension, grammaire, vocabulaire et prononciation. Rien d'inutile.",
  },
  {
    title: "Reviens cinq minutes demain",
    text: "Ta série et ta progression t'attendent. C'est la régularité qui fait parler, pas les sessions marathon.",
  },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function EnterLink({
  to,
  children,
  className,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={() => {
        markEnteredApp();
        onNavigate?.();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

function LessonPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div
        aria-hidden="true"
        className="animate-glow pointer-events-none absolute -inset-10 rounded-[46px] bg-brand-300/30 blur-2xl"
      />

      <div className="animate-float-slower relative rounded-[30px] bg-white p-5 shadow-[0_44px_90px_-32px_rgba(15,10,50,0.75)] ring-1 ring-white/40 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-azure-soft px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.13em] text-azure-strong ring-1 ring-azure-500/12">
            <MessageCircle size={11} strokeWidth={2.8} />
            Expression du jour
          </span>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-extrabold text-brand-strong ring-1 ring-brand-strong/20">
            B2
          </span>
        </div>

        <p className="mt-4 font-display text-[23px] font-extrabold leading-[1.18] tracking-[-0.03em] text-ink">
          “Could you speak a little slower, please?”
        </p>
        <p className="mt-2 text-[12.5px] font-semibold leading-5 text-slate-500">
          Pourrais-tu parler un peu plus lentement, s'il te plaît ?
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface-soft p-3 ring-1 ring-azure-500/8">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2563eb] text-white shadow-[0_10px_20px_-8px_rgba(37,99,235,0.9)]">
            <Volume2 size={17} strokeWidth={2.5} />
          </span>
          <div className="flex h-9 flex-1 items-center justify-between gap-[3px]">
            {WAVE_BARS.map((height, index) => (
              <span
                key={index}
                className="animate-wave w-full max-w-[5px] rounded-full bg-[#60a5fa]"
                style={{ height: `${height}px`, animationDelay: `${index * 70}ms` }}
              />
            ))}
          </div>
          <span className="shrink-0 text-[10px] font-extrabold tabular-nums text-azure-strong">
            0:03
          </span>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-2 text-[10.5px] font-extrabold">
            <span className="text-slate-400">Parcours · leçon 12 sur {TOTAL_UNITS}</span>
            <span className="text-azure-strong">19 %</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[19%] rounded-full bg-[#2563eb]" />
          </div>
        </div>
      </div>

      <div className="animate-float absolute -right-3 -top-6 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_18px_36px_-18px_rgba(15,10,50,0.55)] ring-1 ring-slate-900/5 sm:flex">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-400 text-white">
          <Flame size={14} fill="currentColor" />
        </span>
        <span className="leading-none">
          <span className="block text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
            Série
          </span>
          <span className="mt-0.5 block text-[11px] font-extrabold text-ink">12 jours</span>
        </span>
      </div>

      <div className="animate-float-slow absolute -bottom-7 -left-2 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_18px_36px_-18px_rgba(15,10,50,0.55)] ring-1 ring-slate-900/5 sm:flex">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-500 text-white">
          <Check size={14} strokeWidth={3.2} />
        </span>
        <span className="leading-none">
          <span className="block text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
            Leçon terminée
          </span>
          <span className="mt-0.5 block text-[11px] font-extrabold text-ink">+20 XP</span>
        </span>
      </div>
    </div>
  );
}

function LandingNav({ returning }: { returning: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-[24px] px-3 transition-all duration-300 sm:px-4",
          scrolled
            ? "bg-white/92 shadow-[0_18px_44px_-26px_rgba(23,37,84,0.45)] ring-1 ring-slate-900/8 backdrop-blur-xl"
            : "bg-white/10 ring-1 ring-white/15 backdrop-blur-md",
        )}
      >
        <Logo onDark={!scrolled} compact={false} className="shrink-0" />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Sections du site">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[12px] font-extrabold transition",
                scrolled
                  ? "text-slate-500 hover:bg-slate-900/5 hover:text-ink"
                  : "text-indigo-100/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className={cn(
              "hidden h-10 items-center rounded-full px-4 text-[12px] font-extrabold transition sm:inline-flex",
              scrolled
                ? "text-slate-600 ring-1 ring-slate-900/10 hover:bg-slate-900/5 hover:text-ink"
                : "text-white ring-1 ring-white/25 hover:bg-white/10",
            )}
          >
            Se connecter
          </Link>
          <EnterLink
            to="/accueil"
            className="btn-shine inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-[12px] font-extrabold text-white shadow-[0_12px_26px_-12px_rgba(91,33,182,0.95)] ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-brand-700 max-[479px]:hidden"
          >
            {returning ? "Reprendre" : "Commencer"}
            <ArrowRight size={14} strokeWidth={2.6} />
          </EnterLink>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition lg:hidden",
              scrolled
                ? "bg-slate-900/5 text-ink ring-1 ring-slate-900/10"
                : "bg-white/10 text-white ring-1 ring-white/20",
            )}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-slide-up mx-auto mt-2 max-w-6xl overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(23,37,84,0.5)] ring-1 ring-slate-900/10 lg:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                setOpen(false);
                scrollToSection(link.id);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-[13px] font-extrabold text-slate-600 transition hover:bg-surface-soft hover:text-ink"
            >
              {link.label}
              <ChevronRight size={15} />
            </button>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center justify-center rounded-xl bg-brand-soft px-3.5 py-3 text-[13px] font-extrabold text-brand-strong ring-1 ring-brand-strong/20"
          >
            Se connecter
          </Link>
          <EnterLink
            to="/accueil"
            onNavigate={() => setOpen(false)}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-3 text-[13px] font-extrabold text-white ring-1 ring-brand-700/20"
          >
            {returning ? "Reprendre ma progression" : "Commencer gratuitement"}
            <ArrowRight size={15} strokeWidth={2.6} />
          </EnterLink>
        </div>
      )}
    </header>
  );
}

export function LandingPage({ returning = false }: { returning?: boolean }) {
  return (
    <div className="min-h-dvh bg-white">
      <LandingNav returning={returning} />

      <main>
        <section className="landing-hero relative overflow-hidden pb-28 pt-28 text-white sm:pb-32 sm:pt-32 lg:pb-36 lg:pt-36">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-grid" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#7c3aed]/55 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-[-10%] h-[380px] w-[380px] rounded-full bg-azure-500/40 blur-[110px]"
          />
          <div aria-hidden="true" className="landing-beam pointer-events-none absolute left-1/2 top-0 h-px w-[48%] -translate-x-1/2 bg-amber-300/80" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.06fr_1fr] lg:gap-10 lg:px-9">
            <div>
              <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100 ring-1 ring-white/20 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                {TOTAL_UNITS} leçons · {TOTAL_PHRASES} expressions
              </span>

              <h1
                className="animate-rise mt-5 max-w-[15ch] text-[38px] font-extrabold leading-[1.03] tracking-[-0.045em] sm:text-[52px] lg:text-[58px]"
                style={{ animationDelay: "70ms" }}
              >
                L'anglais qui se <span className="text-gradient">parle</span>, pas celui qu'on
                récite.
              </h1>

              <p
                className="animate-rise mt-5 max-w-[46ch] text-[14px] font-medium leading-7 text-indigo-100/80 sm:text-[15px]"
                style={{ animationDelay: "140ms" }}
              >
                Des leçons courtes, une voix qui prononce chaque mot et une progression claire.
                Cinq minutes par jour pour oser parler, vraiment.
              </p>

              <div
                className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={{ animationDelay: "210ms" }}
              >
                <EnterLink
                  to="/accueil"
                  className="btn-shine group flex h-14 items-center justify-between gap-4 rounded-2xl bg-white pl-5 pr-2 text-[14px] font-extrabold tracking-[-0.01em] text-brand-strong shadow-[0_22px_46px_-18px_rgba(0,0,0,0.7)] transition hover:-translate-y-0.5 hover:bg-amber-50 active:translate-y-0 sm:w-[300px]"
                >
                  <span className="font-nav truncate">
                    {returning ? "Reprendre ma progression" : "Commencer gratuitement"}
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition-transform group-hover:translate-x-0.5">
                    <MaterialIcon name="arrow_forward" size={19} />
                  </span>
                </EnterLink>
                <Link
                  to="/auth?mode=signup"
                  className="font-nav inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-[13px] font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
                >
                  <MaterialIcon name="person_add" size={18} />
                  Créer mon compte
                </Link>
              </div>

              <p
                className="animate-rise mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-indigo-100/60"
                style={{ animationDelay: "280ms" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Check size={12} strokeWidth={3} className="text-emerald-300" />
                  Sans carte bancaire
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={12} strokeWidth={3} className="text-emerald-300" />
                  Compte facultatif
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={12} strokeWidth={3} className="text-emerald-300" />
                  Progression sauvegardée
                </span>
              </p>
            </div>

            <div className="animate-rise" style={{ animationDelay: "180ms" }}>
              <LessonPreview />
            </div>
          </div>
        </section>

        <section aria-label="Chiffres clés" className="relative z-10 mx-auto -mt-14 w-full max-w-6xl px-4 sm:px-6 lg:px-9">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[26px] bg-slate-200/70 shadow-[0_30px_70px_-38px_rgba(23,37,84,0.55)] ring-1 ring-slate-900/5 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white px-4 py-5 text-center sm:px-6 sm:py-6"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.04em] text-ink sm:text-[30px]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10.5px] font-bold leading-4 text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="methode" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24 lg:px-9">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">La méthode</p>
              <h2 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[38px]">
                Tout ce qu'il faut pour oser parler — rien de plus.
              </h2>
              <p className="mt-3 text-[13.5px] font-medium leading-6 text-slate-500">
                Pas de contenu infini ni de leçons qui s'empilent. Un parcours structuré, des
                exercices utiles et une voix pour chaque phrase.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 90}>
                  <article
                    className={cn(
                      "card-hover h-full p-6",
                      feature.tone === "blue" ? "card-blue" : "card",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-2xl",
                        feature.tone === "blue"
                          ? "bg-white text-azure-strong ring-1 ring-azure-500/15"
                          : "bg-azure-soft text-azure-strong ring-1 ring-azure-500/10",
                      )}
                    >
                      <feature.icon size={20} strokeWidth={2.3} />
                    </span>
                    <h3 className="mt-4 text-[16.5px] font-extrabold leading-snug text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] font-medium leading-6 text-slate-500">
                      {feature.text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-900/5 bg-surface-soft px-4 py-20 sm:px-6 sm:py-24 lg:px-9">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <Reveal>
                <p className="eyebrow">En pratique</p>
                <h2 className="mt-2 max-w-[16ch] text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[36px]">
                  Trois habitudes, et l'anglais devient naturel.
                </h2>
                <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-900/5">
                  <Mascot id="sam" mood="hello" size={52} />
                  <p className="text-[12px] font-semibold leading-5 text-slate-500">
                    <span className="font-extrabold text-ink">Sam, coach prononciation :</span> «
                    Cinq minutes régulières valent mieux qu'une heure une fois par mois. »
                  </p>
                </div>
              </Reveal>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute left-[22px] top-4 hidden h-[calc(100%-2rem)] w-px bg-[#2563eb]/25 sm:block"
                />
                <ol className="space-y-4">
                  {STEPS.map((step, index) => (
                    <Reveal key={step.title} delay={index * 100}>
                      <li className="relative flex gap-4 rounded-[22px] bg-white p-4 ring-1 ring-slate-900/5 sm:gap-5 sm:p-5">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#2563eb] font-display text-[15px] font-extrabold text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.9)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-[14.5px] font-extrabold text-ink">{step.title}</h3>
                          <p className="mt-1 text-[12.5px] font-medium leading-6 text-slate-500">
                            {step.text}
                          </p>
                        </div>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="lecons" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24 lg:px-9">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="card-blue-deep relative overflow-hidden rounded-[32px] p-6 sm:p-9">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 pattern-dots opacity-30" />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                />

                <div className="relative flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-100/70">
                      Le parcours
                    </p>
                    <h2 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[34px]">
                      Du premier mot à la conversation.
                    </h2>
                    <p className="mt-3 text-[13px] font-medium leading-6 text-indigo-100/75">
                      {TOTAL_UNITS} leçons réparties en quatre niveaux, avec un objectif mesurable à
                      chaque étape.
                    </p>
                  </div>
                  <EnterLink
                    to="/learn"
                    className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-extrabold text-azure-strong shadow-[0_16px_30px_-16px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5"
                  >
                    Voir le parcours
                    <ArrowUpRight size={15} strokeWidth={2.6} />
                  </EnterLink>
                </div>

                <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {LEVEL_OVERVIEW.map((level) => {
                    const theme = LEVEL_THEMES[level.num];
                    return (
                      <div
                        key={level.id}
                        className="relative overflow-hidden rounded-[22px] bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                      >
                        <span
                          aria-hidden="true"
                          className={cn("absolute inset-x-0 top-0 h-1.5", theme.gradient)}
                        />
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("rounded-full bg-white/90 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.1em]", theme.text)}>
                            {level.cefr}
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-100/60">
                            {level.lessons} leçons
                          </span>
                        </div>
                        <h3 className="mt-3 text-[15.5px] font-extrabold text-white">
                          {level.title}
                        </h3>
                        <p className="mt-1 text-[11.5px] font-medium leading-5 text-indigo-100/70">
                          {level.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="securite" className="scroll-mt-28 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-9">
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <article className="card h-full p-6 sm:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20">
                  <ShieldCheck size={20} strokeWidth={2.3} />
                </span>
                <h2 className="mt-4 text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[28px]">
                  Ton compte et tes données restent à toi.
                </h2>
                <p className="mt-2 max-w-[52ch] text-[13px] font-medium leading-6 text-slate-500">
                  Mots de passe hachés, sessions chiffrées et expirantes, accès à la base limité au
                  serveur : aucune donnée personnelle n'est lisible depuis le navigateur.
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Mots de passe hachés (scrypt)",
                    "Sessions HttpOnly de 14 jours",
                    "Isolation des données par compte",
                    "Requêtes protégées contre le CSRF",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[12px] font-bold text-slate-600"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20">
                        <Check size={11} strokeWidth={3.2} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <Reveal delay={90}>
              <article className="card-blue flex h-full flex-col justify-between p-6 sm:p-8">
                <div>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-azure-strong ring-1 ring-azure-500/12">
                    <Target size={20} strokeWidth={2.3} />
                  </span>
                  <h2 className="mt-4 text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
                    Gratuit, sans engagement.
                  </h2>
                  <p className="mt-2 text-[12.5px] font-medium leading-6 text-slate-500">
                    Commence en invité, crée ton compte quand tu veux : ta progression est reprise
                    telle quelle.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[11px] font-extrabold text-azure-strong">
                  <Gem size={14} fill="currentColor" />
                  XP, série et leçons conservés
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-700 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-9">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-azure-500/30 blur-[90px]"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <Mascot id="mia" mood="cheer" size={54} />
                <div>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    <p className="font-nav text-[9.5px] font-bold uppercase tracking-[0.18em] text-amber-300">
                      Gratuit · sans carte bancaire
                    </p>
                  </span>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-100/60">
                    Ta première leçon t'attend
                  </p>
                </div>
              </div>
              <h2 className="font-display mt-5 text-balance text-[32px] font-extrabold leading-[1.03] tracking-[-0.045em] sm:text-[42px]">
                Dans cinq minutes, tu auras déjà{" "}
                <span className="text-amber-200">parlé anglais</span>.
              </h2>
              <p className="mt-3 max-w-md text-pretty text-[13px] font-medium leading-6 text-indigo-100/75">
                {TOTAL_QUESTIONS} exercices, {TOTAL_PHRASES} expressions et une voix pour tout
                prononcer. Il ne reste qu'à commencer.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-[320px]">
              <Link
                to="/auth?mode=signup"
                className="btn-shine group flex h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white pl-5 pr-2 text-[14px] font-extrabold tracking-[-0.01em] text-brand-strong shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)] transition hover:-translate-y-0.5 hover:bg-amber-50 active:translate-y-0"
              >
                <span className="font-nav truncate">Créer mon compte gratuit</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition-transform group-hover:translate-x-0.5">
                  <MaterialIcon name="arrow_forward" size={19} />
                </span>
              </Link>
              <EnterLink
                to="/accueil"
                className="font-nav inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-[12.5px] font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
              >
                Continuer sans compte
                <MaterialIcon name="chevron_right" size={17} />
              </EnterLink>
              <p className="mt-1 text-center text-[10.5px] font-semibold text-indigo-100/65">
                Déjà inscrit ?{" "}
                <Link
                  to="/auth"
                  className="font-bold text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1c0b45] px-4 py-12 text-white sm:px-6 lg:px-9">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-9 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo onDark />
              <p className="mt-3 max-w-xs text-[12px] font-medium leading-6 text-indigo-100/55">
                Apprendre l'anglais avec des leçons courtes, des exercices utiles et une
                prononciation claire.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100/45">
                Apprendre
              </p>
              <ul className="mt-3 space-y-2 text-[12px] font-bold text-indigo-100/70">
                <li>
                  <EnterLink to="/learn" className="transition hover:text-white">
                    Le parcours
                  </EnterLink>
                </li>
                <li>
                  <EnterLink to="/grammar" className="transition hover:text-white">
                    Grammaire
                  </EnterLink>
                </li>
                <li>
                  <EnterLink to="/vocabulary" className="transition hover:text-white">
                    Vocabulaire
                  </EnterLink>
                </li>
                <li>
                  <EnterLink to="/expressions" className="transition hover:text-white">
                    Expressions
                  </EnterLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100/45">
                Ton espace
              </p>
              <ul className="mt-3 space-y-2 text-[12px] font-bold text-indigo-100/70">
                <li>
                  <Link to="/auth" className="transition hover:text-white">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <EnterLink to="/progress" className="transition hover:text-white">
                    Ma progression
                  </EnterLink>
                </li>
                <li>
                  <EnterLink to="/profile" className="transition hover:text-white">
                    Mon profil
                  </EnterLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 text-[10.5px] font-semibold text-indigo-100/40 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} ANGLO CLUB. Tous droits réservés.</p>
            <p className="inline-flex items-center gap-1.5">
              <Layers size={12} />
              {TOTAL_UNITS} leçons · {TOTAL_QUESTIONS} exercices · {TOTAL_PHRASES} expressions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

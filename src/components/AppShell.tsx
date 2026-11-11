import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Code2,
  Dumbbell,
  Flame,
  Gem,
  Heart,
  Home,
  LayoutGrid,
  LifeBuoy,
  MessageCircle,
  Search,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { ProgressRing } from "./ProgressRing";
import { StatPill } from "./StatPill";
import { useProgressStore, todayXp } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { TOTAL_PHRASES, TOTAL_QUESTIONS, TOTAL_UNITS } from "@/data/curriculum";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const primaryNav: NavItem[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/learn", label: "Parcours", icon: LayoutGrid },
  { to: "/grammar", label: "Grammaire", icon: BookOpen },
  { to: "/vocabulary", label: "Vocabulaire", icon: Tag },
  { to: "/expressions", label: "Expressions", icon: MessageCircle },
];

const trainingNav: NavItem[] = [
  { to: "/practice", label: "Réviser", icon: Dumbbell },
  { to: "/progress", label: "Progression", icon: BarChart3 },
];

const mobileNav: NavItem[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/learn", label: "Cours", icon: BookOpen },
  { to: "/practice", label: "Réviser", icon: Dumbbell },
  { to: "/expressions", label: "Expressions", icon: MessageCircle },
  { to: "/progress", label: "Progrès", icon: BarChart3 },
];

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
  icon?: LucideIcon;
}

const footerNav: { title: string; links: FooterLink[] }[] = [
  {
    title: "Apprendre",
    links: [
      { label: "Parcours", to: "/learn" },
      { label: "Grammaire", to: "/grammar" },
      { label: "Vocabulaire", to: "/vocabulary" },
      { label: "Expressions", to: "/expressions" },
    ],
  },
  {
    title: "Entraînement",
    links: [
      { label: "Réviser", to: "/practice" },
      { label: "Cartes mémoire", to: "/practice/flashcards" },
      { label: "Progression", to: "/progress" },
    ],
  },
  {
    title: "Le projet",
    links: [
      { label: "Code source", href: "https://github.com/Idriss0896/anglais-pro", icon: Code2 },
      {
        label: "Signaler un problème",
        href: "https://github.com/Idriss0896/anglais-pro/issues/new",
        icon: LifeBuoy,
      },
      {
        label: "Licence MIT",
        href: "https://github.com/Idriss0896/anglais-pro/blob/main/LICENSE",
      },
    ],
  },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-bold transition-all duration-200",
          isActive
            ? "bg-white text-indigo-700 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]"
            : "text-indigo-100/70 hover:bg-white/10 hover:text-white",
        )
      }
    >
      <item.icon
        size={18}
        strokeWidth={2.3}
        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
      />
      {item.label}
    </NavLink>
  );
}

function Sidebar() {
  const xp = useProgressStore((state) => state.xp);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const activity = useProgressStore((state) => state.activity);
  const streak = useProgressStore((state) => state.streak);
  const rank = getRank(xp);
  const goalXp = todayXp(activity);
  const goalPercent = dailyGoal ? Math.min(100, Math.round((goalXp / dailyGoal) * 100)) : 0;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-hidden bg-gradient-to-b from-[#16143c] via-[#211d5a] to-[#312e81] px-4 py-5 lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl"
      />

      <div className="relative px-2">
        <Logo onDark />
      </div>

      <nav
        className="no-scrollbar relative mt-8 flex-1 space-y-1 overflow-y-auto"
        aria-label="Navigation principale"
      >
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200/45">
          Apprendre
        </p>
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <p className="px-3 pb-2 pt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200/45">
          Entraînement
        </p>
        {trainingNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="relative mt-4 space-y-3">
        <Link
          to="/progress"
          className="group block rounded-[24px] bg-white/10 p-4 text-white ring-1 ring-white/10 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.14]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100/55">
                Objectif du jour
              </p>
              <p className="mt-1 text-lg font-extrabold">
                {goalXp}
                <span className="text-sm font-bold text-indigo-100/50"> / {dailyGoal} XP</span>
              </p>
            </div>
            <ProgressRing
              value={goalPercent}
              size={48}
              stroke={5}
              trackClassName="stroke-white/15"
              barClassName="stroke-emerald-300"
              label="Objectif quotidien"
            >
              <span className="text-[10px] font-extrabold text-white">{goalPercent}%</span>
            </ProgressRing>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-indigo-100/70">
            <Flame size={12} className="text-amber-300" fill="currentColor" />
            {goalPercent >= 100 ? "Objectif atteint, bravo !" : `${dailyGoal - goalXp} XP restants`}
          </div>
        </Link>

        <Link
          to="/progress"
          className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white/10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-extrabold text-white ring-1 ring-white/20">
            AP
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-extrabold text-white">
              Mon espace
            </span>
            <span className="block truncate text-[11px] font-semibold text-indigo-100/55">
              {rank.label} · {streak} j de série
            </span>
          </span>
          <ChevronRight size={16} className="text-indigo-100/40" />
        </Link>
      </div>
    </aside>
  );
}

function DesktopTopBar() {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const hearts = useProgressStore((state) => state.hearts);
  const rank = getRank(xp);

  return (
    <div className="sticky top-0 z-30 hidden border-b border-slate-900/[0.07] bg-white/85 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-9">
        <Link
          to="/learn"
          className="group flex h-10 w-full max-w-sm items-center gap-2.5 rounded-2xl bg-slate-100/80 px-4 text-[13px] font-semibold text-slate-400 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-500 hover:ring-slate-200"
        >
          <Search size={16} className="shrink-0 text-slate-400" />
          <span className="truncate">Rechercher une leçon, une expression…</span>
          <kbd className="ml-auto hidden rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-slate-400 ring-1 ring-slate-200 xl:block">
            /
          </kbd>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <StatPill icon={Gem} value={xp} tone="xp" compact title="Points d'expérience" />
          <StatPill icon={Flame} value={streak} tone="flame" compact title="Série de jours" />
          <StatPill icon={Heart} value={hearts} tone="heart" compact title="Cœurs restants" />
          <Link
            to="/progress"
            className="ml-1 flex items-center gap-2.5 rounded-2xl p-1 pr-2 transition hover:bg-slate-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-extrabold text-white shadow-glow">
              AP
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-extrabold text-ink">Mon espace</span>
              <span className="block text-[10px] font-semibold text-slate-400">{rank.label}</span>
            </span>
            <ChevronRight size={14} className="text-slate-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileHeader() {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const hearts = useProgressStore((state) => state.hearts);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-gradient-to-r from-[#16143c] via-[#211d5a] to-[#312e81] shadow-[0_12px_30px_-18px_rgba(22,20,60,0.85)] lg:hidden">
      <div className="flex h-[62px] items-center justify-between gap-2 px-4">
        <Logo onDark />
        <div className="flex items-center gap-1.5">
          <StatPill onDark icon={Heart} value={hearts} compact title="Cœurs restants" />
          <StatPill onDark icon={Gem} value={xp} compact title="Points d'expérience" />
          <StatPill onDark icon={Flame} value={streak} compact title="Série de jours" />
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/[0.07] bg-white/90 px-2 pt-1.5 backdrop-blur-xl lg:hidden"
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-extrabold transition",
                isActive ? "text-brand-700" : "text-slate-400 hover:text-slate-600",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "grid h-8 w-10 place-items-center rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-active:scale-90",
                    isActive
                      ? "bg-brand-600 text-white shadow-[0_10px_20px_-10px_rgba(90,69,232,0.95)]"
                      : "bg-transparent",
                  )}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.7 : 2.1} />
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#16143c] to-[#0f0d2b] text-white lg:pl-[272px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 lg:px-9 lg:pb-10">
        <div className="grid gap-9 grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo onDark />
            <p className="mt-3 max-w-xs text-[12.5px] font-medium leading-6 text-indigo-100/55">
              Des leçons courtes, des exercices variés et un suivi clair pour progresser en
              anglais, cinq minutes par jour.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://github.com/Idriss0896/anglais-pro"
                target="_blank"
                rel="noreferrer"
                aria-label="Voir le code sur GitHub"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-indigo-100 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
              >
                <Code2 size={16} />
              </a>
              <Link
                to="/practice"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[11px] font-extrabold text-indigo-100 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
              >
                Commencer à réviser
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200/45">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-100/65 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-100/65 transition hover:text-white"
                      >
                        {link.icon && <link.icon size={13} />}
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] font-semibold text-indigo-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Anglais Pro — Apprendre l'anglais autrement.</p>
          <p>
            {TOTAL_UNITS} leçons · {TOTAL_QUESTIONS} exercices · {TOTAL_PHRASES} expressions
          </p>
        </div>
      </div>
    </footer>
  );
}

function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
    </div>
  );
}

export function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-dvh">
      <ScrollToTop />
      <AppBackground />
      <Sidebar />
      <MobileHeader />
      <main className="relative lg:pl-[272px]">
        <DesktopTopBar />
        <div
          key={pathname}
          className="animate-page-in mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pb-12 lg:pt-8"
        >
          <Outlet />
        </div>
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}

export function FocusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-4xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      {children}
    </div>
  );
}

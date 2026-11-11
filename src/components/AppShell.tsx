import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Heart,
  Home,
  LayoutGrid,
  MessageCircle,
  Sparkles,
  Tag,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { ProgressRing } from "./ProgressRing";
import { StatPill } from "./StatPill";
import { useProgressStore, todayXp } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn } from "@/lib/utils";

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
            ? "bg-brand-600 text-white shadow-[0_10px_22px_-12px_rgba(90,69,232,.9)]"
            : "text-slate-500 hover:bg-slate-900/[0.045] hover:text-ink",
        )
      }
    >
      <item.icon size={18} strokeWidth={2.3} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-slate-900/[0.06] bg-white/70 px-4 py-5 backdrop-blur-xl lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto no-scrollbar" aria-label="Navigation principale">
        <p className="eyebrow px-3 pb-2">Apprendre</p>
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <p className="eyebrow px-3 pb-2 pt-5">Entraînement</p>
        {trainingNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-4 space-y-3">
        <Link
          to="/progress"
          className="group block rounded-[24px] bg-gradient-to-br from-ink to-[#2a2755] p-4 text-white shadow-[0_18px_36px_-22px_rgba(23,22,43,.8)] transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/50">
                Objectif du jour
              </p>
              <p className="mt-1 text-lg font-extrabold">
                {goalXp}
                <span className="text-sm font-bold text-white/50"> / {dailyGoal} XP</span>
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
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-white/60">
            <Zap size={12} className="text-amber-300" fill="currentColor" />
            {goalPercent >= 100 ? "Objectif atteint, bravo !" : "Encore un petit effort"}
          </div>
        </Link>

        <Link
          to="/progress"
          className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-slate-900/[0.04]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-extrabold text-white">
            AP
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-extrabold text-ink">
              Mon espace
            </span>
            <span className="block truncate text-[11px] font-semibold text-slate-400">
              {rank.label} · {streak} j de série
            </span>
          </span>
          <Sparkles size={15} className="text-amber-400" />
        </Link>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const hearts = useProgressStore((state) => state.hearts);

  return (
    <header className="glass sticky top-0 z-30 border-b border-slate-900/[0.06] lg:hidden">
      <div className="flex h-[62px] items-center justify-between gap-2 px-4">
        <Logo />
        <div className="flex items-center gap-1.5">
          <StatPill icon={Heart} value={hearts} tone="heart" compact title="Cœurs restants" />
          <StatPill icon={Zap} value={xp} tone="xp" compact title="Points d'expérience" />
          <StatPill icon={Sparkles} value={streak} tone="flame" compact title="Série de jours" />
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav
      className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/[0.07] px-2 pt-1.5 lg:hidden"
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
                isActive ? "text-brand-600" : "text-slate-400 hover:text-slate-600",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "grid h-8 w-10 place-items-center rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-active:scale-90",
                    isActive ? "bg-brand-50 shadow-[0_8px_18px_-12px_rgba(90,69,232,.9)]" : "bg-transparent",
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
      <main className="relative lg:pl-[268px]">
        <div
          key={pathname}
          className="animate-page-in mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-9 lg:pb-14 lg:pt-9"
        >
          <Outlet />
        </div>
      </main>
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

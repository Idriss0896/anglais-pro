import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  BookOpenText,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Cloud,
  Dumbbell,
  Flame,
  Gem,
  Globe,
  Heart,
  Home,
  House,
  LayoutGrid,
  MessageCircle,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { GuestBanner } from "./GuestBanner";
import { HeaderStat, HeartsMeter } from "./HeaderStat";
import { Logo } from "./Logo";
import { ProgressRing } from "./ProgressRing";
import { UserAvatar } from "./UserAvatar";
import { UserMenu } from "./UserMenu";
import { MAX_HEARTS, useProgressStore, todayXp, completedCount } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn, formatNumber, percent, plural } from "@/lib/utils";
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

interface MobileNavItem extends NavItem {
  /** Dégradé de la tuile active. */
  tone: string;
  /** Teinte douce de la tuile au repos. */
  soft: string;
  /** Couleur de l'icône au repos. */
  ink: string;
  /** Ombre colorée sous la tuile active. */
  glow: string;
}

const mobileNav: MobileNavItem[] = [
  {
    to: "/",
    label: "Accueil",
    icon: House,
    end: true,
    tone: "from-violet-500 via-violet-500 to-indigo-600",
    soft: "bg-violet-50",
    ink: "text-violet-500",
    glow: "shadow-[0_14px_24px_-10px_rgba(109,76,246,0.9)]",
  },
  {
    to: "/learn",
    label: "Cours",
    icon: BookOpenText,
    tone: "from-sky-400 via-sky-500 to-blue-600",
    soft: "bg-sky-50",
    ink: "text-sky-500",
    glow: "shadow-[0_14px_24px_-10px_rgba(14,132,233,0.9)]",
  },
  {
    to: "/practice",
    label: "Réviser",
    icon: BrainCircuit,
    tone: "from-emerald-400 via-emerald-500 to-teal-600",
    soft: "bg-emerald-50",
    ink: "text-emerald-500",
    glow: "shadow-[0_14px_24px_-10px_rgba(5,150,105,0.9)]",
  },
  {
    to: "/expressions",
    label: "Expressions",
    icon: MessagesSquare,
    tone: "from-amber-400 via-orange-400 to-orange-500",
    soft: "bg-amber-50",
    ink: "text-amber-500",
    glow: "shadow-[0_14px_24px_-10px_rgba(245,158,11,0.95)]",
  },
  {
    to: "/progress",
    label: "Progrès",
    icon: ChartNoAxesColumnIncreasing,
    tone: "from-rose-400 via-pink-500 to-fuchsia-600",
    soft: "bg-rose-50",
    ink: "text-rose-500",
    glow: "shadow-[0_14px_24px_-10px_rgba(236,72,153,0.9)]",
  },
];

const footerNav: { title: string; links: { label: string; to: string }[] }[] = [
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
    title: "S'entraîner",
    links: [
      { label: "Réviser", to: "/practice" },
      { label: "Cartes mémoire", to: "/practice/flashcards" },
      { label: "Ma progression", to: "/progress" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Se connecter", to: "/auth" },
      { label: "Créer un compte", to: "/auth?mode=signup" },
      { label: "Mon profil", to: "/profile" },
    ],
  },
];

const SIDEBAR_KEY = "anglais-pro:sidebar";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) =>
        cn(
          "group flex items-center rounded-2xl text-[13.5px] font-bold transition-all duration-200",
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
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
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user } = useAuth();
  const xp = useProgressStore((state) => state.xp);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const activity = useProgressStore((state) => state.activity);
  const streak = useProgressStore((state) => state.streak);
  const rank = getRank(xp);
  const goalXp = todayXp(activity);
  const goalPercent = dailyGoal ? Math.min(100, Math.round((goalXp / dailyGoal) * 100)) : 0;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden bg-gradient-to-b from-[#16143c] via-[#211d5a] to-[#312e81] py-5 transition-[width,padding] duration-300 lg:flex",
        collapsed ? "w-[84px] px-2.5" : "w-[272px] px-4",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl"
      />

      <div
        className={cn(
          "relative flex",
          collapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-2",
        )}
      >
        <Logo compact={collapsed} onDark />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Afficher le menu" : "Masquer le menu"}
          title={collapsed ? "Afficher le menu" : "Masquer le menu"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-indigo-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <nav
        className="no-scrollbar relative mt-8 flex-1 space-y-1 overflow-y-auto overflow-x-hidden"
        aria-label="Navigation principale"
      >
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200/45">
            Apprendre
          </p>
        )}
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <p className="px-3 pb-2 pt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200/45">
            Entraînement
          </p>
        )}
        {collapsed && <div className="mx-auto my-2 h-px w-8 bg-white/10" />}
        {trainingNav.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={cn("relative mt-4", collapsed ? "space-y-2" : "space-y-3")}>
        {collapsed ? (
          <Link
            to="/progress"
            title={`Objectif du jour : ${goalXp} / ${dailyGoal} XP`}
            className="mx-auto grid place-items-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/10 transition hover:bg-white/15"
          >
            <ProgressRing
              value={goalPercent}
              size={44}
              stroke={5}
              trackClassName="stroke-white/15"
              barClassName="stroke-emerald-300"
              label="Objectif quotidien"
            >
              <span className="text-[9px] font-extrabold text-white">{goalPercent}%</span>
            </ProgressRing>
          </Link>
        ) : (
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
        )}

        <Link
          to={user ? "/profile" : "/auth"}
          title={user ? "Mon profil" : "Se connecter"}
          className={cn(
            "flex items-center rounded-2xl transition hover:bg-white/10",
            collapsed ? "justify-center p-1.5" : "gap-3 p-2.5",
          )}
        >
          <UserAvatar user={user} size={collapsed ? 38 : 40} onDark />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-extrabold text-white">
                  {user ? user.name || user.email.split("@")[0] : "Mon compte"}
                </span>
                <span className="block truncate text-[11px] font-semibold text-indigo-100/55">
                  {user ? `${rank.label} · ${streak} j de série` : "Se connecter ou s'inscrire"}
                </span>
              </span>
              <ChevronRight size={16} className="text-indigo-100/40" />
            </>
          )}
        </Link>
      </div>
    </aside>
  );
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function DesktopTopBar({
  collapsed,
  onToggle,
  scrolled,
}: {
  collapsed: boolean;
  onToggle: () => void;
  scrolled: boolean;
}) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const hearts = useProgressStore((state) => state.hearts);
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);

  return (
    <div
      className={cn(
        "sticky top-0 z-30 hidden transition-[padding] duration-300 lg:block",
        scrolled ? "pb-2 pt-2" : "pb-3 pt-4",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10 transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
        style={{
          height: "100%",
          background: "rgba(250, 249, 255, 0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
        }}
      />
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-2.5 rounded-[30px] bg-gradient-to-r from-[#16143c] via-[#241f5e] to-[#4c1d95] ring-1 ring-white/10 transition-all duration-300",
          scrolled
            ? "h-[60px] px-2.5 shadow-[0_16px_34px_-22px_rgba(22,20,60,0.85)]"
            : "h-[68px] px-3 shadow-[0_26px_60px_-32px_rgba(22,20,60,0.95)]",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Afficher le menu" : "Masquer le menu"}
          title={collapsed ? "Afficher le menu" : "Masquer le menu"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-indigo-100 ring-1 ring-white/15 transition hover:bg-white/20 hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <Link
          to="/learn"
          className="group flex h-10 w-full max-w-[280px] items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 text-[12.5px] font-semibold text-indigo-100/55 ring-1 ring-white/10 transition hover:bg-white/[0.16] hover:text-white"
        >
          <Search size={16} className="shrink-0 text-indigo-200/70" />
          <span className="truncate">Rechercher une leçon…</span>
          <kbd className="ml-auto hidden rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-100/45 ring-1 ring-white/15 xl:block">
            /
          </kbd>
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/progress"
            title={`Parcours : ${completed} leçons terminées sur ${TOTAL_UNITS}`}
            className="flex h-11 items-center gap-2.5 rounded-2xl bg-white/10 py-1 pl-1 pr-3 ring-1 ring-white/15 transition hover:bg-white/[0.17]"
          >
            <ProgressRing
              value={overall}
              size={36}
              stroke={4}
              trackClassName="stroke-white/15"
              barClassName="stroke-emerald-300"
              label="Progression du parcours"
            >
              <span className="text-[9px] font-extrabold text-white">{overall}%</span>
            </ProgressRing>
            <span className="hidden leading-none xl:block">
              <span className="block text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-indigo-100/55">
                Parcours
              </span>
              <span className="mt-1 block text-[12.5px] font-extrabold text-white">
                {completed}/{TOTAL_UNITS} leçons
              </span>
            </span>
          </Link>

          <HeaderStat
            icon={Gem}
            tone="violet"
            label="Points"
            value={`${formatNumber(xp)} XP`}
            title={`${formatNumber(xp)} points d'expérience`}
            to="/progress"
            className="hidden md:inline-flex"
          />

          <HeaderStat
            icon={Flame}
            tone="amber"
            filled
            label="Série"
            value={`${streak} ${plural(streak, "jour", "jours")}`}
            title={`Série de ${streak} ${plural(streak, "jour", "jours")}`}
            to="/progress"
            className="hidden xl:inline-flex"
          />

          <Link
            to="/progress"
            title={`${hearts} cœur${hearts > 1 ? "s" : ""} sur ${MAX_HEARTS}`}
            aria-label={`${hearts} cœurs restants sur ${MAX_HEARTS}`}
            className="group flex h-11 items-center gap-2.5 rounded-2xl bg-white/10 px-2.5 ring-1 ring-white/15 transition hover:bg-white/[0.17]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <Heart size={14} strokeWidth={2.4} fill="currentColor" />
            </span>
            <span className="leading-none">
              <span className="block text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-indigo-100/55">
                Cœurs
              </span>
              <span className="mt-1 block">
                <HeartsMeter hearts={hearts} max={MAX_HEARTS} />
              </span>
            </span>
          </Link>

          <div className="ml-1">
            <UserMenu showIdentity onDark />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHeader({ scrolled }: { scrolled: boolean }) {
  const hearts = useProgressStore((state) => state.hearts);
  const xp = useProgressStore((state) => state.xp);
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 px-3 transition-[padding] duration-300 lg:hidden",
        scrolled ? "pb-1.5 pt-1.5" : "pb-2 pt-3",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10 transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
        style={{
          height: "100%",
          background: "rgba(250, 249, 255, 0.84)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
        }}
      />
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-[26px] bg-gradient-to-r from-[#16143c] via-[#2a2470] to-[#4c1d95] px-2.5 ring-1 ring-white/15 transition-all duration-300",
          scrolled
            ? "h-[58px] shadow-[0_12px_28px_-18px_rgba(22,20,60,0.85)]"
            : "h-16 shadow-[0_20px_44px_-22px_rgba(22,20,60,0.9)]",
        )}
      >
        <Logo compact onDark />

        <Link
          to="/progress"
          aria-label={`Progression du parcours : ${overall}%`}
          className="min-w-0 flex-1 rounded-2xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/15 transition hover:bg-white/[0.17] max-[359px]:px-2"
        >
          <div className="flex items-center justify-between gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-indigo-100/65 max-[359px]:justify-center">
            <span className="truncate max-[359px]:hidden">Avancée</span>
            <span className="text-white">{overall}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15 max-[359px]:hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 transition-[width] duration-700"
              style={{ width: `${overall}%` }}
            />
          </div>
        </Link>

        <Link
          to="/progress"
          title={`${hearts} cœur${hearts > 1 ? "s" : ""} sur ${MAX_HEARTS}`}
          aria-label={`${hearts} cœurs restants sur ${MAX_HEARTS}`}
          className="group grid h-10 shrink-0 place-items-center rounded-2xl bg-white/10 px-2 ring-1 ring-white/15 transition hover:bg-white/[0.17]"
        >
          <HeartsMeter hearts={hearts} max={MAX_HEARTS} size={8} />
        </Link>

        <HeaderStat
          compact
          icon={Gem}
          tone="violet"
          label="Points"
          value={`${formatNumber(xp)} XP`}
          title={`${formatNumber(xp)} points d'expérience`}
          to="/progress"
        />

        <UserMenu onDark />
      </div>
    </header>
  );
}

function BottomNav() {
  const { pathname } = useLocation();
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => {
    if (!pressed) return;
    const timer = window.setTimeout(() => setPressed(null), 520);
    return () => window.clearTimeout(timer);
  }, [pressed]);

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[max(0.7rem,env(safe-area-inset-bottom))] min-[360px]:px-3 lg:hidden"
      aria-label="Navigation mobile"
    >
      <div className="pointer-events-auto mx-auto max-w-md rounded-[27px] bg-gradient-to-r from-violet-500/70 via-fuchsia-400/55 to-amber-400/75 p-[1.6px] shadow-[0_26px_58px_-24px_rgba(23,22,43,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-0.5 rounded-[25.6px] bg-white/95 px-1.5 py-1.5 ring-1 ring-white/60">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onPointerDown={() => setPressed(item.to)}
              onClick={() => {
                if (pathname === item.to) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group relative flex min-w-0 flex-1 flex-col items-center gap-[3px] rounded-[19px] px-0.5 pb-1 pt-1.5"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "relative grid h-[38px] w-full max-w-[48px] place-items-center rounded-[14px] transition-all duration-300 ease-out",
                      isActive
                        ? cn(
                            "-translate-y-px bg-gradient-to-br text-white",
                            item.tone,
                            item.glow,
                          )
                        : cn(
                            item.soft,
                            item.ink,
                            "group-hover:-translate-y-px group-active:scale-90",
                          ),
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.45),transparent_62%)]"
                      />
                    )}
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2.2}
                      className={cn(
                        "relative transition-transform duration-300",
                        pressed === item.to && "animate-nav-press",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "w-full truncate text-center text-[9.5px] leading-none tracking-[-0.01em] transition-colors max-[359px]:text-[9px] max-[359px]:tracking-[-0.03em]",
                      isActive ? "font-extrabold text-ink" : "font-bold text-slate-500",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function SiteFooter({ collapsed }: { collapsed: boolean }) {
  const stats = [
    { value: TOTAL_UNITS, label: "leçons" },
    { value: TOTAL_QUESTIONS, label: "exercices" },
    { value: TOTAL_PHRASES, label: "expressions" },
  ];

  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-[#16143c] via-[#131031] to-[#0b0920] text-white transition-[padding] duration-300",
        collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-11 sm:px-6 lg:px-9 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.35fr] lg:gap-14">
          <div>
            <Logo onDark />
            <p className="mt-3 max-w-sm text-[12.5px] font-medium leading-6 text-indigo-100/55">
              Cinq minutes par jour pour parler anglais avec assurance. Des leçons courtes, des
              exercices variés et un suivi clair de ta progression.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/auth?mode=signup"
                className="btn-shine inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[12.5px] font-extrabold text-brand-800 shadow-[0_16px_34px_-20px_rgba(0,0,0,0.9)] transition hover:-translate-y-0.5"
              >
                Créer mon compte gratuit
                <ChevronRight size={15} />
              </Link>
              <Link
                to="/practice"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-[12.5px] font-extrabold text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Réviser maintenant
              </Link>
            </div>

            <dl className="mt-6 grid max-w-sm grid-cols-3 gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/[0.07] px-3 py-2.5 ring-1 ring-white/10"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-[15px] font-extrabold leading-none tabular-nums">
                    {formatNumber(stat.value)}
                  </dd>
                  <dd className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-indigo-100/45">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-8">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-indigo-200/45 sm:text-[10px] sm:tracking-[0.16em]">
                  {group.title}
                </p>
                <ul className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-flex text-[11.5px] font-semibold leading-tight text-indigo-100/65 transition hover:translate-x-0.5 hover:text-white sm:text-[12.5px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-indigo-100/45">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <Globe size={12} />
            </span>
            Français (France)
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-indigo-100/40">
            <span className="inline-flex items-center gap-1.5 text-emerald-200/70">
              <Cloud size={12} />
              Progression synchronisée
            </span>
            <span>© 2026 Anglais Pro</span>
          </div>
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
  const scrolled = useScrolled();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  return (
    <div className="min-h-dvh">
      <ScrollToTop />
      <AppBackground />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <MobileHeader scrolled={scrolled} />
      <main
        className={cn(
          "relative transition-[padding] duration-300",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]",
        )}
      >
        <DesktopTopBar
          collapsed={collapsed}
          scrolled={scrolled}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <div
          key={pathname}
          className="animate-page-in mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pb-12 lg:pt-6"
        >
          <GuestBanner />
          <Outlet />
        </div>
      </main>
      <SiteFooter collapsed={collapsed} />
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

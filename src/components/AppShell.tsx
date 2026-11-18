import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Dumbbell,
  Home,
  LayoutGrid,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shapes,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { GuestBanner } from "./GuestBanner";
import { HeaderStat } from "./HeaderStat";
import { Logo } from "./Logo";
import { MaterialIcon } from "./MaterialIcon";
import { ProgressRing } from "./ProgressRing";
import { QuickSearch } from "./QuickSearch";
import { UserAvatar } from "./UserAvatar";
import { UserMenu } from "./UserMenu";
import { useProgressStore, completedCount } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn, formatNumber, percent, plural } from "@/lib/utils";
import { TOTAL_PHRASES, TOTAL_QUESTIONS, TOTAL_UNITS } from "@/data/overview";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}

const primaryNav: NavItem[] = [
  { to: "/accueil", label: "Accueil", icon: Home, end: true },
  { to: "/learn", label: "Parcours", icon: LayoutGrid },
  { to: "/grammar", label: "Grammaire", icon: BookOpen },
  { to: "/vocabulary", label: "Vocabulaire", icon: Shapes },
  { to: "/expressions", label: "Expressions", icon: MessageCircle },
];

const trainingNav: NavItem[] = [
  { to: "/practice", label: "Réviser", icon: Dumbbell },
  { to: "/progress", label: "Progression", icon: BarChart3 },
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
      { label: "Réglages", to: "/reglages" },
    ],
  },
];

const SIDEBAR_KEY = "anglais-pro:sidebar";

/** Violet uni de la coquille (barre latérale et barre supérieure). */
const SHELL = "app-shell-glow";
/** Violet plus profond du pied de page. */
const SHELL_DEEP = "bg-[#2e1065]";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function SidebarLink({
  item,
  collapsed,
  onSelect,
}: {
  item: NavItem;
  collapsed: boolean;
  onSelect?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      onClick={onSelect}
      className={({ isActive }) =>
        cn(
          "font-nav group flex items-center rounded-2xl text-[13.5px] font-semibold tracking-[-0.01em] transition-all duration-200 hover:-translate-y-0.5",
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-white text-[#7c2dff]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={19} strokeWidth={isActive ? 2.6 : 2.1} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  open,
  onClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const drawerHidden = !isDesktop && !open;
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const rank = getRank(xp);

  return (
    <aside
      id="app-sidebar"
      aria-label="Menu latéral"
      aria-hidden={drawerHidden || undefined}
      inert={drawerHidden || undefined}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_36px_80px_-40px_rgba(30,16,60,0.9)] will-change-transform",
        SHELL,
        "transition-[width,padding,transform] duration-300 ease-out lg:translate-x-0 lg:shadow-none",
        collapsed ? "w-[84px] px-2.5" : "w-[272px] px-4",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div
        className={cn(
          "relative flex",
          collapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-2",
        )}
      >
        <Logo to="/accueil" compact={collapsed} onDark />
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Déplier le menu"
              : isDesktop
                ? "Réduire le menu"
                : "Réduire le menu en icônes"
          }
          title={collapsed ? "Déplier le menu" : "Réduire le menu"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
      </div>

      <nav
        className="no-scrollbar relative mt-7 flex-1 space-y-1 overflow-y-auto overflow-x-hidden"
        aria-label="Navigation principale"
      >
        {!collapsed && (
          <p className="font-nav px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Apprendre
          </p>
        )}
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} onSelect={onClose} />
        ))}

        {!collapsed && (
          <p className="font-nav px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Entraînement
          </p>
        )}
        {collapsed && <div className="mx-auto my-2 h-px w-8 bg-white/15" />}
        {trainingNav.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} onSelect={onClose} />
        ))}
      </nav>

      <div className="relative mt-3 space-y-1">
        <NavLink
          to="/reglages"
          title="Réglages"
          aria-label="Réglages"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "font-nav flex items-center rounded-2xl text-[13.5px] font-semibold transition-colors",
              collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
              isActive
                ? "bg-white text-[#7c2dff]"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={19} strokeWidth={isActive ? 2.6 : 2.1} />
              {!collapsed && <span className="truncate">Réglages</span>}
            </>
          )}
        </NavLink>

        <div className="h-px bg-white/15" />

        <Link
          to={user ? "/profile" : "/auth"}
          title={user ? "Mon profil" : "Se connecter"}
          onClick={onClose}
          className={cn(
            "flex items-center rounded-2xl transition-colors hover:bg-white/10",
            collapsed ? "justify-center p-1.5" : "gap-3 p-2.5",
          )}
        >
          <UserAvatar user={user} size={collapsed ? 38 : 40} onDark />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="font-nav block truncate text-[13px] font-semibold text-white">
                  {user ? user.name || user.email.split("@")[0] : "Mon compte"}
                </span>
                <span className="font-nav block truncate text-[11px] font-normal text-white/60">
                  {user ? `${rank.label} · ${streak} j de série` : "Se connecter ou s'inscrire"}
                </span>
              </span>
              <ChevronRight size={18} className="text-white/55" />
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

function DesktopTopBar({ scrolled }: { scrolled: boolean }) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const overall = percent(completed, TOTAL_UNITS);

  return (
    <div className="sticky top-0 z-30 hidden lg:block">
      <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6 lg:px-9">
        <div
          className={cn(
            "flex h-16 items-center gap-2.5 rounded-[26px] px-3 ring-1 ring-white/15 transition-shadow duration-300",
            SHELL,
            scrolled
              ? "shadow-[0_16px_34px_-22px_rgba(59,24,120,0.85)]"
              : "shadow-[0_22px_48px_-28px_rgba(59,24,120,0.9)]",
          )}
        >
          {/* Recherche intégrée : on tape directement, les résultats s'affichent dessous. */}
          <QuickSearch className="w-full max-w-[320px]" />

          <div className="ml-auto flex items-center gap-1.5">
            <HeaderStat
              icon={<MaterialIcon name="diamond" size={15} filled />}
              tone="violet"
              label="Points"
              value={`${formatNumber(xp)} XP`}
              title={`${formatNumber(xp)} points d'expérience`}
              to="/progress"
            />

            <HeaderStat
              icon={<MaterialIcon name="local_fire_department" size={16} filled />}
              tone="amber"
              label="Série"
              value={`${streak} ${plural(streak, "jour", "jours")}`}
              title={`Série de ${streak} ${plural(streak, "jour", "jours")}`}
              to="/progress"
            />

            <Link
              to="/progress"
              title={`Parcours : ${completed} leçons terminées sur ${TOTAL_UNITS}`}
              aria-label={`Parcours : ${completed} leçons terminées sur ${TOTAL_UNITS}`}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              <ProgressRing
                value={overall}
                size={34}
                stroke={4}
                trackClassName="stroke-white/25"
                barClassName="stroke-emerald-300"
                label="Progression du parcours"
              >
                <span className="text-[8.5px] font-extrabold text-white">{overall}%</span>
              </ProgressRing>
            </Link>

            <div className="ml-1">
              <UserMenu showIdentity onDark />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHeader({
  onOpenMenu,
  searchOpen,
  onOpenSearch,
  onCloseSearch,
}: {
  onOpenMenu: () => void;
  searchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
}) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 lg:hidden">
      <div
        className={cn(
          "rounded-[24px] px-2.5 ring-1 ring-white/15 shadow-[0_18px_40px_-22px_rgba(59,24,120,0.9)]",
          SHELL,
        )}
      >
        <div className="flex h-16 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            title="Ouvrir le menu"
            aria-controls="app-sidebar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-indigo-100 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
          >
            <PanelLeftOpen size={20} />
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Rechercher un mot"
            title="Rechercher un mot"
            aria-expanded={searchOpen}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1 ring-white/15 transition-colors",
              searchOpen
                ? "bg-white text-brand-700"
                : "bg-white/10 text-indigo-100 hover:bg-white/20 hover:text-white",
            )}
          >
            <MaterialIcon name="search" size={20} />
          </button>

          <HeaderStat
            compact
            className="ml-auto"
            icon={<MaterialIcon name="local_fire_department" size={14} filled />}
            tone="amber"
            label="Série"
            value={`${streak} j`}
            title={`Série de ${streak} ${plural(streak, "jour", "jours")}`}
            to="/progress"
          />

          <HeaderStat
            compact
            icon={<MaterialIcon name="diamond" size={13} filled />}
            tone="violet"
            label="Points"
            content={
              <>
                {formatNumber(xp)}
                <span className="hidden min-[360px]:inline"> XP</span>
              </>
            }
            title={`${formatNumber(xp)} points d'expérience`}
            to="/progress"
          />

          <UserMenu onDark />
        </div>

        {searchOpen && (
          <div className="pb-2.5">
            <QuickSearch variant="mobile" autoFocus onClose={onCloseSearch} />
          </div>
        )}
      </div>
    </header>
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
        "relative overflow-hidden text-white transition-[padding] duration-300",
        SHELL_DEEP,
        collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]",
      )}
    >
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-11 sm:px-6 lg:px-9 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.35fr] lg:gap-14">
          <div>
            <Logo to="/accueil" onDark />
            <p className="mt-3 max-w-sm text-[12.5px] font-medium leading-6 text-indigo-100/70">
              Cinq minutes par jour pour parler anglais avec assurance. Des leçons courtes,
              des exercices variés et un suivi clair de ta progression.
            </p>

            <div className="mt-5 max-w-sm overflow-hidden rounded-[26px] bg-[#3b1878] p-4 ring-1 ring-white/12 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.95)]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                <p className="font-nav text-[9.5px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Gratuit · sans carte bancaire
                </p>
              </div>

              <p className="font-display mt-2 text-[21px] font-extrabold leading-[1.12] tracking-[-0.025em] text-white">
                Ton compte t'attend.
                <br />
                <span className="text-amber-200">Commence en 30 secondes.</span>
              </p>

              <Link
                to="/auth?mode=signup"
                className="group mt-4 flex h-14 w-full items-center justify-between gap-2 rounded-2xl bg-white pl-4 pr-1.5 text-[13.5px] font-extrabold tracking-[-0.01em] text-[#3b1878] shadow-[0_18px_36px_-22px_rgba(0,0,0,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-50 active:translate-y-0"
              >
                <span className="font-nav truncate">Créer mon compte gratuit</span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#4c1d95] text-white transition-transform duration-200 group-hover:translate-x-0.5">
                  <MaterialIcon name="arrow_forward" size={20} />
                </span>
              </Link>

              <Link
                to="/practice"
                className="font-nav mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-[12.5px] font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
              >
                <MaterialIcon name="fitness_center" size={17} />
                Réviser maintenant
              </Link>

              <p className="mt-2.5 text-center text-[9.5px] font-semibold text-indigo-100/60">
                Progression sauvegardée · mode invité inclus
              </p>
            </div>

            <dl className="mt-6 grid max-w-sm grid-cols-3 gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-[15px] font-extrabold leading-none tabular-nums">
                    {formatNumber(stat.value)}
                  </dd>
                  <dd className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-indigo-100/50">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-8">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-indigo-200/50 sm:text-[10px] sm:tracking-[0.16em]">
                  {group.title}
                </p>
                <ul className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-flex text-[11.5px] font-semibold leading-tight text-indigo-100/70 transition-colors hover:text-white sm:text-[12.5px]"
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
          <div className="flex items-center gap-2 text-[11.5px] font-semibold text-indigo-100/50">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <MaterialIcon name="public" size={14} />
            </span>
            Français (France)
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-indigo-100/45">
            <span>© 2026 ANGLO CLUB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const scrolled = useScrolled();
  const isDesktop = useIsDesktop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  // Le menu mobile se referme à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Le menu se referme aussi si la fenêtre repasse en grand écran.
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  // Verrouille le défilement du fond et gère la touche Échap quand le tiroir est ouvert.
  useEffect(() => {
    if (!mobileOpen || isDesktop) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, isDesktop]);

  // Ctrl/Cmd + K : ouvre la recherche mobile (sur ordinateur, « / » suffit).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openSearch = () => {
    setMobileOpen(false);
    setSearchOpen(true);
  };

  return (
    <div className="min-h-dvh">
      <ScrollToTop />

      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[#1e1060]/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <MobileHeader
        onOpenMenu={() => setMobileOpen(true)}
        searchOpen={searchOpen}
        onOpenSearch={() => setSearchOpen((value) => !value)}
        onCloseSearch={() => setSearchOpen(false)}
      />
      <main
        className={cn(
          "relative transition-[padding] duration-300",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]",
        )}
      >
        <DesktopTopBar scrolled={scrolled} />
        <div
          key={pathname}
          className="animate-page-in mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pb-12 lg:pt-6"
        >
          <GuestBanner />
          <Outlet />
        </div>
      </main>
      <SiteFooter collapsed={collapsed} />
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

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Dumbbell,
  Home,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shapes,
  X,
} from "@/lib/icons";
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
  { to: "/exercices", label: "Exercices", icon: ListChecks },
  { to: "/progress", label: "Progression", icon: BarChart3 },
  { to: "/reglages", label: "Réglages", icon: Settings },
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

/**
 * Sur mobile, la page ne doit jamais glisser latéralement ni se laisser
 * pincer. On combine le verrou CSS (`overflow-x: clip`, `touch-action`) avec
 * ce garde-fou : toute dérive horizontale est ramenée à zéro, et un geste
 * franchement horizontal est bloqué hors des listes qui défilent d'elles-mêmes.
 */
function useHorizontalLock() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let allowPanX = false;

    const reset = () => {
      if (window.scrollX !== 0) {
        window.scrollTo({ left: 0, top: window.scrollY, behavior: "instant" as ScrollBehavior });
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      allowPanX = Boolean(
        (event.target as Element | null)?.closest(
          '[data-pan-x], .overflow-x-auto, .no-scrollbar-x',
        ),
      );
      if (event.touches.length !== 1) {
        tracking = false;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      // Deux doigts ou plus : on refuse le zoom par pincement.
      if (event.touches.length > 1) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      if (!tracking || allowPanX) return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && event.cancelable) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      tracking = false;
      allowPanX = false;
      reset();
    };

    // Safari iOS : les événements « gesture » sont la porte d'entrée du zoom.
    const blockGesture = (event: Event) => event.preventDefault();

    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.addEventListener("gesturestart", blockGesture, { passive: false });
    document.addEventListener("gesturechange", blockGesture, { passive: false });

    reset();

    return () => {
      window.removeEventListener("scroll", reset);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("gesturechange", blockGesture);
    };
  }, []);
}

/** Permet de parcourir le menu avec un geste de glissement, comme une poignée. */
function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const drag = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    startScrollTop: 0,
  });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (event: PointerEvent<T>) => {
    // Sur mobile, on laisse le navigateur gérer le scroll tactile natif.
    if (event.pointerType === "touch") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const element = ref.current;
    if (!element) return;

    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: element.scrollTop,
    };
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const element = ref.current;
    const state = drag.current;
    if (!element || !state.active || state.pointerId !== event.pointerId) return;

    const delta = event.clientY - state.startY;
    if (Math.abs(delta) <= 4) return;

    if (!element.hasPointerCapture?.(event.pointerId)) {
      element.setPointerCapture?.(event.pointerId);
    }
    setDragging(true);
    element.scrollTop = state.startScrollTop - delta;
    event.preventDefault();
  };

  const endDrag = (event: PointerEvent<T>) => {
    const element = ref.current;
    const state = drag.current;
    if (!element || !state.active || state.pointerId !== event.pointerId) return;

    if (element.hasPointerCapture?.(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    state.active = false;
    setDragging(false);
  };

  return {
    ref,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}

function SidebarLink({
  item,
  collapsed,
  step,
  onSelect,
}: {
  item: NavItem;
  collapsed: boolean;
  /** Position dans le menu : sert au décalage de l'animation mobile. */
  step: number;
  onSelect?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      onClick={onSelect}
      style={{ "--nav-step": Math.min(step, 5) } as CSSProperties}
      className={({ isActive }) =>
        cn(
          "sidebar-link font-nav group relative flex items-center rounded-2xl text-base font-semibold tracking-[-0.01em] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:text-[13.5px]",
          collapsed ? "justify-center px-0 py-2" : "gap-3 px-2.5 py-1.5 lg:py-2",
          isActive
            ? collapsed
              ? "bg-white/15 text-white"
              : "bg-white text-brand-700 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.75)]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "sidebar-icon-tile grid shrink-0 place-items-center rounded-2xl lg:rounded-xl",
              collapsed ? "h-9 w-9" : "h-10 w-10 lg:h-8 lg:w-8",
              isActive
                ? collapsed
                  ? "bg-white text-brand-700"
                  : "bg-brand-600 text-white"
                : "bg-white/10 text-white/85 group-hover:scale-105 group-hover:bg-white/20 group-hover:text-white",
            )}
          >
            <item.icon size={19} strokeWidth={isActive ? 2.6 : 2.1} />
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <ChevronRight
                size={16}
                className={cn(
                  "shrink-0 transition-all duration-200",
                  isActive
                    ? "text-brand-600/60"
                    : "-translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white/60",
                )}
              />
            </>
          )}
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
  const navDrag = useDragScroll<HTMLElement>();

  return (
    <aside
      id="app-sidebar"
      aria-label="Menu latéral"
      aria-hidden={drawerHidden || undefined}
      inert={drawerHidden || undefined}
      data-open={open || undefined}
      data-collapsed={collapsed || undefined}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_36px_80px_-40px_rgba(30,16,60,0.9)] will-change-[transform,translate] lg:pt-5",
        SHELL,
        "transition-[width,padding,transform,translate] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] lg:translate-x-0 lg:shadow-none",
        collapsed ? "w-[84px] px-2.5" : "w-[292px] px-4 lg:w-[272px]",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div
        className={cn(
          "relative flex",
          collapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-2",
        )}
      >
        <Logo to="/accueil" compact={collapsed} onDark variant="sidebar" />
        {isDesktop ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            title={collapsed ? "Déplier le menu" : "Réduire le menu"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            title="Fermer le menu"
            className="sidebar-close-button grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-[0_10px_22px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/70 transition-[transform,background-color] duration-300 hover:rotate-90 hover:bg-amber-50 active:scale-95"
          >
            <X size={21} strokeWidth={2.6} />
          </button>
        )}
      </div>

      <nav
        ref={navDrag.ref}
        onPointerDown={navDrag.onPointerDown}
        onPointerMove={navDrag.onPointerMove}
        onPointerUp={navDrag.onPointerUp}
        onPointerCancel={navDrag.onPointerCancel}
        data-dragging={navDrag.dragging || undefined}
        className={cn(
          "sidebar-drag-scroll no-scrollbar relative mt-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden lg:mt-7",
          navDrag.dragging && "is-dragging",
        )}
        aria-label="Navigation principale — glisse pour parcourir"
      >
        {!collapsed && (
          <p className="sidebar-section-title font-nav flex items-center gap-2 px-3 pb-2">
            <span className="sidebar-section-icon"><Lightbulb size={13} /></span>
            <span>Apprendre</span>
            <span className="h-px flex-1 bg-white/20" />
          </p>
        )}
        <div className="sidebar-nav-group">
          {primaryNav.map((item, index) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              step={index}
              onSelect={onClose}
            />
          ))}
        </div>

        {!collapsed && (
          <p className="sidebar-section-title font-nav flex items-center gap-2 px-3 pb-2 pt-4 lg:pt-5">
            <span className="sidebar-section-icon"><Dumbbell size={13} /></span>
            <span>Entraînement</span>
            <span className="h-px flex-1 bg-white/20" />
          </p>
        )}
        {collapsed && <div className="mx-auto my-2 h-px w-8 bg-white/15" />}
        <div className="sidebar-nav-group">
          {trainingNav.map((item, index) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              step={index}
              onSelect={onClose}
            />
          ))}
        </div>
      </nav>

      <div className="relative mt-3 space-y-1">
        <div className="my-2 h-px bg-white/15" />

        <Link
          to={user ? "/profile" : "/auth"}
          title={user ? "Mon profil" : "Se connecter"}
          onClick={onClose}
          className={cn(
            "group flex items-center rounded-2xl ring-1 ring-transparent transition-all duration-200 hover:bg-white/10 hover:ring-white/15 active:scale-[0.99]",
            collapsed ? "justify-center p-1.5" : "gap-3 p-2.5",
          )}
        >
          <UserAvatar user={user} size={collapsed ? 38 : 40} onDark />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="font-nav block truncate text-[14px] font-semibold text-white lg:text-[13px]">
                  {user ? user.name || user.email.split("@")[0] : "Mon compte"}
                </span>
                <span className="font-nav block truncate text-[12px] font-normal text-white/70 lg:text-[11px] lg:text-white/60">
                  {user ? `${rank.label} · ${streak} j de série` : "Se connecter ou s'inscrire"}
                </span>
              </span>
              <ChevronRight
                size={18}
                className="shrink-0 text-white/55 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white"
              />
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

function MobileHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 lg:hidden">
      <div
        className={cn(
          "rounded-[24px] px-2.5 py-2 ring-1 ring-white/15 shadow-[0_18px_40px_-22px_rgba(59,24,120,0.9)]",
          SHELL,
        )}
      >
        <div className="flex h-12 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            title="Ouvrir le menu"
            aria-controls="app-sidebar"
            className="menu-trigger grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-brand-700 ring-1 ring-white/60"
          >
            <span className="menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="menu-trigger__dot" aria-hidden="true" />
          </button>

          <Logo to="/accueil" onDark variant="mobile" className="min-w-0" />

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <UserMenu onDark />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pb-1 pt-1.5">
          <QuickSearch variant="mobile" className="min-w-0 flex-1" />

          <HeaderStat
            compact
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
                <span className="hidden min-[380px]:inline"> XP</span>
              </>
            }
            title={`${formatNumber(xp)} points d'expérience`}
            to="/progress"
          />
        </div>
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

            <section className="relative mt-5 w-full max-w-sm overflow-hidden rounded-[28px] border border-white/12 bg-[#35106f] p-4 shadow-[0_28px_60px_-34px_rgba(0,0,0,0.85)] sm:p-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-500/25 blur-3xl"
              />
              <div className="relative flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber-200 ring-1 ring-white/15">
                  <MaterialIcon name="person_add" size={19} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    <p className="font-nav text-[9px] font-extrabold uppercase tracking-[0.16em] text-amber-300 sm:text-[9.5px]">
                      Gratuit · sans carte bancaire
                    </p>
                  </div>
                  <h2 className="font-display mt-2 text-[20px] font-extrabold leading-[1.12] tracking-[-0.025em] text-white sm:text-[21px]">
                    Ton compte t'attend.
                    <span className="mt-0.5 block text-amber-200">Commence en 30 secondes.</span>
                  </h2>
                </div>
              </div>

              <div className="relative mt-4 grid gap-2">
                <Link
                  to="/auth?mode=signup"
                  className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white px-3.5 py-2.5 text-[#35106f] shadow-[0_16px_32px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-amber-300/50 active:translate-y-0 sm:px-4"
                >
                  <span className="font-nav min-w-0 flex-1 text-left text-[12.5px] font-extrabold leading-tight sm:text-[13px]">
                    Créer mon compte gratuit
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-600">
                    <MaterialIcon name="arrow_forward" size={19} />
                  </span>
                </Link>

                <Link
                  to="/practice"
                  className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-white/30 active:translate-y-0"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-200 ring-1 ring-white/10">
                      <MaterialIcon name="fitness_center" size={17} />
                    </span>
                    <span className="font-nav truncate text-left text-[12px] font-extrabold sm:text-[12.5px]">
                      Réviser maintenant
                    </span>
                  </span>
                  <MaterialIcon
                    name="arrow_forward"
                    size={16}
                    className="text-white/65 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </Link>
              </div>

              <p className="relative mt-3 inline-flex w-full items-center justify-center gap-1.5 text-center text-[9.5px] font-semibold text-indigo-100/65">
                <MaterialIcon name="verified_user" size={13} />
                Progression sauvegardée · mode invité inclus
              </p>
            </section>

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
  useHorizontalLock();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Ctrl/Cmd + K : place le curseur dans la recherche (mobile ; sur ordinateur, « / » suffit).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (window.matchMedia("(min-width: 1024px)").matches) return;
      event.preventDefault();
      setMobileOpen(false);
      const input = document.querySelector<HTMLInputElement>(
        'header input[type="search"]',
      );
      input?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-clip">
      <ScrollToTop />

      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[#1e1060]/55 backdrop-blur-[3px] transition-opacity duration-300 ease-out lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <MobileHeader onOpenMenu={() => setMobileOpen(true)} />
      <main
        className={cn(
          "notebook-canvas relative transition-[padding] duration-300",
          collapsed
            ? "notebook-canvas--collapsed lg:pl-[84px]"
            : "notebook-canvas--expanded lg:pl-[272px]",
        )}
      >
        <DesktopTopBar scrolled={scrolled} />
        <div
          key={pathname}
          className="route-stage animate-page-in mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pb-12 lg:pt-6"
        >
          <GuestBanner />
          <div className="page-motion-root">
            <Outlet />
          </div>
        </div>
      </main>
      <SiteFooter collapsed={collapsed} />
    </div>
  );
}

export function FocusShell({ children }: { children: React.ReactNode }) {
  useHorizontalLock();
  return (
    <div className="animate-page-in mx-auto min-h-dvh w-full max-w-4xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      {children}
    </div>
  );
}

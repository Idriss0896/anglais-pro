import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useProgressStore } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

interface UserMenuProps {
  onDark?: boolean;
  showIdentity?: boolean;
  align?: "left" | "right";
  className?: string;
}

export function UserMenu({
  onDark = false,
  showIdentity = false,
  align = "right",
  className,
}: UserMenuProps) {
  const { user, loading, apiReady, logout } = useAuth();
  const xp = useProgressStore((state) => state.xp);
  const rank = getRank(xp);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const label = user ? (user.name || user.email) : "Mon compte";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `Compte de ${label}` : "Se connecter ou créer un compte"}
        className={cn(
          "group flex items-center gap-2 rounded-full transition focus-visible:ring-4",
          showIdentity
            ? onDark
              ? "bg-white/10 p-1 pr-2.5 ring-1 ring-white/20 hover:bg-white/15"
              : "bg-white p-1 pr-2.5 ring-1 ring-slate-900/10 hover:ring-brand-200"
            : "p-0.5",
        )}
      >
        <UserAvatar
          user={user}
          size={showIdentity ? 34 : 38}
          onDark={onDark}
          className="transition group-hover:scale-[1.03]"
        />
        {showIdentity && (
          <span className="hidden min-w-0 text-left leading-tight xl:block">
            <span
              className={cn(
                "block max-w-[130px] truncate text-[12px] font-extrabold",
                onDark ? "text-white" : "text-ink",
              )}
            >
              {loading ? "Chargement…" : user ? label : "Se connecter"}
            </span>
            <span
              className={cn(
                "block text-[10px] font-bold",
                onDark ? "text-indigo-100/60" : "text-slate-400",
              )}
            >
              {user ? rank.label : apiReady ? "Compte gratuit" : "Mode invité"}
            </span>
          </span>
        )}
        {showIdentity && (
          <ChevronDown
            size={14}
            className={cn(
              "hidden shrink-0 transition xl:block",
              onDark ? "text-indigo-100/60" : "text-slate-400",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "animate-fade-up absolute z-50 mt-2 w-[286px] overflow-hidden rounded-[26px] bg-white p-2 shadow-[0_34px_70px_-24px_rgba(23,22,43,0.45)] ring-1 ring-slate-900/10",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/60 p-3">
                <UserAvatar user={user} size={46} />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-extrabold text-ink">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-slate-500">
                    {user.email}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                    <ShieldCheck size={10} />
                    {user.provider === "google" ? "Compte Google" : "Compte vérifié"}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 transition hover:bg-[#f2f6ff] hover:text-ink"
                >
                  <UserRound size={17} className="text-brand-600" />
                  Mon profil et ma photo
                </Link>
                <Link
                  to="/progress"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 transition hover:bg-[#f2f6ff] hover:text-ink"
                >
                  <BarChart3 size={17} className="text-brand-600" />
                  Ma progression
                </Link>
              </div>

              <div className="mx-2 my-1.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700">
                  <Cloud size={12} />
                  Synchronisé
                </span>
                <span className="text-[10.5px] font-bold text-slate-400">{rank.label}</span>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut size={17} />
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-sky-50 p-3.5">
                <p className="text-[13px] font-extrabold text-ink">Sauvegarde ta progression</p>
                <p className="mt-1 text-[11.5px] font-medium leading-5 text-slate-500">
                  Tu peux apprendre sans compte. Crée-le quand tu veux pour retrouver ton
                  parcours sur tous tes appareils.
                </p>
              </div>
              <Link
                to="/auth"
                role="menuitem"
                className="btn-shine mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-3 text-[13px] font-extrabold text-white shadow-[0_14px_30px_-16px_rgba(90,69,232,0.9)] transition hover:-translate-y-0.5"
              >
                <LogIn size={16} />
                Se connecter ou s'inscrire
              </Link>
              <div className="mt-2 flex items-center gap-1.5 px-2 pb-1 text-[10.5px] font-semibold text-slate-400">
                {apiReady ? (
                  <>
                    <CloudOff size={12} />
                    Progression enregistrée sur cet appareil
                  </>
                ) : (
                  <>
                    <CloudOff size={12} />
                    Comptes indisponibles sur cette adresse
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

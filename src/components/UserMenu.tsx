import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { useProgressStore } from "@/store/useProgressStore";
import { getRank } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";
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
              ? "bg-white/10 p-1 pr-2.5 ring-1 ring-white/20 hover:bg-white/20"
              : "bg-surface p-1 pr-2.5 ring-1 ring-line hover:ring-brand-strong/20"
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
                onDark ? "text-indigo-100/65" : "text-slate-400",
              )}
            >
              {user ? rank.label : apiReady ? "Compte gratuit" : "Mode invité"}
            </span>
          </span>
        )}
        {showIdentity && (
          <MaterialIcon
            name="expand_more"
            size={18}
            className={cn(
              "hidden shrink-0 transition-transform xl:block",
              onDark ? "text-indigo-100/70" : "text-slate-400",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "animate-fade-up absolute z-50 mt-2 w-[286px] overflow-hidden rounded-[26px] bg-surface p-2 shadow-[0_34px_70px_-24px_rgba(23,22,43,0.45)] ring-1 ring-line",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-surface-soft p-3">
                <UserAvatar user={user} size={46} />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-extrabold text-ink">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <MaterialIcon name="person" size={19} className="text-brand-strong" />
                  Mon profil et ma photo
                </Link>
                <Link
                  to="/progress"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <MaterialIcon name="analytics" size={19} className="text-brand-strong" />
                  Ma progression
                </Link>
                <Link
                  to="/reglages"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-700 transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <MaterialIcon name="settings" size={19} className="text-brand-strong" />
                  Réglages
                </Link>
              </div>

              <div className="mx-2 my-1.5 flex items-center justify-between border-t border-line pt-2.5">
                <span className="text-[10.5px] font-bold text-slate-400">Niveau</span>
                <span className="text-[10.5px] font-bold text-ink">{rank.label}</span>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-rose-strong transition-colors hover:bg-rose-soft"
              >
                <MaterialIcon name="logout" size={19} />
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-brand-soft p-3.5">
                <p className="text-[13px] font-extrabold text-ink">Sauvegarde ta progression</p>
                <p className="mt-1 text-[11.5px] font-medium leading-5 text-slate-500">
                  Tu peux apprendre sans compte. Crée-le quand tu veux pour retrouver ton
                  parcours sur tous tes appareils.
                </p>
              </div>
              <Link
                to="/auth"
                role="menuitem"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#4c1d95] px-3 py-3 text-[13px] font-extrabold text-white transition-colors hover:bg-[#3b1878]"
              >
                <MaterialIcon name="login" size={18} />
                Se connecter ou s'inscrire
              </Link>
              <div className="mt-2 flex items-center gap-1.5 px-2 pb-1 text-[10.5px] font-semibold text-slate-400">
                <MaterialIcon name="cloud_off" size={14} />
                {apiReady
                  ? "Progression enregistrée sur cet appareil"
                  : "Comptes indisponibles sur cette adresse"}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

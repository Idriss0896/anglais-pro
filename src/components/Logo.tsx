import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  onDark?: boolean;
  className?: string;
  /** Destination du lien (l'accueil de l'application par défaut). */
  to?: string;
}

const MARK = `${import.meta.env.BASE_URL}logo-mark.svg`;

/**
 * Marque ANGLO CLUB : l'écusson (cercle violet, Union Jack, A blanc et flèche
 * dorée) accompagne le wordmark bicolore ANGLO / CLUB.
 */
export function Logo({ compact = false, onDark = false, className, to = "/" }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="ANGLO CLUB — Accueil"
    >
      <img
        src={MARK}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 select-none drop-shadow-[0_6px_14px_rgba(46,16,101,0.28)] transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-105 group-active:scale-95"
        draggable={false}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[17px] font-extrabold uppercase leading-none tracking-[0.08em]",
              onDark ? "text-white" : "text-ink",
            )}
          >
            Anglo
            <span className={onDark ? "text-amber-300" : "text-amber-strong"}> Club</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-bold uppercase tracking-[0.22em]",
              onDark ? "text-white/55" : "text-faint",
            )}
          >
            L'anglais qui se parle
          </span>
        </span>
      )}
    </Link>
  );
}

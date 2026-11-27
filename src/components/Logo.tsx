import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  onDark?: boolean;
  className?: string;
  variant?: "sidebar" | "default" | "mobile";
  /** Destination du lien (l'accueil de l'application par défaut). */
  to?: string;
}

const MARK = `${import.meta.env.BASE_URL}logo-mark.svg`;

/**
 * Marque ANGLO CLUB : l'écusson (cercle violet, Union Jack, A blanc et flèche
 * dorée) accompagne le wordmark bicolore ANGLO / CLUB.
 */
export function Logo({
  compact = false,
  onDark = false,
  className,
  to = "/",
  variant = "default",
}: LogoProps) {
  const isMobile = variant === "mobile";

  return (
    <Link
      to={to}
      className={cn("group inline-flex min-h-11 items-center", isMobile ? "gap-2" : "gap-2.5", className)}
      aria-label="ANGLO CLUB — Accueil"
    >
      <img
        src={MARK}
        alt=""
        width={40}
        height={40}
        fetchPriority="high"
        className={cn(
          "shrink-0 select-none drop-shadow-[0_6px_14px_rgba(46,16,101,0.28)] transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-105 group-active:scale-95",
          isMobile ? "h-8 w-8" : "h-10 w-10",
        )}
        draggable={false}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-brand whitespace-nowrap font-normal uppercase leading-none",
              variant === "sidebar"
                ? "text-[20px] tracking-[0.03em]"
                : isMobile
                  ? "text-[16px] tracking-[0.05em]"
                  : "text-[23px] tracking-[0.035em] sm:text-[26px]",
              onDark ? "text-white" : "text-brand-600",
            )}
          >
            Anglo
            <span className={onDark ? "text-amber-200" : "text-amber-strong"}> Club</span>
          </span>
        </span>
      )}
    </Link>
  );
}

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

/**
 * Marque « Anglais Pro » : un monogramme A dessiné à la main (aucune icône
 * linguistique générique) avec un point ambre, cohérent avec le favicon.
 */
export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Anglais Pro — Accueil"
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-glow transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-active:scale-95">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.4),transparent_58%)]"
        />
        <svg
          viewBox="0 0 64 64"
          className="relative h-[22px] w-[22px] drop-shadow-[0_2px_3px_rgba(23,22,43,0.25)]"
          aria-hidden="true"
        >
          <path
            d="M13 48 L25.5 15 h6.5 L44.5 48 h-7.6 l-3.1-8.4H23.7L20.6 48z"
            fill="currentColor"
          />
          <path d="M25.9 33.6 h6.9 l-3.45-9.6z" fill="#3c2ca4" />
        </svg>
        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-brand-700/50" />
      </span>
      {!compact && (
        <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-ink">
          Anglais<span className="text-brand-600">Pro</span>
        </span>
      )}
    </Link>
  );
}

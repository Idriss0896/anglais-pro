import { Link } from "react-router-dom";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Anglais Pro — Accueil"
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <Languages size={20} strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />
      </span>
      {!compact && (
        <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-ink">
          Anglais<span className="text-brand-600">Pro</span>
        </span>
      )}
    </Link>
  );
}

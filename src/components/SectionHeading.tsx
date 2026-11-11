import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  to?: string;
  linkLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  description,
  icon: Icon,
  to,
  linkLabel = "Tout voir",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-3.5 flex items-end justify-between gap-4", className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-slate-900/[0.06]">
            <Icon size={16} strokeWidth={2.3} />
          </span>
        )}
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs font-medium text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {action ??
        (to && (
          <Link
            to={to}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-brand-600 hover:text-brand-700"
          >
            {linkLabel}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
    </div>
  );
}

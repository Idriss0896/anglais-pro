import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconTone?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  iconTone = "from-brand-500 to-brand-700",
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("animate-fade-up", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                "relative hidden h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br text-white shadow-glow sm:grid",
                iconTone,
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.42),transparent_62%)]"
              />
              <Icon size={26} strokeWidth={2.2} className="relative" />
            </div>
          )}
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-[15px]">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[28px] bg-white px-6 py-14 text-center ring-1 ring-slate-900/[0.06]",
        className,
      )}
    >
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm font-medium leading-6 text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  height?: string;
  label?: string;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  height = "h-2",
  label = "Progression",
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-slate-900/[0.07]", height, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-500 transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

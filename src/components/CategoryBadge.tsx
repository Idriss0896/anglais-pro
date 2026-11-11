import type { CategoryKey } from "@/types";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: CategoryKey;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({ category, size = "sm", className }: CategoryBadgeProps) {
  const theme = CATEGORIES[category];
  const Icon = theme.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-extrabold",
        theme.chip,
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        className,
      )}
    >
      <Icon size={size === "sm" ? 11 : 13} strokeWidth={2.6} />
      {theme.shortLabel}
    </span>
  );
}

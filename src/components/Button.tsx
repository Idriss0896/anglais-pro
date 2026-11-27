import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { LoaderCircle, type LucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "soft"
  | "success"
  | "dark"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  full?: boolean;
}

/** Couleurs pleines uniquement : aucun dégradé. */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_26px_-14px_rgba(76,29,149,0.85)] hover:bg-brand-700",
  secondary:
    "bg-surface text-ink ring-1 ring-slate-900/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_16px_-14px_rgba(23,22,43,0.45)] hover:bg-surface-soft",
  ghost: "text-slate-600 hover:bg-slate-900/[0.06] hover:text-ink",
  soft: "bg-brand-soft text-brand-strong ring-1 ring-brand-600/10 hover:bg-brand-100",
  success:
    "bg-emerald-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_12px_26px_-14px_rgba(5,150,105,0.85)] hover:bg-emerald-800",
  dark: "bg-[#131a33] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_26px_-16px_rgba(23,22,43,0.85)] hover:bg-[#1d2542]",
  danger: "bg-rose-soft text-rose-strong ring-1 ring-rose-600/15 hover:bg-rose-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-[12.5px] rounded-full gap-1.5 sm:h-9",
  md: "h-11 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-6 text-[15px] rounded-full gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  full = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "motion-button inline-flex select-none items-center justify-center font-extrabold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-strong/20 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={size === "sm" ? 15 : 18} />
      ) : Icon ? (
        <Icon size={size === "sm" ? 15 : 18} strokeWidth={2.4} />
      ) : null}
      {children}
      {IconRight && !loading ? (
        <IconRight size={size === "sm" ? 15 : 18} strokeWidth={2.4} />
      ) : null}
    </button>
  );
}

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  full?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  full = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "motion-button inline-flex select-none items-center justify-center font-extrabold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-strong/20",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon size={size === "sm" ? 15 : 18} strokeWidth={2.4} /> : null}
      {children}
      {IconRight ? <IconRight size={size === "sm" ? 15 : 18} strokeWidth={2.4} /> : null}
    </Link>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { LoaderCircle, type LucideIcon } from "lucide-react";
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

const variants: Record<ButtonVariant, string> = {
  primary:
    "btn-shine bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_14px_30px_-14px_rgba(90,69,232,0.95)] hover:to-brand-800 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-16px_rgba(90,69,232,0.95)] active:translate-y-0 active:scale-[0.98]",
  secondary:
    "bg-white text-ink ring-1 ring-slate-900/10 hover:bg-slate-50 hover:-translate-y-0.5 hover:ring-slate-900/15 active:translate-y-0 active:scale-[0.98]",
  ghost: "text-slate-600 hover:bg-slate-900/5 hover:text-ink active:scale-[0.98]",
  soft: "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100 active:scale-[0.98]",
  success:
    "btn-shine bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_14px_30px_-14px_rgba(16,185,129,0.95)] hover:to-emerald-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  dark: "btn-shine bg-gradient-to-br from-ink to-[#2a2755] text-white shadow-[0_14px_30px_-18px_rgba(23,22,43,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-2xl gap-2",
  lg: "h-13 px-6 text-[15px] rounded-2xl gap-2.5",
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
        "inline-flex select-none items-center justify-center font-extrabold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-45",
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
        "inline-flex select-none items-center justify-center font-extrabold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-200",
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

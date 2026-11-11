import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconTone?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconTone = "bg-brand-100 text-brand-600",
  children,
  footer,
  className,
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "animate-pop w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-20px_rgba(23,22,43,.55)]",
          className,
        )}
      >
        {(title || Icon) && (
          <div className="relative px-6 pt-6">
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            )}
            {Icon && (
              <div
                className={cn(
                  "mb-4 grid h-13 w-13 place-items-center rounded-2xl",
                  iconTone,
                )}
              >
                <Icon size={25} strokeWidth={2.2} />
              </div>
            )}
            {title && (
              <h2 id="modal-title" className="pr-8 text-xl font-extrabold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        )}
        {children && <div className="px-6 py-5">{children}</div>}
        {footer && <div className="px-6 pb-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

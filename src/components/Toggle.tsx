import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

/**
 * Interrupteur accessible, en couleurs pleines (pas de dégradé).
 * La zone tactile fait 44 px de haut ; la piste garde les proportions iOS.
 */
export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative grid h-11 w-16 shrink-0 place-items-center rounded-full outline-none transition-opacity focus-visible:ring-4 focus-visible:ring-azure-500/30",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-8 w-14 rounded-full transition-colors duration-200",
          checked ? "bg-azure-600" : "bg-slate-200 ring-1 ring-inset ring-slate-300/80",
        )}
      >
        <span
          className={cn(
            "absolute top-1 grid h-6 w-6 place-items-center rounded-full bg-surface transition-transform duration-200",
            checked
              ? "translate-x-7 shadow-[0_2px_6px_rgba(15,23,42,0.28)]"
              : "translate-x-1 shadow-[0_1px_3px_rgba(15,23,42,0.18)]",
          )}
        >
          <MaterialIcon
            name="check"
            size={15}
            className={cn(
              "text-azure-strong transition-opacity duration-150",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
      </span>
    </button>
  );
}

interface MaterialIconProps {
  /** Nom d'icône Material Symbols (ex. « home », « settings »). */
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  /** Libellé accessible ; l'icône est décorative quand il est absent. */
  label?: string;
}

/**
 * Icône du jeu Material Symbols Rounded, celui utilisé par les applications
 * web de Google (Gmail, Drive, Agenda…). La police est chargée dans index.html.
 */
export function MaterialIcon({
  name,
  size = 20,
  filled = false,
  className,
  label,
}: MaterialIconProps) {
  return (
    <span
      className={["msi shrink-0", filled ? "msi-fill" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ fontSize: `${size}px` }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {name}
    </span>
  );
}

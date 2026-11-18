export interface LevelTheme {
  /** Couleur pleine de référence (badges, pastilles, barres). */
  gradient: string;
  /** Fond très clair de la même famille. */
  soft: string;
  /** Texte accentué lisible sur fond clair. */
  text: string;
  /** Anneau de la même famille. */
  ring: string;
  /** Barre de progression. */
  bar: string;
  /** Petite pastille. */
  dot: string;
  /** Badge complet prêt à l'emploi. */
  badge: string;
  /** Fond de section (aperçu du niveau). */
  surface: string;
  /** Bordure discrète de la famille. */
  border: string;
  /** Puce active des filtres. */
  chip: string;
  /** Texte sur fond plein. */
  onSolid: string;
}

export const LEVEL_THEMES: Record<number, LevelTheme> = {
  1: {
    gradient: "bg-emerald-500",
    soft: "bg-emerald-soft",
    text: "text-emerald-strong",
    ring: "ring-emerald-strong/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badge: "bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20",
    surface: "bg-emerald-soft/50",
    border: "border-emerald-strong/20",
    chip: "bg-emerald-600 text-white",
    onSolid: "text-white",
  },
  2: {
    gradient: "bg-azure-500",
    soft: "bg-azure-soft",
    text: "text-azure-strong",
    ring: "ring-azure-strong/20",
    bar: "bg-azure-500",
    dot: "bg-azure-500",
    badge: "bg-azure-soft text-azure-strong ring-1 ring-azure-strong/20",
    surface: "bg-azure-soft/50",
    border: "border-azure-strong/20",
    chip: "bg-azure-600 text-white",
    onSolid: "text-white",
  },
  3: {
    gradient: "bg-fuchsia-500",
    soft: "bg-fuchsia-soft",
    text: "text-fuchsia-strong",
    ring: "ring-fuchsia-strong/20",
    bar: "bg-fuchsia-500",
    dot: "bg-fuchsia-500",
    badge: "bg-fuchsia-soft text-fuchsia-strong ring-1 ring-fuchsia-strong/20",
    surface: "bg-fuchsia-soft/50",
    border: "border-fuchsia-strong/20",
    chip: "bg-fuchsia-600 text-white",
    onSolid: "text-white",
  },
  4: {
    gradient: "bg-amber-500",
    soft: "bg-amber-soft",
    text: "text-amber-strong",
    ring: "ring-amber-strong/20",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badge: "bg-amber-soft text-amber-strong ring-1 ring-amber-strong/20",
    surface: "bg-amber-soft/50",
    border: "border-amber-strong/20",
    chip: "bg-amber-600 text-white",
    onSolid: "text-white",
  },
};

export const LEVEL_EMOJIS: Record<number, string> = {
  1: "🌱",
  2: "🌿",
  3: "🌳",
  4: "💼",
};

/** Noms courts utilisés dans les filtres et les onglets. */
export const LEVEL_SHORT_NAMES: Record<number, string> = {
  1: "Débutant",
  2: "Intermédiaire",
  3: "Avancé",
  4: "Professionnel",
};

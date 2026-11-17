import { CURRICULUM } from "@/data/curriculum";
import type { CategoryKey, CurriculumUnit } from "@/types";

export interface VocabEntry {
  id: string;
  /** Mot ou expression en anglais. */
  primary: string;
  /** Traduction française. */
  meaning: string;
  /** Exemple d'usage quand la table en fournit un. */
  example?: string;
}

export interface IndexedVocabEntry extends VocabEntry {
  unitId: string;
  unitTitle: string;
  emoji: string;
  level: number;
  category: CategoryKey;
}

function findColumn(head: string[] | undefined, pattern: RegExp) {
  if (!head) return -1;
  return head.findIndex((column) => pattern.test(column));
}

/** Construit le dictionnaire d'un thème à partir de ses tableaux. */
export function buildVocabEntries(unit: CurriculumUnit): VocabEntry[] {
  const entries: VocabEntry[] = [];

  unit.theory.forEach((block, blockIndex) => {
    if (block.t !== "table") return;

    const englishIndex = Math.max(findColumn(block.head, /english|anglais/i), 0);
    const frenchIndex = findColumn(block.head, /fran[cç]ais|french/i);
    const exampleIndex = findColumn(block.head, /exemple|example/i);

    (block.rows ?? []).forEach((row, rowIndex) => {
      const primary = (row[englishIndex] ?? row[0] ?? "").trim();
      if (!primary) return;

      const meaning = (
        frenchIndex >= 0
          ? (row[frenchIndex] ?? "")
          : row
              .filter((_, cellIndex) => cellIndex !== englishIndex)
              .filter(Boolean)
              .join(" · ")
      ).trim();

      const example = exampleIndex >= 0 ? (row[exampleIndex] ?? "").trim() : "";

      entries.push({
        id: `${unit.id}:vocab:${blockIndex}:${rowIndex}`,
        primary,
        meaning,
        example: example || undefined,
      });
    });
  });

  return entries;
}

export const VOCAB_UNITS = CURRICULUM.filter((unit) => unit.cat === "vocabulary");

/** Index plat de tous les mots du parcours, utilisé par la recherche. */
export const VOCAB_INDEX: IndexedVocabEntry[] = VOCAB_UNITS.flatMap((unit) =>
  buildVocabEntries(unit).map((entry) => ({
    ...entry,
    unitId: unit.id,
    unitTitle: unit.title,
    emoji: unit.emoji,
    level: unit.level,
    category: unit.cat,
  })),
);

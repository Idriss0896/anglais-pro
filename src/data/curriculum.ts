import level1 from "../../content/level-1.json";
import level2 from "../../content/level-2.json";
import level3 from "../../content/level-3.json";
import type {
  CategoryKey,
  CurriculumQuestion,
  CurriculumUnit,
  LevelMeta,
  PhraseEntry,
  Unit,
} from "../types";

const asUnits = (value: unknown) => value as Unit[];

export const LEVELS: LevelMeta[] = [
  {
    id: "level-1",
    num: 1,
    title: "Fondations",
    subtitle: "Les bases pour se débrouiller",
    description:
      "Saluer, se présenter, compter, parler du quotidien et construire ses premières phrases avec confiance.",
    cefr: "A1 – A2",
    units: asUnits(level1),
  },
  {
    id: "level-2",
    num: 2,
    title: "Intermédiaire",
    subtitle: "Gagner en aisance",
    description:
      "Raconter, décrire, voyager, exprimer ses émotions et comprendre les nuances de l'anglais courant.",
    cefr: "B1",
    units: asUnits(level2),
  },
  {
    id: "level-3",
    num: 3,
    title: "Avancé",
    subtitle: "Parler avec assurance",
    description:
      "Maîtriser les temps, les modaux, les idiomes et l'anglais professionnel pour des conversations naturelles.",
    cefr: "B2",
    units: asUnits(level3),
  },
];

export const CURRICULUM: CurriculumUnit[] = LEVELS.flatMap((level) =>
  level.units.map((unit, order) => ({
    ...unit,
    level: level.num,
    levelId: level.id,
    levelTitle: level.title,
    levelCefr: level.cefr,
    order,
  })),
);

export const UNIT_MAP = new Map(CURRICULUM.map((unit) => [unit.id, unit]));

export function getUnit(id: string | undefined) {
  return id ? UNIT_MAP.get(id) : undefined;
}

export function getLevel(id: string | number | undefined) {
  return LEVELS.find((level) => level.id === id || level.num === Number(id));
}

export function makePhraseId(unitId: string, blockIndex: number, itemIndex: number) {
  return `${unitId}:phrase:${blockIndex}:${itemIndex}`;
}

export const ALL_QUESTIONS: CurriculumQuestion[] = CURRICULUM.flatMap((unit) =>
  unit.quiz.map((question, index) => ({
    ...question,
    id: `${unit.id}:quiz:${index}`,
    unitId: unit.id,
    unitTitle: unit.title,
    unitEmoji: unit.emoji,
    level: unit.level,
    category: unit.cat,
  })),
);

export const PHRASES: PhraseEntry[] = CURRICULUM.flatMap((unit) =>
  unit.theory.flatMap((block, blockIndex) =>
    block.t === "phrases"
      ? (block.items ?? []).map((item, itemIndex) => ({
          ...item,
          id: makePhraseId(unit.id, blockIndex, itemIndex),
          unitId: unit.id,
          unitTitle: unit.title,
          level: unit.level,
          category: unit.cat,
          emoji: unit.emoji,
        }))
      : [],
  ),
);

export const TOTAL_UNITS = CURRICULUM.length;
export const TOTAL_QUESTIONS = ALL_QUESTIONS.length;
export const TOTAL_PHRASES = PHRASES.length;

export const CATEGORY_ORDER: CategoryKey[] = [
  "grammar",
  "vocabulary",
  "expressions",
  "reading",
];

export function countByCategory(category: CategoryKey, level?: number) {
  return CURRICULUM.filter(
    (unit) => unit.cat === category && (level === undefined || unit.level === level),
  ).length;
}

export function getLevelUnits(level: number) {
  return CURRICULUM.filter((unit) => unit.level === level);
}

export function getNextUnit(completed: Record<string, { completed: boolean }>) {
  return CURRICULUM.find((unit) => !completed[unit.id]?.completed) ?? CURRICULUM[0];
}

export function unitMinutes(unit: Pick<Unit, "quiz" | "theory">) {
  return Math.max(4, Math.round(unit.quiz.length * 0.65 + unit.theory.length * 0.35));
}

export function unitPhraseCount(unit: Unit) {
  return unit.theory
    .filter((block) => block.t === "phrases")
    .reduce((total, block) => total + (block.items?.length ?? 0), 0);
}

export function getFeaturedPhrase(date = new Date()) {
  if (PHRASES.length === 0) return undefined;
  const days = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return PHRASES[Math.abs(days) % PHRASES.length];
}

export function getQuestionsForMode(mode: string): CurriculumQuestion[] {
  const shuffled = [...ALL_QUESTIONS];
  // Fisher–Yates without mutating the source.
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const byType = (type: CurriculumQuestion["t"]) =>
    shuffled.filter((question) => question.t === type);

  switch (mode) {
    case "express":
      return shuffled.slice(0, 10);
    case "marathon":
      return shuffled.slice(0, 20);
    case "choice":
      return byType("choice").slice(0, 10);
    case "type":
      return byType("type").slice(0, 10);
    case "tiles":
      return byType("tiles").slice(0, 10);
    case "match":
      return byType("match").slice(0, 6);
    default:
      return shuffled.slice(0, 10);
  }
}

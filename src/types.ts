export type CategoryKey = "grammar" | "vocabulary" | "expressions" | "reading";

export type QuizType = "choice" | "tiles" | "type" | "match";

export interface Phrase {
  en: string;
  fr: string;
  note?: string;
}

export interface TheoryBlock {
  t: "p" | "h" | "table" | "phrases" | "tip";
  text?: string;
  title?: string;
  head?: string[];
  rows?: string[][];
  items?: Phrase[];
}

export interface QuizPair {
  en: string;
  fr: string;
}

export interface QuizQuestion {
  t: QuizType;
  q: string;
  hint?: string;
  x?: string;
  opts?: string[];
  a?: number | string;
  accept?: string[];
  tiles?: string[];
  pairs?: QuizPair[];
}

export interface Unit {
  id: string;
  cat: CategoryKey;
  title: string;
  subtitle: string;
  emoji: string;
  theory: TheoryBlock[];
  quiz: QuizQuestion[];
}

export interface LevelMeta {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  description: string;
  cefr: string;
  units: Unit[];
}

export interface CurriculumUnit extends Unit {
  level: number;
  levelId: string;
  levelTitle: string;
  levelCefr: string;
  order: number;
}

export interface CurriculumQuestion extends QuizQuestion {
  id: string;
  unitId: string;
  unitTitle: string;
  unitEmoji: string;
  level: number;
  category: CategoryKey;
}

export interface PhraseEntry extends Phrase {
  id: string;
  unitId: string;
  unitTitle: string;
  level: number;
  category: CategoryKey;
  emoji: string;
}

export interface LessonProgress {
  completed: boolean;
  bestAccuracy: number;
  attempts: number;
  lastPlayedAt: string | null;
  xp: number;
}

export interface DayActivity {
  xp: number;
  lessons: number;
}

export interface SessionResult {
  correct: number;
  total: number;
  accuracy: number;
  xp: number;
  mistakes: number;
}

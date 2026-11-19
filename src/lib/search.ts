import { CURRICULUM, PHRASES } from "@/data/curriculum";
import { CATEGORIES } from "@/lib/categories";
import { buildVocabEntries } from "@/lib/vocabulary";
import type { CategoryKey } from "@/types";

/** Résultat « mot » : une entrée du dictionnaire avec son sens et son exemple. */
export interface WordHit {
  kind: "word";
  id: string;
  en: string;
  fr: string;
  example?: string;
  unitId: string;
  unitTitle: string;
  unitEmoji: string;
  level: number;
  category: CategoryKey;
  /** La requête correspond exactement au mot anglais. */
  exact?: boolean;
  /** Le mot n'a pas de fiche : il est illustré dans une phrase d'usage. */
  context?: boolean;
}

export interface PhraseHit {
  kind: "phrase";
  id: string;
  en: string;
  fr: string;
  note?: string;
  unitId: string;
  unitTitle: string;
  unitEmoji: string;
  level: number;
  category: CategoryKey;
  exact?: boolean;
  /** La phrase sert d'illustration à un mot sans fiche dédiée. */
  context?: boolean;
}

export interface LessonHit {
  kind: "lesson";
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  level: number;
  category: CategoryKey;
}

export type Hit = WordHit | PhraseHit | LessonHit;
export type EntryHit = WordHit | PhraseHit;

export interface SearchResult {
  hits: Hit[];
  /** Meilleure fiche « mot et sens » à afficher en grand. */
  definition?: EntryHit;
  /** Mots proches quand rien ne correspond. */
  suggestions?: EntryHit[];
}

/** Retire accents et casse pour comparer « élève » et « eleve ». */
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Retire les marques grammaticales pour chercher le lemme nu (ex. « father »). */
function searchableTerm(value: string) {
  return value.replace(/\s+\((?:[a-z]+\.\s*)+\)$/i, "").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Les mots du dictionnaire, dédoublonnés : le niveau le plus bas gagne. */
const WORD_ENTRIES: WordHit[] = (() => {
  const seen = new Set<string>();
  const entries: WordHit[] = [];

  for (const unit of CURRICULUM) {
    for (const entry of buildVocabEntries(unit)) {
      const key = normalize(entry.primary);
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        kind: "word",
        id: entry.id,
        en: searchableTerm(entry.primary),
        fr: entry.meaning,
        example: entry.example,
        unitId: unit.id,
        unitTitle: unit.title,
        unitEmoji: unit.emoji,
        level: unit.level,
        category: unit.cat,
      });
    }
  }

  return entries;
})();

/** Index de recherche des leçons : titre, catégorie et contenu complet. */
const LESSON_INDEX = CURRICULUM.map((unit) => {
  const category = CATEGORIES[unit.cat];
  const content = [
    ...unit.theory.flatMap((block) => [
      block.text ?? "",
      block.title ?? "",
      ...(block.items ?? []).flatMap((item) => [item.en, item.fr, item.note ?? ""]),
      ...(block.rows ?? []).flatMap((row) => row),
    ]),
    ...unit.quiz.flatMap((question) => [question.q, question.hint ?? ""]),
  ].join(" ");

  return {
    hit: {
      kind: "lesson" as const,
      id: unit.id,
      title: unit.title,
      subtitle: unit.subtitle,
      emoji: unit.emoji,
      level: unit.level,
      category: unit.cat,
    },
    title: normalize(unit.title),
    haystack: normalize(
      `${unit.title} ${unit.subtitle} ${category.label} ${category.shortLabel} ${unit.levelTitle} niveau ${unit.level} ${content}`,
    ),
  };
});

const PHRASE_INDEX = PHRASES.map((phrase) => ({
  hit: {
    kind: "phrase" as const,
    id: phrase.id,
    en: phrase.en,
    fr: phrase.fr,
    note: phrase.note,
    unitId: phrase.unitId,
    unitTitle: phrase.unitTitle,
    unitEmoji: phrase.emoji,
    level: phrase.level,
    category: phrase.category,
  } satisfies PhraseHit,
  en: normalize(phrase.en),
  fr: normalize(phrase.fr),
  haystack: normalize(`${phrase.en} ${phrase.fr} ${phrase.note ?? ""} ${phrase.unitTitle}`),
  wordCount: phrase.en.trim().split(/\s+/).length,
}));

/**
 * Petit dictionnaire de survie : les mots et formules que l'on cherche en
 * premier. Ils complètent les tableaux des leçons pour que « hello »,
 * « merci » ou « demain » aient toujours une fiche claire.
 */
const CORE_WORDS: Array<{ en: string; fr: string; example?: string }> = [
  { en: "hello", fr: "bonjour", example: "Hello, how are you?" },
  { en: "hi", fr: "salut", example: "Hi, nice to see you!" },
  { en: "goodbye", fr: "au revoir", example: "Goodbye, see you tomorrow." },
  { en: "bye", fr: "salut, à plus" },
  { en: "please", fr: "s'il te plaît / s'il vous plaît" },
  { en: "thank you", fr: "merci", example: "Thank you very much." },
  { en: "thanks", fr: "merci" },
  { en: "sorry", fr: "désolé(e)", example: "Sorry, I'm late." },
  { en: "excuse me", fr: "excusez-moi" },
  { en: "yes", fr: "oui" },
  { en: "no", fr: "non" },
  { en: "maybe", fr: "peut-être" },
  { en: "good morning", fr: "bonjour (le matin)" },
  { en: "good afternoon", fr: "bon après-midi" },
  { en: "good evening", fr: "bonsoir" },
  { en: "good night", fr: "bonne nuit" },
  { en: "how are you", fr: "comment vas-tu ?" },
  { en: "nice to meet you", fr: "enchanté(e)" },
  { en: "see you later", fr: "à plus tard" },
  { en: "welcome", fr: "bienvenue" },
  { en: "help", fr: "aide ; aider" },
  { en: "water", fr: "eau" },
  { en: "food", fr: "nourriture" },
  { en: "name", fr: "nom" },
  { en: "friend", fr: "ami(e)" },
  { en: "work", fr: "travail ; travailler" },
  { en: "time", fr: "temps ; heure" },
  { en: "day", fr: "jour" },
  { en: "today", fr: "aujourd'hui" },
  { en: "tomorrow", fr: "demain" },
  { en: "yesterday", fr: "hier" },
  { en: "love", fr: "aimer ; amour" },
  { en: "want", fr: "vouloir" },
  { en: "need", fr: "avoir besoin" },
  { en: "know", fr: "savoir ; connaître" },
  { en: "understand", fr: "comprendre" },
  { en: "speak", fr: "parler" },
  { en: "listen", fr: "écouter" },
  { en: "read", fr: "lire" },
  { en: "write", fr: "écrire" },
  { en: "learn", fr: "apprendre" },
  { en: "house", fr: "maison" },
  { en: "home", fr: "chez soi ; maison" },
  { en: "money", fr: "argent" },
  { en: "happy", fr: "heureux / heureuse" },
  { en: "tired", fr: "fatigué(e)" },
  { en: "hungry", fr: "affamé(e)" },
  { en: "beautiful", fr: "beau / belle" },
  { en: "big", fr: "grand(e)" },
  { en: "small", fr: "petit(e)" },
  { en: "fast", fr: "rapide" },
  { en: "slow", fr: "lent(e)" },
];

const CORE_FALLBACK = CURRICULUM[0];

for (const [index, entry] of CORE_WORDS.entries()) {
  const key = normalize(entry.en);
  if (WORD_ENTRIES.some((word) => normalize(word.en) === key)) continue;

  const phrase = PHRASE_INDEX.find((item) => item.en.includes(key));
  const source = phrase
    ? {
        unitId: phrase.hit.unitId,
        unitTitle: phrase.hit.unitTitle,
        unitEmoji: phrase.hit.unitEmoji,
        level: phrase.hit.level,
        category: phrase.hit.category,
      }
    : {
        unitId: CORE_FALLBACK.id,
        unitTitle: CORE_FALLBACK.title,
        unitEmoji: CORE_FALLBACK.emoji,
        level: CORE_FALLBACK.level,
        category: CORE_FALLBACK.cat,
      };

  WORD_ENTRIES.push({
    kind: "word",
    id: `core-${index}`,
    en: entry.en,
    fr: entry.fr,
    example: entry.example ?? (phrase && phrase.hit.en !== entry.en ? phrase.hit.en : undefined),
    ...source,
  });
}

const WORD_INDEX = WORD_ENTRIES.map((entry) => ({
  hit: entry,
  en: normalize(entry.en),
  fr: normalize(entry.fr),
}));

/** Distance d'édition minimale, pour proposer un mot proche en cas de faute. */
function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function suggest(needle: string, limit = 4): EntryHit[] {
  if (needle.length < 3) return [];
  const pool = [...WORD_INDEX, ...PHRASE_INDEX];
  return pool
    .map((entry) => {
      const target = entry.en;
      if (Math.abs(target.length - needle.length) > 3) return { entry, score: 0 };
      let score = 0;
      if (target.startsWith(needle.slice(0, 3))) score += 3;
      score += Math.max(0, 6 - editDistance(needle, target));
      return { entry, score };
    })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry.hit);
}

/**
 * Recherche instantanée : mots du dictionnaire, expressions puis leçons.
 * L'index est construit une seule fois au chargement du module.
 */
export function search(query: string): SearchResult {
  const needle = normalize(query);
  if (needle.length < 2) return { hits: [] };

  const words = needle.split(/\s+/).filter(Boolean);
  const single = words.length === 1;
  const wordRe = new RegExp(`\\b${escapeRegExp(needle)}\\b`);

  // 1. Les mots du dictionnaire passent avant les phrases qui les contiennent.
  const wordMatches = WORD_INDEX.map((entry) => {
    let score = 0;
    if (entry.en === needle) score = 200;
    else if (single && wordRe.test(entry.en)) score = 170;
    else if (entry.en.startsWith(needle)) score = 140;
    else if (entry.fr === needle) score = 130;
    else if (single && wordRe.test(entry.fr)) score = 110;
    else if (entry.en.includes(needle)) score = 80;
    else if (entry.fr.startsWith(needle)) score = 70;
    else if (entry.fr.includes(needle)) score = 40;
    return { ...entry, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const wordKeys = new Set(wordMatches.map((entry) => entry.en));

  // 2. Les phrases du parcours qui contiennent la requête.
  const phraseMatches = PHRASE_INDEX.map((entry) => {
    let score = 0;
    if (entry.en === needle) score = 160;
    else if (entry.en.startsWith(needle)) score = 120;
    else if (entry.fr === needle) score = 105;
    else if (single && wordRe.test(entry.en)) score = 95;
    else if (entry.en.includes(needle)) score = 85;
    else if (single && wordRe.test(entry.fr)) score = 60;
    else if (entry.fr.includes(needle)) score = 35;
    else if (words.length > 1 && words.every((word) => entry.haystack.includes(word))) {
      score = 30;
    }

    // Une longue phrase est moins précise qu'un mot seul.
    if (score > 0 && entry.wordCount > 4) score -= 8;
    return { ...entry, score };
  })
    .filter((entry) => entry.score >= 55 && !wordKeys.has(entry.en))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 3. Les leçons dont le titre ou le contenu correspond.
  const lessons = LESSON_INDEX.map((entry) => {
    let score = 0;
    if (entry.title.startsWith(needle)) score += 40;
    else if (entry.title.includes(needle)) score += 25;
    if (words.every((word) => entry.haystack.includes(word))) score += 10;
    else if (!entry.haystack.includes(needle)) score = 0;
    return { hit: entry.hit, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.hit);

  const wordHits: WordHit[] = wordMatches.map((entry) => ({
    ...entry.hit,
    exact: entry.en === needle,
  }));
  const phraseHits: PhraseHit[] = phraseMatches.map((entry) => ({
    ...entry.hit,
    exact: entry.en === needle,
  }));

  // Fiche « mot et sens » : uniquement pour une recherche d'un seul mot.
  let definition: EntryHit | undefined;
  if (single) {
    const best = wordMatches[0];
    if (best && best.score >= 130) definition = wordHits[0];
    else {
      const exact = PHRASE_INDEX.find((entry) => entry.en === needle || entry.fr === needle);
      if (exact) definition = { ...exact.hit, exact: true };
      else if (phraseMatches[0] && phraseMatches[0].score >= 87) {
        // Le mot n'a pas de fiche : on l'illustre dans sa phrase d'usage.
        definition = { ...phraseHits[0], context: true };
      }
    }
  }

  const hits = [...wordHits, ...phraseHits, ...lessons].filter(
    (hit) => hit.id !== definition?.id,
  );

  return {
    hits,
    definition,
    suggestions: !definition && hits.length === 0 ? suggest(needle) : undefined,
  };
}

/** Mots courts proposés quand le champ est encore vide. */
export const SEARCH_EXAMPLES = ["airport", "meeting", "family", "always", "schedule"];

/** Découpe un texte autour de la requête pour surligner la correspondance. */
export function splitHighlight(text: string, query: string): Array<{ text: string; match: boolean }> {
  const needle = normalize(query);
  if (needle.length < 2) return [{ text, match: false }];

  // Normalise caractère par caractère en gardant la position d'origine :
  // indispensable pour surligner correctement les mots accentués.
  let flat = "";
  const map: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const piece = text[index]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    for (const character of piece) {
      flat += character;
      map.push(index);
    }
  }
  map.push(text.length);

  const parts: Array<{ text: string; match: boolean }> = [];
  let cursor = 0;
  let found = flat.indexOf(needle);
  while (found !== -1) {
    const start = map[found];
    const end = map[found + needle.length];
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
    found = flat.indexOf(needle, found + needle.length);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}

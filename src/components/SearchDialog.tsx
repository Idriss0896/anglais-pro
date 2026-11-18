import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, X } from "lucide-react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { CURRICULUM, PHRASES } from "@/data/curriculum";
import { CATEGORIES } from "@/lib/categories";
import { speak } from "@/lib/audio";
import { VOCAB_INDEX } from "@/lib/vocabulary";
import type { CategoryKey } from "@/types";
import { cn } from "@/lib/utils";

interface LessonHit {
  kind: "lesson";
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  level: number;
  category: CategoryKey;
}

interface PhraseHit {
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
  /** Vrai lorsque la requête correspond exactement au mot anglais. */
  exact?: boolean;
  /** Vrai lorsque le mot est illustré dans une phrase, faute de fiche dédiée. */
  context?: boolean;
}

type Hit = LessonHit | PhraseHit;

/** Retire les accents et la casse pour comparer « élève » et « eleve ». */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Index construit une seule fois : titre, sous-titre, catégorie, niveau et contenu. */
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
  ]
    .join(" ")
    .toLowerCase();

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

/** Dictionnaire : chaque mot du parcours avec sa traduction française. */
const WORD_INDEX = VOCAB_INDEX.map((entry) => ({
  hit: {
    kind: "phrase" as const,
    id: entry.id,
    en: entry.primary,
    fr: entry.meaning,
    note: entry.example ? `Exemple : ${entry.example}` : undefined,
    unitId: entry.unitId,
    unitTitle: entry.unitTitle,
    unitEmoji: entry.emoji,
    level: entry.level,
    category: entry.category,
  } satisfies PhraseHit,
  en: normalize(entry.primary),
  fr: normalize(entry.meaning),
}));

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
  haystack: normalize(
    `${phrase.en} ${phrase.fr} ${phrase.note ?? ""} ${phrase.unitTitle}`,
  ),
  wordCount: phrase.en.trim().split(/\s+/).length,
}));

interface SearchResult {
  hits: Hit[];
  /** Meilleur mot trouvé, affiché comme une fiche « mot et sens ». */
  definition?: PhraseHit;
  /** Mots proches proposés quand rien ne correspond. */
  suggestions?: PhraseHit[];
}

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

const SUGGESTION_POOL = [...WORD_INDEX, ...PHRASE_INDEX];

function suggest(needle: string, limit = 4): PhraseHit[] {
  if (needle.length < 3) return [];
  return SUGGESTION_POOL.map((entry) => {
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

function search(query: string): SearchResult {
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

  const wordHits: PhraseHit[] = wordMatches.map((entry) => ({
    ...entry.hit,
    exact: entry.en === needle,
  }));
  const phraseHits: PhraseHit[] = phraseMatches.map((entry) => ({
    ...entry.hit,
    exact: entry.en === needle,
  }));

  // Fiche « mot et sens » : uniquement pour une recherche d'un seul mot.
  let definition: PhraseHit | undefined;
  if (single) {
    const best = wordMatches[0];
    if (best && best.score >= 170) definition = wordHits[0];
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

const EXAMPLES = ["airport", "famille", "toujours", "understand"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const result = useMemo(() => search(query), [query]);
  const hits = result.hits;
  const definition = result.definition;
  const suggestions = result.suggestions ?? [];

  // Réinitialise la recherche à chaque ouverture et place le curseur dedans.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Verrouille le défilement du fond pendant l'ouverture.
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

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    onClose();
    if (hit.kind === "lesson") navigate(`/lesson/${hit.id}`);
    else navigate(`/lesson/${hit.unitId}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (hits.length ? (value + 1) % hits.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (hits.length ? (value - 1 + hits.length) % hits.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(hits[active] ?? definition);
    }
  };

  const lessons = hits.filter((hit) => hit.kind === "lesson") as LessonHit[];
  const phrases = hits.filter((hit) => hit.kind === "phrase") as PhraseHit[];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[82px] sm:px-6 lg:pl-[272px] lg:pt-[86px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher un mot, une leçon ou une expression"
        onClick={(event) => event.stopPropagation()}
        className="animate-slide-up relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-[#6d28d9] shadow-[0_30px_70px_-24px_rgba(30,16,96,0.48)] ring-1 ring-white/25"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
            <MaterialIcon name="search" size={20} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Un mot en anglais ou en français…"
            aria-label="Rechercher un mot, une leçon ou une expression"
            className="h-9 min-w-0 flex-1 bg-transparent text-[15px] font-bold text-white outline-none placeholder:font-medium placeholder:text-white/65"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Effacer la recherche"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div
          className={cn(
            "max-h-[60vh] overflow-y-auto px-2 py-2",
            query.trim().length < 2 ? "bg-[#4c1d95]" : "bg-surface",
          )}
        >
          {query.trim().length < 2 ? (
            <div className="px-4 py-7">
              <p className="font-display text-[15px] font-extrabold text-white">
                Cherche un mot, obtiens son sens
              </p>
              <p className="mt-1 text-[12px] font-medium leading-5 text-indigo-100/75">
                Écris un mot en anglais (ou en français) : l'application te donne sa
                traduction, son usage et la leçon pour l'écouter et le réviser.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/20"
                  >
                    <MaterialIcon name="translate" size={14} />
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 && !definition ? (
            <div className="px-4 py-7 text-center">
              <p className="text-[13.5px] font-extrabold text-ink">
                Aucun mot trouvé pour « {query.trim()} »
              </p>
              <p className="mt-1 text-[11.5px] font-medium leading-5 text-slate-500">
                Vérifie l'orthographe ou essaie un mot plus simple. Tu peux aussi parcourir
                toutes les leçons.
              </p>

              {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        setQuery(suggestion.en);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-line transition hover:bg-brand-soft hover:text-brand-strong"
                    >
                      <MaterialIcon name="translate" size={14} />
                      {suggestion.en}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/learn");
                }}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-[11.5px] font-extrabold text-white transition hover:bg-brand-800"
              >
                Voir le parcours
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <>
              {definition && (
                <div className="animate-pop mx-1 mb-2 overflow-hidden rounded-[22px] bg-azure-soft ring-1 ring-azure-strong/20">
                  <div className="flex items-start gap-3 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-azure-700 text-lg text-white">
                      {definition.unitEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="inline-flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-azure-strong">
                        <MaterialIcon name="translate" size={13} />
                        {definition.context ? "Mot en contexte" : "Mot et sens"}
                      </p>
                      <p className="font-display mt-1 text-xl font-extrabold leading-tight text-ink">
                        {definition.en}
                      </p>
                      <p className="mt-0.5 text-[14px] font-extrabold text-azure-strong">
                        {definition.fr}
                      </p>
                      {definition.note && (
                        <p className="mt-1.5 text-[11.5px] font-medium leading-5 text-slate-600">
                          {definition.note}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(definition.en)}
                      aria-label={`Écouter ${definition.en}`}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-azure-strong ring-1 ring-azure-strong/20 transition hover:scale-105"
                    >
                      <MaterialIcon name="volume_up" size={20} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-azure-strong/15 bg-surface/40 px-4 py-2.5">
                    <span className="truncate text-[10.5px] font-bold text-slate-500">
                      {definition.unitTitle} · Niveau {definition.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => go(definition)}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-azure-700 px-3 text-[10.5px] font-extrabold text-white transition hover:bg-azure-800"
                    >
                      Ouvrir la leçon
                      <MaterialIcon name="arrow_forward" size={14} />
                    </button>
                  </div>
                </div>
              )}

              {!definition && phrases.length === 0 && lessons.length > 0 && (
                <div className="mx-1 mb-2 flex items-start gap-2.5 rounded-[18px] bg-surface-soft px-3.5 py-3 ring-1 ring-line">
                  <MaterialIcon name="translate" size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <p className="text-[11.5px] font-medium leading-5 text-slate-500">
                    « {query.trim()} » n'a pas encore sa propre fiche, mais ces leçons le
                    montrent en contexte.
                  </p>
                </div>
              )}

              {phrases.length > 0 && (
                <div className="pb-1">
                  <p className="px-3 pb-1 pt-2 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Mots et expressions · {phrases.length}
                  </p>
                  {phrases.map((hit) => {
                    const index = hits.indexOf(hit);
                    return (
                      <div
                        key={hit.id}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                          index === active ? "bg-brand-soft" : "hover:bg-surface-soft",
                        )}
                        onMouseEnter={() => setActive(index)}
                      >
                        <button
                          type="button"
                          onClick={() => go(hit)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-azure-strong ring-1 ring-line">
                            <MaterialIcon name="translate" size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-extrabold text-ink">
                              {hit.en}
                            </span>
                            <span className="block truncate text-[11px] font-semibold text-azure-strong">
                              {hit.fr}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speak(hit.en)}
                          aria-label={`Écouter ${hit.en}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-surface hover:text-azure-strong"
                        >
                          <MaterialIcon name="volume_up" size={18} />
                        </button>
                        <ArrowRight
                          size={14}
                          className={cn(
                            "shrink-0 transition",
                            index === active ? "text-brand-strong" : "text-slate-300",
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {lessons.length > 0 && (
                <div className="pb-1">
                  <p className="px-3 pb-1 pt-2 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Leçons · {lessons.length}
                  </p>
                  {lessons.map((hit) => {
                    const index = hits.indexOf(hit);
                    return (
                      <button
                        key={hit.id}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(hit)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                          index === active ? "bg-brand-soft" : "hover:bg-surface-soft",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-lg ring-1 ring-line"
                        >
                          {hit.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-extrabold text-ink">
                            {hit.title}
                          </span>
                          <span className="block truncate text-[10.5px] font-semibold text-slate-500">
                            {CATEGORIES[hit.category].shortLabel} · Niveau {hit.level} ·{" "}
                            {hit.subtitle}
                          </span>
                        </span>
                        <ArrowRight
                          size={14}
                          className={cn(
                            "shrink-0 transition",
                            index === active ? "text-brand-strong" : "text-slate-300",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className={cn(
          "flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[10px] font-bold",
          query.trim().length < 2
            ? "border-white/15 bg-[#3b1878] text-indigo-100/70"
            : "border-line bg-surface-soft text-slate-500",
        )}>
          <span className="inline-flex items-center gap-1.5">
            <CornerDownLeft size={12} />
            Entrée pour ouvrir
          </span>
          <span>
            {definition || hits.length > 0
              ? `${hits.length + (definition ? 1 : 0)} résultat${
                  hits.length + (definition ? 1 : 0) > 1 ? "s" : ""
                }`
              : "Un mot, un sens, une leçon"}
          </span>
        </div>
      </div>
    </div>
  );
}

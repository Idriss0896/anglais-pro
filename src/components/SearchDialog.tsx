import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, MessageCircle, Search, X } from "lucide-react";
import { CURRICULUM, PHRASES } from "@/data/curriculum";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface LessonHit {
  kind: "lesson";
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  level: number;
  category: keyof typeof CATEGORIES;
}

interface PhraseHit {
  kind: "phrase";
  id: string;
  en: string;
  fr: string;
  unitId: string;
  unitTitle: string;
}

type Hit = LessonHit | PhraseHit;

/** Index construit une seule fois : titre, sous-titre, catégorie, niveau et contenu. */
const LESSON_INDEX = CURRICULUM.map((unit) => {
  const category = CATEGORIES[unit.cat];
  const content = [
    ...unit.theory.flatMap((block) => [
      block.text ?? "",
      block.title ?? "",
      ...(block.items ?? []).flatMap((item) => [item.en, item.fr]),
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
    title: unit.title.toLowerCase(),
    haystack: `${unit.title} ${unit.subtitle} ${category.label} ${category.shortLabel} ${unit.levelTitle} niveau ${unit.level} ${content}`.toLowerCase(),
  };
});

const PHRASE_INDEX = PHRASES.map((phrase) => ({
  hit: {
    kind: "phrase" as const,
    id: phrase.id,
    en: phrase.en,
    fr: phrase.fr,
    unitId: phrase.unitId,
    unitTitle: phrase.unitTitle,
  },
  haystack: `${phrase.en} ${phrase.fr} ${phrase.note ?? ""} ${phrase.unitTitle}`.toLowerCase(),
}));

function search(query: string): Hit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const words = needle.split(/\s+/).filter(Boolean);

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
    .slice(0, 8)
    .map((entry) => entry.hit);

  const phrases = PHRASE_INDEX.filter((entry) =>
    words.every((word) => entry.haystack.includes(word)),
  )
    .slice(0, 5)
    .map((entry) => entry.hit);

  return [...lessons, ...phrases];
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const hits = useMemo(() => search(query), [query]);

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
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    onClose();
    if (hit.kind === "lesson") navigate(`/lesson/${hit.id}`);
    else navigate(`/expressions?q=${encodeURIComponent(hit.en)}`);
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
      go(hits[active]);
    }
  };

  const lessons = hits.filter((hit) => hit.kind === "lesson") as LessonHit[];
  const phrases = hits.filter((hit) => hit.kind === "phrase") as PhraseHit[];

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[8vh] sm:px-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[#1e1060]/55 backdrop-blur-[3px] animate-fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher une leçon ou une expression"
        className="animate-slide-up relative flex w-full max-w-xl flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_40px_90px_-30px_rgba(30,16,96,0.55)] ring-1 ring-[#2563eb]/10"
      >
        <div className="flex items-center gap-3 border-b border-[#2563eb]/10 px-4 py-3.5">
          <Search size={18} className="shrink-0 text-[#2563eb]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Une leçon, un thème, une expression…"
            aria-label="Rechercher une leçon ou une expression"
            className="h-8 min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Effacer la recherche"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-[#eef4ff] hover:text-[#1d4ed8]"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="hidden rounded-md bg-[#eef4ff] px-2 py-1 text-[10px] font-extrabold text-[#1d4ed8] ring-1 ring-[#2563eb]/15 sm:block">
              Échap
            </kbd>
          )}
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-2 py-2">
          {query.trim().length < 2 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] font-extrabold text-ink">Cherche n'importe quel mot</p>
              <p className="mt-1 text-[11.5px] font-medium leading-5 text-slate-500">
                Exemples : <span className="font-bold text-[#1d4ed8]">present</span>,{" "}
                <span className="font-bold text-[#1d4ed8]">famille</span>,{" "}
                <span className="font-bold text-[#1d4ed8]">airport</span>,{" "}
                <span className="font-bold text-[#1d4ed8]">restaurant</span>.
              </p>
            </div>
          ) : hits.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] font-extrabold text-ink">Aucun résultat</p>
              <p className="mt-1 text-[11.5px] font-medium text-slate-500">
                Essaie un mot plus court ou consulte toutes les leçons.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/learn");
                }}
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#2563eb] px-3.5 text-[11.5px] font-extrabold text-white transition hover:bg-[#1d4ed8]"
              >
                Voir le parcours
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <>
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
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                          index === active ? "bg-[#eef4ff]" : "hover:bg-[#f5f8ff]",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-lg ring-1 ring-[#2563eb]/12"
                        >
                          {hit.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-extrabold text-ink">
                            {hit.title}
                          </span>
                          <span className="block truncate text-[10.5px] font-semibold text-slate-500">
                            {CATEGORIES[hit.category].shortLabel} · Niveau {hit.level} · {hit.subtitle}
                          </span>
                        </span>
                        <ArrowRight
                          size={14}
                          className={cn(
                            "shrink-0 transition",
                            index === active ? "text-[#1d4ed8]" : "text-slate-300",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {phrases.length > 0 && (
                <div className="pb-1">
                  <p className="px-3 pb-1 pt-2 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Expressions · {phrases.length}
                  </p>
                  {phrases.map((hit) => {
                    const index = hits.indexOf(hit);
                    return (
                      <button
                        key={hit.id}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(hit)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                          index === active ? "bg-[#eef4ff]" : "hover:bg-[#f5f8ff]",
                        )}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-[#1d4ed8] ring-1 ring-[#2563eb]/12">
                          <MessageCircle size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-extrabold text-ink">
                            {hit.en}
                          </span>
                          <span className="block truncate text-[10.5px] font-semibold text-slate-500">
                            {hit.fr}
                          </span>
                        </span>
                        <ArrowRight
                          size={14}
                          className={cn(
                            "shrink-0 transition",
                            index === active ? "text-[#1d4ed8]" : "text-slate-300",
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

        <div className="flex items-center justify-between gap-3 border-t border-[#2563eb]/10 bg-[#f7faff] px-4 py-2.5 text-[10px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CornerDownLeft size={12} />
            Entrée pour ouvrir
          </span>
          <span>{hits.length > 0 ? `${hits.length} résultat${hits.length > 1 ? "s" : ""}` : "Échap pour fermer"}</span>
        </div>
      </div>
    </div>
  );
}

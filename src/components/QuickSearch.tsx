import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, Search, X } from "@/lib/icons";
import { MaterialIcon } from "@/components/MaterialIcon";
import { LEVEL_SHORT_NAMES, LEVEL_THEMES } from "@/lib/levels";
import { speak } from "@/lib/audio";
import {
  SEARCH_EXAMPLES,
  search,
  splitHighlight,
  type EntryHit,
  type Hit,
  type LessonHit,
  type WordHit,
} from "@/lib/search";
import { cn, plural } from "@/lib/utils";
import type { CategoryKey } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface QuickSearchProps {
  className?: string;
  autoFocus?: boolean;
  /** Appelé quand l'utilisateur ferme la recherche (utile en mobile). */
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

/** Surligne la partie du texte qui correspond à la requête. */
function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlight(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded bg-amber-soft px-0.5 text-ink">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

function LevelChip({ level }: { level: number }) {
  const theme = LEVEL_THEMES[level];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold",
        theme.badge,
      )}
    >
      {LEVEL_SHORT_NAMES[level]}
    </span>
  );
}

/**
 * Recherche instantanée intégrée à la barre du haut : on écrit directement,
 * les résultats (mot, sens, exemple, expression, leçon) s'affichent dessous,
 * sans quitter la page ni ouvrir de fenêtre.
 */
export function QuickSearch({
  className,
  autoFocus = false,
  onClose,
  variant = "desktop",
}: QuickSearchProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(autoFocus);
  const [active, setActive] = useState(0);

  // La frappe reste fluide : la recherche suit avec un léger différé.
  const deferredQuery = useDeferredValue(query);
  const result = useMemo(() => search(deferredQuery), [deferredQuery]);

  const rows: Hit[] = useMemo(
    () => (result.definition ? [result.definition, ...result.hits] : result.hits),
    [result],
  );
  const definition = result.definition;
  const isTyping = query.trim().length >= 2;
  const showResults = open && isTyping;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Referme le panneau à chaque changement de page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Raccourci « / » depuis n'importe où dans l'application.
  useEffect(() => {
    if (variant !== "desktop") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant]);

  useEffect(() => {
    setActive(0);
  }, [deferredQuery]);

  // Garde la ligne active visible quand on navigue au clavier.
  useEffect(() => {
    if (!showResults) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, showResults]);

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    setOpen(false);
    if (hit.kind === "lesson") navigate(`/lesson/${hit.id}`);
    else navigate(`/lesson/${hit.unitId}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) {
        setQuery("");
        setOpen(true);
      } else {
        setOpen(false);
        onClose?.();
        inputRef.current?.blur();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (rows.length ? (value + 1) % rows.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (rows.length ? (value - 1 + rows.length) % rows.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (rows.length) go(rows[active]);
      else if (isTyping) navigate("/learn");
    }
  };

  const words = result.hits.filter((hit) => hit.kind === "word") as WordHit[];
  const phrases = result.hits.filter((hit) => hit.kind === "phrase");
  const lessons = result.hits.filter((hit) => hit.kind === "lesson") as LessonHit[];

  const renderEntry = (hit: EntryHit, label: string) => {
    const index = rows.indexOf(hit);
    const isActive = index === active;
    return (
      <div
        key={`${hit.kind}-${hit.id}`}
        data-active={isActive || undefined}
        onMouseEnter={() => setActive(index)}
        className={cn(
          "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors",
          isActive ? "bg-brand-soft" : "hover:bg-surface-soft",
        )}
      >
        <button
          type="button"
          onClick={() => go(hit)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1",
              isActive
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-surface text-brand-strong ring-line",
            )}
          >
            <MaterialIcon name="translate" size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[12.5px] font-extrabold text-ink">
                <Highlight text={hit.en} query={deferredQuery} />
              </span>
              <LevelChip level={hit.level} />
            </span>
            <span className="mt-0.5 block truncate text-[10.5px] font-semibold text-azure-strong">
              <Highlight text={hit.fr} query={deferredQuery} />
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => speak(hit.en)}
          aria-label={`Écouter ${hit.en}`}
          title={`Écouter « ${hit.en} »`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-surface hover:text-brand-strong"
        >
          <MaterialIcon name="volume_up" size={16} />
        </button>
        <span className="sr-only">{label}</span>
        <ArrowRight
          size={13}
          className={cn(
            "shrink-0 transition",
            isActive ? "text-brand-strong" : "text-slate-300",
          )}
        />
      </div>
    );
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-2xl bg-white/12 px-3 ring-1 ring-white/20 transition-all duration-200",
          "focus-within:bg-white focus-within:ring-2 focus-within:ring-white/75",
          open && "bg-white ring-white/75",
        )}
      >
        <Search
          size={17}
          strokeWidth={2.4}
          className={cn(
            "shrink-0 transition-colors",
            open ? "text-brand-700" : "text-indigo-100/90",
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls="quick-search-results"
          aria-autocomplete="list"
          aria-label="Rechercher un mot, une expression ou une leçon"
          placeholder="Rechercher un mot…"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none [&::-webkit-search-cancel-button]:hidden placeholder:font-medium",
            open
              ? "text-brand-900 placeholder:text-slate-400"
              : "text-white placeholder:text-indigo-100/70",
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
              setOpen(true);
            }}
            aria-label="Effacer la recherche"
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full transition",
              open
                ? "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                : "text-indigo-100/70 hover:bg-white/15 hover:text-white",
            )}
          >
            <X size={14} />
          </button>
        ) : (
          <>
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setOpen(false);
                }}
                aria-label="Fermer la recherche"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-indigo-100/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
            <kbd className="hidden shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-100/70 ring-1 ring-white/20 xl:block">
              /
            </kbd>
          </>
        )}
      </div>

      {showResults && (
        <div
          id="quick-search-results"
          role="listbox"
          aria-label="Résultats de recherche"
          className={cn(
            "animate-search-in absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-[22px] bg-surface text-left shadow-[0_26px_60px_-24px_rgba(23,22,43,0.45)] ring-1 ring-brand-500/20",
            variant === "mobile" && "max-h-[68vh]",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line bg-brand-soft/60 px-3.5 py-2">
            <span className="inline-flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-brand-strong">
              <MaterialIcon name="translate" size={13} />
              Dictionnaire ANGLO CLUB
            </span>
            {isTyping && (
              <span className="text-[10px] font-bold text-slate-500">
                {rows.length} {plural(rows.length, "résultat")}
              </span>
            )}
          </div>

          <div
            ref={listRef}
            className={cn(
              "overflow-y-auto px-1.5 py-1.5",
              variant === "mobile" ? "max-h-[54vh]" : "max-h-[62vh]",
            )}
          >
            {!isTyping ? (
              <div className="px-2 py-3">
                <p className="text-[12.5px] font-extrabold text-ink">
                  Écris un mot, obtiens son sens.
                </p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                  Un mot en anglais ou en français : traduction, exemple et leçon pour
                  l'écouter.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SEARCH_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuery(example);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2.5 py-1 text-[10.5px] font-extrabold text-slate-600 ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-brand-soft hover:text-brand-strong"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {definition && (
                  <div className="px-1 pb-1.5">
                    <div
                      data-active={active === 0 || undefined}
                      onMouseEnter={() => setActive(0)}
                      className={cn(
                        "overflow-hidden rounded-2xl bg-brand-soft ring-1 transition",
                        active === 0
                          ? "ring-2 ring-brand-500/50"
                          : "ring-brand-500/20",
                      )}
                    >
                      <div className="flex items-start gap-3 p-3.5">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-lg text-white shadow-sm">
                          {definition.unitEmoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-brand-strong">
                            <MaterialIcon name="translate" size={12} />
                            {definition.context ? "Mot en contexte" : "Mot et sens"}
                          </p>
                          <p className="font-display mt-0.5 break-words text-[21px] font-extrabold leading-tight text-ink">
                            <Highlight text={definition.en} query={deferredQuery} />
                          </p>
                          <p className="mt-0.5 text-[13.5px] font-extrabold leading-tight text-brand-strong">
                            <Highlight text={definition.fr} query={deferredQuery} />
                          </p>
                          {("note" in definition ? definition.note : undefined) && (
                            <p className="mt-1.5 text-[11px] font-medium leading-5 text-slate-600">
                              {"note" in definition ? definition.note : ""}
                            </p>
                          )}
                          {"example" in definition && definition.example && (
                            <p className="mt-2 rounded-lg bg-surface/80 px-2.5 py-1.5 text-[11px] font-medium italic leading-5 text-slate-600 ring-1 ring-white/70">
                              « <Highlight text={definition.example} query={deferredQuery} /> »
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(definition.en)}
                          aria-label={`Écouter ${definition.en}`}
                          title={`Écouter « ${definition.en} »`}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white ring-1 ring-brand-700/30 transition hover:scale-105 hover:bg-brand-700 active:scale-95"
                        >
                          <MaterialIcon name="volume_up" size={19} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-brand-500/15 bg-surface/50 px-3.5 py-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <LevelChip level={definition.level} />
                          <span className="truncate text-[10px] font-bold text-slate-500">
                            {CATEGORIES[definition.category as CategoryKey].shortLabel} ·{" "}
                            {definition.unitTitle}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => go(definition)}
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 text-[10px] font-extrabold text-white transition hover:bg-brand-800 active:scale-95"
                        >
                          Ouvrir la leçon
                          <MaterialIcon name="arrow_forward" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {definition && definition.kind === "word" && words.length > 0 && (
                  <p className="px-3.5 pb-1 pt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Autres mots
                  </p>
                )}
                {words.map((hit) => renderEntry(hit, "Mot"))}

                {phrases.length > 0 && (
                  <p className="px-3.5 pb-1 pt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Expressions
                  </p>
                )}
                {phrases.map((hit) => renderEntry(hit as EntryHit, "Expression"))}

                {lessons.length > 0 && (
                  <p className="px-3.5 pb-1 pt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Leçons
                  </p>
                )}
                {lessons.map((hit) => {
                  const index = rows.indexOf(hit);
                  const isActive = index === active;
                  return (
                    <button
                      key={hit.id}
                      type="button"
                      data-active={isActive || undefined}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(hit)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                        isActive ? "bg-brand-soft" : "hover:bg-surface-soft",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-base ring-1 ring-line"
                      >
                        {hit.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-extrabold text-ink">
                            <Highlight text={hit.title} query={deferredQuery} />
                          </span>
                          <LevelChip level={hit.level} />
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] font-semibold text-slate-500">
                          {CATEGORIES[hit.category].shortLabel} · {hit.subtitle}
                        </span>
                      </span>
                      <ArrowRight
                        size={13}
                        className={cn(
                          "shrink-0 transition",
                          isActive ? "text-brand-strong" : "text-slate-300",
                        )}
                      />
                    </button>
                  );
                })}

                {rows.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[12.5px] font-extrabold text-ink">
                      Aucun mot trouvé pour « {query.trim()} »
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                      Vérifie l'orthographe ou essaie un mot plus simple.
                    </p>

                    {(result.suggestions ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {result.suggestions!.map((suggestion) => (
                          <button
                            key={`${suggestion.kind}-${suggestion.id}`}
                            type="button"
                            onClick={() => {
                              setQuery(suggestion.en);
                              inputRef.current?.focus();
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2.5 py-1 text-[10.5px] font-extrabold text-slate-600 ring-1 ring-line transition hover:bg-brand-soft hover:text-brand-strong"
                          >
                            <MaterialIcon name="translate" size={12} />
                            {suggestion.en}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate("/learn");
                      }}
                      className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-700 px-3 text-[11px] font-extrabold text-white transition hover:bg-brand-800 active:scale-95"
                    >
                      Voir le parcours
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-soft px-3.5 py-2 text-[9.5px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CornerDownLeft size={11} />
              Entrée pour ouvrir
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <span aria-hidden="true" className="font-extrabold">
                ↑ ↓
              </span>
              naviguer · Échap fermer
            </span>
            <span className="inline-flex items-center gap-1 sm:hidden">Échap pour fermer</span>
          </div>
        </div>
      )}
    </div>
  );
}

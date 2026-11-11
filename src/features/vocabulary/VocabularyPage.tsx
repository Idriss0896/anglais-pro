import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookA,
  ChevronDown,
  Search,
  Tag,
  Volume2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatPill } from "@/components/StatPill";
import { EmptyState } from "@/components/EmptyState";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
import { CURRICULUM, TOTAL_UNITS, countByCategory } from "@/data/curriculum";
import { useProgressStore } from "@/store/useProgressStore";
import { cn, plural } from "@/lib/utils";
import { speak } from "@/lib/audio";
import type { CurriculumUnit } from "@/types";

interface VocabEntry {
  id: string;
  primary: string;
  secondary: string;
}

const VOCAB_UNITS = CURRICULUM.filter((unit) => unit.cat === "vocabulary");

function englishColumn(head?: string[]) {
  if (!head) return 0;
  const index = head.findIndex((column) => /english|anglais/i.test(column));
  return index >= 0 ? index : 0;
}

function buildEntries(unit: CurriculumUnit): VocabEntry[] {
  const entries: VocabEntry[] = [];
  unit.theory.forEach((block, blockIndex) => {
    if (block.t !== "table") return;
    const index = englishColumn(block.head);
    (block.rows ?? []).forEach((row, rowIndex) => {
      const primary = row[index] ?? row[0] ?? "";
      if (!primary) return;
      const secondary = row
        .filter((_, cellIndex) => cellIndex !== index)
        .filter(Boolean)
        .join(" · ");
      entries.push({
        id: `${unit.id}:vocab:${blockIndex}:${rowIndex}`,
        primary,
        secondary,
      });
    });
  });
  return entries;
}

function VocabRow({ entry }: { entry: VocabEntry }) {
  return (
    <div className="group/row flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-emerald-50/70">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold text-ink">{entry.primary}</p>
        {entry.secondary && (
          <p className="truncate text-[11px] font-medium text-slate-500">{entry.secondary}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => speak(entry.primary)}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-300 opacity-0 transition group-hover/row:opacity-100 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:opacity-100"
        aria-label={`Écouter : ${entry.primary}`}
      >
        <Volume2 size={14} strokeWidth={2.3} />
      </button>
    </div>
  );
}

export function VocabularyPage() {
  const lessons = useProgressStore((state) => state.lessons);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<"all" | 1 | 2 | 3>("all");
  const [openId, setOpenId] = useState<string | null>(VOCAB_UNITS[0]?.id ?? null);

  const unitsWithEntries = useMemo(
    () =>
      VOCAB_UNITS.map((unit) => ({
        unit,
        entries: buildEntries(unit),
      })).filter(({ unit }) => level === "all" || unit.level === level),
    [level],
  );

  const totalWords = useMemo(
    () => VOCAB_UNITS.reduce((sum, unit) => sum + buildEntries(unit).length, 0),
    [],
  );

  const needle = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!needle) return [];
    return unitsWithEntries
      .map(({ unit, entries }) => ({
        unit,
        entries: entries.filter((entry) =>
          `${entry.primary} ${entry.secondary}`.toLowerCase().includes(needle),
        ),
      }))
      .filter(({ entries }) => entries.length > 0);
  }, [needle, unitsWithEntries]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vocabulaire thématique"
        title="Les mots qui servent vraiment"
        description="Du vocabulaire classé par situations : nombres, famille, nourriture, voyages, travail… avec la prononciation anglaise."
        icon={Tag}
        iconTone="from-emerald-500 to-teal-600"
        actions={
          <>
            <StatPill icon={Tag} value={countByCategory("vocabulary")} label="thèmes" tone="mint" />
            <StatPill icon={BookA} value={totalWords} label="mots" tone="neutral" />
          </>
        }
      />

      <div className="animate-fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 p-5 text-white shadow-[0_24px_50px_-26px_rgba(16,185,129,.8)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
              Conseil
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
              Apprends les mots en groupe, pas isolés.
            </h2>
            <p className="mt-1.5 text-[12.5px] font-medium leading-6 text-white/75">
              Chaque thème regroupe des mots qui s'utilisent ensemble. Écoute-les,
              répète-les à voix haute et imagine une phrase pour chacun.
            </p>
          </div>
          <Tag size={84} strokeWidth={1.2} className="hidden shrink-0 text-white/20 sm:block" />
        </div>
      </div>

      <div className="animate-fade-up space-y-4" style={{ animationDelay: "60ms" }}>
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Chercher un mot en anglais ou en français…"
            className="h-12 w-full rounded-2xl bg-white pl-11 pr-11 text-sm font-semibold text-ink shadow-soft ring-1 ring-slate-900/[0.06] transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-brand-300"
            aria-label="Rechercher un mot de vocabulaire"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink"
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLevel("all")}
            className={cn(
              "rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
              level === "all"
                ? "bg-ink text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
            )}
          >
            Tous les niveaux
          </button>
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
                level === value
                  ? "bg-ink text-white"
                  : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
              )}
            >
              {LEVEL_EMOJIS[value]} Niv. {value}
            </button>
          ))}
        </div>
      </div>

      {needle ? (
        searchResults.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun mot trouvé"
            description="Vérifie l'orthographe ou essaie avec un autre mot-clé."
            action={
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-extrabold text-brand-600 hover:text-brand-700"
              >
                Effacer la recherche
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-400">
              {searchResults.reduce((sum, group) => sum + group.entries.length, 0)} mots
              trouvés dans {searchResults.length}{" "}
              {plural(searchResults.length, "thème")}
            </p>
            {searchResults.map(({ unit, entries }) => (
              <section key={unit.id} className="card overflow-hidden p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-lg ring-1 ring-emerald-100">
                    {unit.emoji}
                  </span>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-ink">{unit.title}</h2>
                    <p className="text-[10px] font-bold text-slate-400">
                      Niveau {unit.level} · {entries.length} résultat
                      {entries.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {entries.map((entry) => (
                    <VocabRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {unitsWithEntries.map(({ unit, entries }) => {
            const theme = LEVEL_THEMES[unit.level];
            const open = openId === unit.id;
            const done = Boolean(lessons[unit.id]?.completed);
            return (
              <section
                key={unit.id}
                className={cn(
                  "card animate-fade-up flex flex-col overflow-hidden",
                  open && "ring-2 ring-emerald-200",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : unit.id)}
                  className="flex items-center gap-3 p-4 text-left transition hover:bg-slate-50/60"
                  aria-expanded={open}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-xl ring-1 ring-emerald-100">
                    {unit.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-extrabold ring-1",
                          theme.soft,
                          theme.text,
                          theme.ring,
                        )}
                      >
                        Niv. {unit.level}
                      </span>
                      {done && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">
                          Terminé
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-[14px] font-extrabold text-ink">
                      {unit.title}
                    </span>
                    <span className="block truncate text-[10.5px] font-semibold text-slate-400">
                      {entries.length} mots · {unit.subtitle}
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={cn(
                      "shrink-0 text-slate-400 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>

                {open && (
                  <div className="animate-fade-in border-t border-slate-100 px-3 pb-3 pt-2">
                    <div className="grid gap-0.5">
                      {entries.map((entry) => (
                        <VocabRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-1.5 pt-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        {unit.quiz.length} exercices associés
                      </span>
                      <Link
                        to={`/lesson/${unit.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800"
                      >
                        Ouvrir la leçon
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] font-bold text-slate-400">
        {TOTAL_UNITS} leçons au total · {VOCAB_UNITS.length} thèmes de vocabulaire
      </p>
    </div>
  );
}

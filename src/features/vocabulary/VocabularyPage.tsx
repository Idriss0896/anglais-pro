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
import { Mascot, MascotSay, mascotFor, MASCOTS } from "@/components/Mascot";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
import { LEVELS, TOTAL_UNITS, countByCategory } from "@/data/curriculum";
import { useProgressStore } from "@/store/useProgressStore";
import { cn, plural } from "@/lib/utils";
import { speak } from "@/lib/audio";
import { buildVocabEntries, VOCAB_UNITS } from "@/lib/vocabulary";

interface VocabEntry {
  id: string;
  primary: string;
  secondary: string;
}

function buildEntries(unit: (typeof VOCAB_UNITS)[number]): VocabEntry[] {
  return buildVocabEntries(unit).map((entry) => ({
    id: entry.id,
    primary: entry.primary,
    secondary: [entry.example, entry.meaning].filter(Boolean).join(" · "),
  }));
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
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 opacity-0 transition group-hover/row:opacity-100 hover:bg-emerald-soft hover:text-emerald-strong focus-visible:opacity-100"
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
  const [level, setLevel] = useState<"all" | number>("all");
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
        iconTone="bg-emerald-500"
        actions={
          <>
            <StatPill icon={Tag} value={countByCategory("vocabulary")} label="thèmes" tone="mint" />
            <StatPill icon={BookA} value={totalWords} label="mots" tone="neutral" />
          </>
        }
      />

      <div className="animate-fade-up relative overflow-hidden rounded-[28px] bg-emerald-700 p-5 text-white shadow-[0_24px_50px_-26px_rgba(16,185,129,.8)] sm:p-6">
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
          <Mascot
            id="zoe"
            mood="cheer"
            size={108}
            className="h-[70px] w-[70px] shrink-0 drop-shadow-[0_18px_30px_rgba(6,78,59,0.35)] sm:h-[108px] sm:w-[108px]"
          />
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
            className="h-12 w-full rounded-2xl bg-surface pl-11 pr-11 text-sm font-semibold text-ink shadow-soft ring-1 ring-slate-900/[0.06] transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-brand-300"
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
                ? "bg-[#131a33] text-white"
                : "bg-surface text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
            )}
          >
            Tous les niveaux
          </button>
          {LEVELS.map(({ num: value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
                level === value
                  ? "bg-[#131a33] text-white"
                  : "bg-surface text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
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
                className="text-xs font-extrabold text-brand-strong hover:text-brand-strong"
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
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-lg ring-1 ring-emerald-strong/20">
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
            const coach = mascotFor(unit.id);
            return (
              <section
                key={unit.id}
                className={cn(
                  "card animate-fade-up flex flex-col overflow-hidden",
                  open && "ring-2 ring-emerald-strong/20",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : unit.id)}
                  className="flex items-center gap-3 p-4 text-left transition hover:bg-surface-soft/60"
                  aria-expanded={open}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-soft text-xl ring-1 ring-emerald-strong/20">
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
                        <span className="rounded-full bg-emerald-soft px-2 py-0.5 text-[9px] font-extrabold text-emerald-strong">
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
                  <div className="animate-fade-in border-t border-line px-3 pb-3 pt-2">
                    <MascotSay
                      id={coach}
                      mood="talk"
                      size={38}
                      label={`${MASCOTS[coach].name} t'explique`}
                      className="mb-2"
                    >
                      {entries.length} mots sur « {unit.title} ». Touche le haut-parleur pour
                      écouter, puis répète chaque mot à voix haute.
                    </MascotSay>
                    <div className="grid gap-0.5">
                      {entries.map((entry) => (
                        <VocabRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-line px-1.5 pt-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        {unit.quiz.length} exercices associés
                      </span>
                      <Link
                        to={`/lesson/${unit.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-strong hover:text-emerald-strong"
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

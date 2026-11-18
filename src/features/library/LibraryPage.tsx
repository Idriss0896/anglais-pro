import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { UnitCard } from "@/components/UnitCard";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
import {
  CURRICULUM,
  LEVELS,
  TOTAL_UNITS,
  getNextUnit,
} from "@/data/curriculum";
import { useProgressStore, completedCount } from "@/store/useProgressStore";
import { cn, percent, plural } from "@/lib/utils";
import type { CategoryKey } from "@/types";

interface LibraryPageProps {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  iconTone?: string;
  fixedCategory?: CategoryKey;
  banner?: ReactNode;
}

/** Index de recherche précalculé : titre, thème, catégorie, niveau et contenu. */
const UNIT_SEARCH_INDEX = new Map(
  CURRICULUM.map((unit) => [
    unit.id,
    [
      unit.title,
      unit.subtitle,
      CATEGORIES[unit.cat].label,
      unit.levelTitle,
      `niveau ${unit.level}`,
      ...unit.theory.flatMap((block) => [
        block.text ?? "",
        block.title ?? "",
        ...(block.items ?? []).flatMap((item) => [item.en, item.fr]),
        ...(block.rows ?? []).flatMap((row) => row),
      ]),
      ...unit.quiz.flatMap((question) => [question.q, question.hint ?? ""]),
    ]
      .join(" ")
      .toLowerCase(),
  ]),
);

export function LibraryPage({
  title,
  eyebrow,
  description,
  icon,
  iconTone = "bg-brand-500",
  fixedCategory,
  banner,
}: LibraryPageProps) {
  const [params, setParams] = useSearchParams();
  const queryParam = params.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const nextUnit = getNextUnit(lessons);

  // Recherche lancée depuis la barre du haut (?q=…).
  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const levelParam = Number(params.get("level"));
  const activeLevel = LEVELS.some((level) => level.num === levelParam) ? levelParam : "all";
  const categoryParam = params.get("cat");
  const activeCategory: CategoryKey | "all" = fixedCategory
    ? fixedCategory
    : CATEGORY_KEYS.includes(categoryParam as CategoryKey)
      ? (categoryParam as CategoryKey)
      : "all";

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const words = needle.split(/\s+/).filter(Boolean);
    return CURRICULUM.filter((unit) => {
      if (activeLevel !== "all" && unit.level !== activeLevel) return false;
      if (activeCategory !== "all" && unit.cat !== activeCategory) return false;
      if (!needle) return true;
      const haystack = UNIT_SEARCH_INDEX.get(unit.id) ?? "";
      return words.every((word) => haystack.includes(word));
    });
  }, [activeCategory, activeLevel, search]);

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<CategoryKey, number>;
    for (const key of CATEGORY_KEYS) counts[key] = 0;
    for (const unit of CURRICULUM) {
      if (activeLevel !== "all" && unit.level !== activeLevel) continue;
      counts[unit.cat] += 1;
    }
    return counts;
  }, [activeLevel]);

  const groups = LEVELS.map((level) => ({
    level,
    units: filtered.filter((unit) => unit.level === level.num),
  })).filter((group) => group.units.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        icon={icon}
        iconTone={iconTone}
      />

      {banner}

      {/* Parcours : quatre étapes colorées, cliquables pour filtrer. */}
      <Reveal>
        <section className="rounded-[28px] bg-surface p-4 ring-1 ring-line sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow text-slate-400">Le parcours</p>
              <h2 className="mt-1 text-[15px] font-extrabold text-ink">
                Quatre niveaux, du premier mot au monde du travail
              </h2>
            </div>
            <button
              type="button"
              onClick={() => updateParam("level", null)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition",
                activeLevel === "all"
                  ? "bg-brand-700 text-white"
                  : "bg-surface-soft text-slate-500 ring-1 ring-line hover:text-ink",
              )}
            >
              Tout le parcours
            </button>
          </div>

          <div className="stagger mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {LEVELS.map((level) => {
              const theme = LEVEL_THEMES[level.num];
              const done = level.units.filter((unit) => lessons[unit.id]?.completed).length;
              const progress = percent(done, level.units.length);
              const active = activeLevel === level.num;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => updateParam("level", active ? null : String(level.num))}
                  aria-pressed={active}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-3.5 text-left ring-1 transition duration-300",
                    active
                      ? cn(theme.surface, "ring-2", theme.ring, "shadow-sm")
                      : cn("bg-surface-soft ring-line hover:-translate-y-0.5", theme.border),
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-1",
                      theme.gradient,
                    )}
                  />
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg transition-transform duration-300 group-hover:-rotate-6",
                        theme.soft,
                      )}
                      aria-hidden="true"
                    >
                      {LEVEL_EMOJIS[level.num]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[9px] font-extrabold uppercase tracking-[0.16em]", theme.text)}>
                        Étape {level.num} · {level.cefr}
                      </p>
                      <p className="truncate text-[13px] font-extrabold text-ink">{level.title}</p>
                    </div>
                    <span className={cn("shrink-0 text-[11px] font-extrabold", theme.text)}>
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={progress}
                    height="h-1.5"
                    className="mt-2.5 bg-surface"
                    barClassName={theme.bar}
                    label={`Progression ${level.title}`}
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>
                      {level.units.length} leçons · {done} terminées
                    </span>
                    <ArrowRight
                      size={13}
                      className={cn(
                        "transition-transform duration-300 group-hover:translate-x-0.5",
                        theme.text,
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* Recherche et filtres de catégorie. */}
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
            placeholder="Rechercher une leçon, un thème…"
            className="h-12 w-full rounded-2xl bg-surface pl-11 pr-11 text-sm font-semibold text-ink ring-1 ring-azure-500/15 transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-azure-500/40"
            aria-label="Rechercher une leçon"
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

        {!fixedCategory && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => updateParam("cat", null)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition",
                activeCategory === "all"
                  ? "bg-brand-600 text-white"
                  : "bg-surface text-slate-500 ring-1 ring-azure-500/15 hover:text-azure-strong",
              )}
            >
              <LayoutGrid size={13} />
              Tout
              <span className="opacity-60">{filtered.length}</span>
            </button>
            {CATEGORY_KEYS.map((key) => {
              const theme = CATEGORIES[key];
              const Icon = theme.icon;
              const active = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateParam("cat", key)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition",
                    active
                      ? "bg-azure-700 text-white"
                      : "bg-surface text-slate-500 ring-1 ring-azure-500/15 hover:text-azure-strong",
                  )}
                >
                  <Icon
                    size={13}
                    className={active ? "text-white" : theme.iconText}
                    strokeWidth={2.4}
                  />
                  {theme.shortLabel}
                  <span className="opacity-60">{categoryCounts[key]}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] font-bold text-slate-400">
            {filtered.length} {plural(filtered.length, "leçon")} trouvée
            {filtered.length > 1 ? "s" : ""}
          </p>
          {activeLevel === "all" && (
            <p className="text-[11px] font-bold text-slate-400">
              {completed}/{TOTAL_UNITS} terminées
            </p>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucune leçon ne correspond"
          description="Essaie un autre mot-clé, un autre niveau ou une autre catégorie."
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setParams(new URLSearchParams(), { replace: true });
              }}
              className="text-xs font-extrabold text-brand-strong hover:text-brand-strong"
            >
              Réinitialiser les filtres
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(({ level, units }, index) => {
            const theme = LEVEL_THEMES[level.num];
            const done = level.units.filter((unit) => lessons[unit.id]?.completed).length;
            const progress = percent(done, level.units.length);
            const exercises = level.units.reduce((sum, unit) => sum + unit.quiz.length, 0);
            return (
              <Reveal key={level.id} delay={index * 70}>
                <section
                  id={level.id}
                  className={cn(
                    "scroll-mt-24 overflow-hidden rounded-[28px] bg-surface ring-1",
                    theme.border,
                  )}
                >
                  <header className={cn("relative overflow-hidden px-4 py-4 sm:px-6 sm:py-5", theme.chip)}>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-3 -top-8 select-none font-display text-[132px] font-extrabold leading-none text-white/10"
                    >
                      {level.num}
                    </span>
                    <div className="relative flex flex-wrap items-center gap-4">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25 sm:h-14 sm:w-14"
                        aria-hidden="true"
                      >
                        {LEVEL_EMOJIS[level.num]}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-white/65">
                          Niveau {level.num} · {level.cefr}
                        </p>
                        <h2 className="mt-0.5 text-[20px] font-extrabold leading-tight text-white sm:text-[23px]">
                          {level.title}
                        </h2>
                        <p className="mt-1 line-clamp-1 text-[11.5px] font-medium text-white/70">
                          {level.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                          <p className="text-[11px] font-extrabold text-white">
                            {units.length} {plural(units.length, "leçon")}
                          </p>
                          <p className="text-[10px] font-bold text-white/60">
                            {exercises} exercices
                          </p>
                        </div>
                        <ProgressRing
                          value={progress}
                          size={54}
                          stroke={6}
                          trackClassName="stroke-white/25"
                          barClassName="stroke-white"
                          label={`Progression ${level.title}`}
                        >
                          <span className="text-[11px] font-extrabold text-white">{progress}%</span>
                        </ProgressRing>
                      </div>
                    </div>

                    {level.outcomes && (
                      <ul className="relative mt-3 hidden flex-wrap gap-x-4 gap-y-1.5 sm:flex">
                        {level.outcomes.map((outcome) => (
                          <li
                            key={outcome}
                            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-white/70"
                          >
                            <CheckCircle2 size={12} className="shrink-0 text-white/80" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    )}
                  </header>

                  <div className={cn("p-3 sm:p-4", theme.surface)}>
                    <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        <Sparkles size={12} className={theme.text} />
                        {done}/{level.units.length} terminées · {progress}%
                      </p>
                      <ProgressBar
                        value={progress}
                        height="h-1.5"
                        className="max-w-[160px] flex-1 bg-surface"
                        barClassName={theme.bar}
                        label={`Progression ${level.title}`}
                      />
                    </div>
                    <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {units.map((unit, unitIndex) => (
                        <UnitCard
                          key={unit.id}
                          unit={unit}
                          progress={lessons[unit.id]}
                          featured={unit.id === nextUnit.id}
                          tinted={unitIndex % 2 === 1}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

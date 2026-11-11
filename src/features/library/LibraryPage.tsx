import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Dumbbell,
  LayoutGrid,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { UnitCard } from "@/components/UnitCard";
import { StatPill } from "@/components/StatPill";
import { EmptyState } from "@/components/EmptyState";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import { LEVEL_EMOJIS, LEVEL_THEMES } from "@/lib/levels";
import {
  CURRICULUM,
  LEVELS,
  TOTAL_QUESTIONS,
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

export function LibraryPage({
  title,
  eyebrow,
  description,
  icon,
  iconTone = "from-brand-500 to-brand-700",
  fixedCategory,
  banner,
}: LibraryPageProps) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const nextUnit = getNextUnit(lessons);

  const levelParam = Number(params.get("level"));
  const activeLevel = [1, 2, 3].includes(levelParam) ? levelParam : "all";
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
    return CURRICULUM.filter((unit) => {
      if (activeLevel !== "all" && unit.level !== activeLevel) return false;
      if (activeCategory !== "all" && unit.cat !== activeCategory) return false;
      if (!needle) return true;
      return `${unit.title} ${unit.subtitle} ${unit.emoji}`.toLowerCase().includes(needle);
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

  const groups =
    activeLevel === "all"
      ? LEVELS.map((level) => ({
          level,
          units: filtered.filter((unit) => unit.level === level.num),
        })).filter((group) => group.units.length > 0)
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        icon={icon}
        iconTone={iconTone}
        actions={
          <>
            <StatPill icon={BookOpen} value={TOTAL_UNITS} label="leçons" tone="neutral" />
            <StatPill icon={Dumbbell} value={TOTAL_QUESTIONS} label="exercices" tone="xp" />
            <StatPill icon={Sparkles} value={completed} label="terminées" tone="mint" />
          </>
        }
      />

      {banner}

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
            className="h-12 w-full rounded-2xl bg-white pl-11 pr-11 text-sm font-semibold text-ink shadow-soft ring-1 ring-slate-900/[0.06] transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-brand-300"
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

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => updateParam("level", null)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
              activeLevel === "all"
                ? "bg-ink text-white shadow-sm"
                : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
            )}
          >
            Tous les niveaux
          </button>
          {LEVELS.map((level) => {
            const theme = LEVEL_THEMES[level.num];
            const active = activeLevel === level.num;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => updateParam("level", String(level.num))}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
                )}
              >
                <span>{LEVEL_EMOJIS[level.num]}</span>
                Niv. {level.num}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px]",
                    active ? "bg-white/15 text-white/70" : cn(theme.soft, theme.text),
                  )}
                >
                  {level.units.length}
                </span>
              </button>
            );
          })}
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
                  : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
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
                      ? "bg-ink text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
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
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700"
            >
              Réinitialiser les filtres
            </button>
          }
        />
      ) : activeLevel === "all" ? (
        <div className="space-y-8">
          {groups.map(({ level, units }) => {
            const theme = LEVEL_THEMES[level.num];
            const done = level.units.filter((unit) => lessons[unit.id]?.completed).length;
            return (
              <section key={level.id} className="animate-fade-up">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-base text-white",
                        theme.gradient,
                      )}
                    >
                      {LEVEL_EMOJIS[level.num]}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[17px] font-extrabold text-ink">{level.title}</h2>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-extrabold ring-1",
                            theme.soft,
                            theme.text,
                            theme.ring,
                          )}
                        >
                          {level.cefr}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">
                        {units.length} leçons affichées
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-[11px] font-extrabold", theme.text)}>
                      {percent(done, level.units.length)}%
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">
                      {done}/{level.units.length}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {units.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      progress={lessons[unit.id]}
                      featured={unit.id === nextUnit.id}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              progress={lessons[unit.id]}
              featured={unit.id === nextUnit.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

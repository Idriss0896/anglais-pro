import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  MessageCircle,
  Search,
  Volume2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Mascot, MascotSay, mascotFor, MASCOTS } from "@/components/Mascot";
import { CATEGORIES } from "@/lib/categories";
import { LEVEL_EMOJIS } from "@/lib/levels";
import { PHRASES } from "@/data/curriculum";
import { useProgressStore } from "@/store/useProgressStore";
import { copyText } from "@/lib/utils";
import { speak } from "@/lib/audio";
import { cn, plural } from "@/lib/utils";
import type { PhraseEntry } from "@/types";

function PhraseCard({
  phrase,
  favorite,
  onToggle,
  tinted = false,
}: {
  phrase: PhraseEntry;
  favorite: boolean;
  onToggle: () => void;
  tinted?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const coach = mascotFor(phrase.unitId);

  const handleCopy = async () => {
    const success = await copyText(`${phrase.en} — ${phrase.fr}`);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article className={cn("card-hover group flex flex-col p-4 sm:p-5", tinted ? "card-blue" : "card")}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-[#1d4ed8] ring-1 ring-[#2563eb]/15">
          <span aria-hidden="true">{phrase.emoji}</span>
          Niveau {phrase.level}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => speak(phrase.en)}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
            aria-label={`Écouter : ${phrase.en}`}
          >
            <Volume2 size={15} strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full transition",
              copied
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-400 hover:bg-[#f2f6ff] hover:text-ink",
            )}
            aria-label={copied ? "Copié" : "Copier l'expression"}
          >
            {copied ? <Check size={15} /> : <Copy size={14.5} />}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full transition",
              favorite
                ? "bg-amber-500 text-white"
                : "text-slate-400 hover:bg-amber-50 hover:text-amber-600",
            )}
            aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {favorite ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>
      </div>

      <p className="mt-3 font-display text-[17px] font-extrabold leading-snug tracking-[-0.015em] text-ink">
        {phrase.en}
      </p>

      <MascotSay
        id={coach}
        label={`${MASCOTS[coach].name} traduit`}
        className="mt-2.5"
        size={40}
        tone="light"
      >
        {phrase.fr}
        {phrase.note && (
          <span className="mt-1 block text-[11px] font-semibold italic leading-4 text-slate-500/90">
            {phrase.note}
          </span>
        )}
      </MascotSay>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <Link
          to={`/lesson/${phrase.unitId}`}
          className="min-w-0 truncate text-[10px] font-bold text-slate-400 transition hover:text-brand-600"
        >
          {phrase.unitTitle}
        </Link>
        <Link
          to={`/lesson/${phrase.unitId}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f2f6ff] text-slate-400 transition group-hover:bg-brand-600 group-hover:text-white"
          aria-label={`Ouvrir la leçon ${phrase.unitTitle}`}
        >
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </article>
  );
}

export function ExpressionsPage() {
  const favorites = useProgressStore((state) => state.favorites);
  const toggleFavorite = useProgressStore((state) => state.toggleFavorite);
  const [params] = useSearchParams();
  const queryParam = params.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  const [level, setLevel] = useState<"all" | 1 | 2 | 3>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visible, setVisible] = useState(24);

  // Une recherche lancée depuis la barre du haut arrive ici via ?q=…
  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setVisible(24);
  }, [search, level, favoritesOnly]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return PHRASES.filter((phrase) => {
      if (level !== "all" && phrase.level !== level) return false;
      if (favoritesOnly && !favorites.includes(phrase.id)) return false;
      if (!needle) return true;
      return `${phrase.en} ${phrase.fr} ${phrase.unitTitle} ${phrase.note ?? ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [favorites, favoritesOnly, level, search]);

  const displayed = filtered.slice(0, visible);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Boîte à expressions"
        title="Les mots pour le dire"
        description="910 phrases, idiomes et formules du quotidien. Écoute, enregistre tes favorites et retrouve-les quand tu en as besoin."
        icon={MessageCircle}
        iconTone="from-[#2563eb] to-[#1e40af]"
      />

      <div className="card-blue-deep animate-fade-up relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
              À retenir
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
              Une expression par jour, un anglais plus naturel.
            </h2>
            <p className="mt-1.5 max-w-lg text-[12.5px] font-medium leading-6 text-white/75">
              Les idiomes ne se traduisent pas mot à mot. Apprends-les en contexte,
              écoute la prononciation et réutilise-les dès que possible.
            </p>
          </div>
          <Mascot
            id="mia"
            mood="talk"
            size={108}
            className="h-[70px] w-[70px] shrink-0 drop-shadow-[0_18px_30px_rgba(120,53,15,0.35)] sm:h-[108px] sm:w-[108px]"
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
            placeholder="Chercher une expression en anglais ou en français…"
            className="h-12 w-full rounded-2xl bg-white pl-11 pr-11 text-sm font-semibold text-ink ring-1 ring-[#2563eb]/15 transition placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-[#2563eb]/40"
            aria-label="Rechercher une expression"
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
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition",
              favoritesOnly
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-900/[0.06] hover:text-ink",
            )}
          >
            {favoritesOnly ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            Favoris
            <span className="opacity-60">{favorites.length}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400">
            {filtered.length} {plural(filtered.length, "expression")} trouvée
            {filtered.length > 1 ? "s" : ""}
          </p>
          {search && (
            <p className="max-w-[50%] truncate text-[10px] font-bold text-slate-400">
              « {search} »
            </p>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={favoritesOnly ? Bookmark : Search}
          title={
            favoritesOnly
              ? "Aucun favori pour l'instant"
              : "Aucune expression ne correspond"
          }
          description={
            favoritesOnly
              ? "Clique sur le marque-page d'une expression pour la retrouver ici."
              : "Essaie un autre mot-clé ou un autre niveau."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLevel("all");
                setFavoritesOnly(false);
              }}
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700"
            >
              Réinitialiser les filtres
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {displayed.map((phrase, index) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase}
                favorite={favorites.includes(phrase.id)}
                onToggle={() => toggleFavorite(phrase.id)}
                tinted={index % 2 === 1}
              />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisible((value) => value + 24)}
                className="rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-brand-600 shadow-soft ring-1 ring-slate-900/[0.06] transition hover:-translate-y-0.5 hover:text-brand-700"
              >
                Afficher plus d'expressions ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

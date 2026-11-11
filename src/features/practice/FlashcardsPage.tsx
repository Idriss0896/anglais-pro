import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Eye,
  Layers,
  Quote,
  RefreshCw,
  Target,
  Volume2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatPill } from "@/components/StatPill";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing";
import { fireConfetti } from "@/components/Confetti";
import { PHRASES, TOTAL_PHRASES } from "@/data/curriculum";
import { CATEGORIES } from "@/lib/categories";
import { useProgressStore } from "@/store/useProgressStore";
import { shuffle } from "@/lib/utils";
import { speak } from "@/lib/audio";
import { cn, plural } from "@/lib/utils";

const DECK_SIZE = 20;

function newDeck() {
  return shuffle(PHRASES).slice(0, DECK_SIZE);
}

export function FlashcardsPage() {
  const [deck, setDeck] = useState(() => newDeck());
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [finished, setFinished] = useState(false);
  const favorites = useProgressStore((state) => state.favorites);
  const toggleFavorite = useProgressStore((state) => state.toggleFavorite);

  const current = deck[index];
  const theme = current ? CATEGORIES[current.category] : CATEGORIES.expressions;
  const favorite = current ? favorites.includes(current.id) : false;

  const restart = () => {
    setDeck(newDeck());
    setIndex(0);
    setRevealed(false);
    setKnown(0);
    setReview(0);
    setFinished(false);
  };

  const answer = (ok: boolean) => {
    const nextKnown = known + (ok ? 1 : 0);
    const nextReview = review + (ok ? 0 : 1);
    if (index + 1 >= deck.length) {
      setKnown(nextKnown);
      setReview(nextReview);
      setFinished(true);
      if (nextKnown / deck.length >= 0.7) fireConfetti();
      return;
    }
    setKnown(nextKnown);
    setReview(nextReview);
    setIndex((value) => value + 1);
    setRevealed(false);
  };

  if (!current) {
    return (
      <div className="card p-8 text-center">
        <p className="text-4xl">🃏</p>
        <h1 className="mt-3 text-xl font-extrabold text-ink">Aucune carte disponible</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les expressions n'ont pas pu être chargées.
        </p>
      </div>
    );
  }

  const knownPercent = Math.round((known / deck.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Révision active"
        title="Cartes mémoire"
        description="Retourne la carte, devine la traduction et garde en mémoire les expressions qui te serviront vraiment."
        icon={Layers}
        iconTone="from-cyan-500 to-sky-600"
        actions={
          <>
            <StatPill icon={Layers} value={DECK_SIZE} label="cartes" tone="sky" />
            <StatPill icon={Quote} value={TOTAL_PHRASES} label="expressions" tone="flame" />
            <StatPill icon={Target} value={`${knownPercent}%`} label="maîtrisées" tone="mint" />
          </>
        }
      />

      <div className="animate-fade-up grid gap-4 lg:grid-cols-[1.5fr_.8fr] lg:items-start">
        <div>
          {finished ? (
            <div className="card relative overflow-hidden p-6 text-center sm:p-9">
              <div className="pointer-events-none absolute inset-0 pattern-dots opacity-[0.05]" />
              <div className="relative">
                <div className="animate-pop mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-gradient-to-br from-cyan-400 to-sky-500 text-4xl shadow-xl shadow-cyan-200">
                  {knownPercent >= 80 ? "🏆" : knownPercent >= 50 ? "👏" : "💪"}
                </div>
                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-600">
                  Série terminée
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
                  {knownPercent >= 80
                    ? "Excellente mémoire !"
                    : knownPercent >= 50
                      ? "Bien joué !"
                      : "Continue, ça rentre !"}
                </h1>
                <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2.5">
                  <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                    <Check size={16} className="mx-auto text-emerald-500" />
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">{known}</p>
                    <p className="text-[9px] font-extrabold uppercase text-emerald-600/60">
                      Connues
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <RefreshCw size={16} className="mx-auto text-amber-500" />
                    <p className="mt-1 text-lg font-extrabold text-amber-700">{review}</p>
                    <p className="text-[9px] font-extrabold uppercase text-amber-600/60">
                      À revoir
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
                    <Target size={16} className="mx-auto text-sky-500" />
                    <p className="mt-1 text-lg font-extrabold text-sky-700">{knownPercent}%</p>
                    <p className="text-[9px] font-extrabold uppercase text-sky-600/60">
                      Réussite
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={restart} icon={RefreshCw} size="lg">
                    Nouvelle série
                  </Button>
                  <Link
                    to="/practice"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-[15px] font-extrabold text-ink ring-1 ring-slate-900/10 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={18} />
                    Retour à l'entraînement
                  </Link>
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-400">
                  {deck.length} {plural(deck.length, "carte")} · {TOTAL_PHRASES} expressions
                  disponibles
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400">
                  Carte <span className="text-ink">{index + 1}</span> sur {deck.length}
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                    <Check size={11} strokeWidth={3} />
                    {known}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600">
                    <RefreshCw size={11} />
                    {review}
                  </span>
                </div>
              </div>
              <ProgressBar
                value={(index / deck.length) * 100}
                height="h-1.5"
                barClassName="bg-gradient-to-r from-cyan-400 to-sky-500"
                label="Progression des cartes"
              />

              <div
                className={cn(
                  "relative mt-4 overflow-hidden rounded-[30px] bg-gradient-to-br p-5 text-white shadow-[0_28px_60px_-30px_rgba(23,22,43,.8)] sm:p-7",
                  theme.gradient,
                )}
              >
                <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-white/85 ring-1 ring-white/15">
                      <span>{current.emoji}</span>
                      {theme.shortLabel} · Niv. {current.level}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speak(current.en)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
                        aria-label="Écouter l'expression"
                      >
                        <Volume2 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(current.id)}
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-full ring-1 transition",
                          favorite
                            ? "bg-amber-400 text-amber-950 ring-amber-300"
                            : "bg-white/10 text-white/80 ring-white/15 hover:bg-white/20",
                        )}
                        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        {favorite ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[220px] flex-col items-center justify-center py-8 text-center sm:min-h-[260px]">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/50">
                      Comment dit-on…
                    </p>
                    <p className="mt-3 max-w-xl font-display text-2xl font-extrabold leading-snug tracking-[-0.02em] sm:text-[34px]">
                      “{current.en}”
                    </p>
                    {revealed && (
                      <div className="animate-fade-up mt-6 w-full max-w-md border-t border-white/20 pt-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/45">
                          Traduction
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-white/95 sm:text-xl">
                          {current.fr}
                        </p>
                        {current.note && (
                          <p className="mt-2 text-[11px] font-medium text-white/60">
                            {current.note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    {!revealed ? (
                      <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-extrabold text-ink transition hover:-translate-y-0.5"
                      >
                        <Eye size={17} />
                        Afficher la traduction
                      </button>
                    ) : (
                      <div className="grid w-full max-w-md grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => answer(false)}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                        >
                          <RefreshCw size={16} />
                          À revoir
                        </button>
                        <button
                          type="button"
                          onClick={() => answer(true)}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-ink transition hover:-translate-y-0.5"
                        >
                          <Check size={16} strokeWidth={3} />
                          Je savais
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-center text-[10px] font-bold text-white/45">
                    {current.unitTitle} · Niveau {current.level}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Link
                  to="/practice"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 hover:text-brand-600"
                >
                  <ArrowLeft size={13} />
                  Quitter les cartes
                </Link>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 hover:text-brand-600"
                >
                  <RefreshCw size={13} />
                  Mélanger
                </button>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="card p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                <Target size={17} />
              </span>
              <div>
                <p className="eyebrow">Session</p>
                <h2 className="text-[15px] font-extrabold text-ink">Ta progression</h2>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <ProgressRing
                value={knownPercent}
                size={122}
                stroke={10}
                trackClassName="stroke-slate-100"
                barClassName="stroke-cyan-500"
                label="Cartes maîtrisées"
              >
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-ink">{knownPercent}%</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                    maîtrisées
                  </p>
                </div>
              </ProgressRing>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center ring-1 ring-emerald-100">
                <p className="text-base font-extrabold text-emerald-700">{known}</p>
                <p className="text-[9px] font-extrabold uppercase text-emerald-600/60">Connues</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-center ring-1 ring-amber-100">
                <p className="text-base font-extrabold text-amber-700">{review}</p>
                <p className="text-[9px] font-extrabold uppercase text-amber-600/60">À revoir</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] bg-slate-900 p-5 text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/40">
              Méthode
            </p>
            <h3 className="mt-1 text-[15px] font-extrabold">Répète à voix haute</h3>
            <p className="mt-1.5 text-[11px] font-medium leading-5 text-white/55">
              Lis l'expression, écoute la prononciation, puis dis-la à voix haute avant
              de retourner la carte. La mémoire auditive fait la différence.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
              <Volume2 size={12} />
              Audio disponible sur chaque carte
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

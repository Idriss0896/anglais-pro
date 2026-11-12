import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Camera,
  Check,
  Cloud,
  CloudOff,
  Flame,
  Gem,
  Heart,
  ImagePlus,
  LoaderCircle,
  LogIn,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { UserAvatar } from "@/components/UserAvatar";
import { fileToAvatar } from "@/lib/avatar";
import { ApiError } from "@/lib/api";
import { TOTAL_UNITS } from "@/data/curriculum";
import { getRank } from "@/lib/achievements";
import {
  accuracyAverage,
  completedCount,
  useProgressStore,
} from "@/store/useProgressStore";
import { cn } from "@/lib/utils";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Gem;
  value: string | number;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-900/[0.06]">
      <span className={cn("grid h-9 w-9 place-items-center rounded-xl ring-1", tone)}>
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <p className="mt-2.5 text-xl font-extrabold tabular-nums text-ink">{value}</p>
      <p className="text-[10.5px] font-bold text-slate-400">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const { user, loading, apiReady, updateProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const welcome = searchParams.get("welcome");

  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const hearts = useProgressStore((state) => state.hearts);
  const lessons = useProgressStore((state) => state.lessons);
  const completed = completedCount(lessons);
  const accuracy = accuracyAverage(lessons);
  const overall = Math.round((completed / TOTAL_UNITS) * 100);
  const rank = getRank(xp);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoaderCircle size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Mon espace"
          title="Ton profil t'attend"
          description="Tu peux continuer à apprendre sans compte. Crée-le quand tu veux pour retrouver ta progression partout."
          icon={UserRound}
          iconTone="from-brand-500 to-brand-700"
        />

        <div className="animate-fade-up grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#6d28d9] p-6 text-white shadow-[0_30px_64px_-30px_rgba(23,22,43,0.8)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-100 ring-1 ring-white/15">
                <ShieldCheck size={12} className="text-emerald-300" />
                Compte gratuit
              </span>
              <h2 className="mt-4 max-w-md text-[27px] font-extrabold leading-[1.15] tracking-[-0.02em]">
                {xp === 0 && streak === 0
                  ? "Commence maintenant, crée ton compte quand tu veux."
                  : `Sauvegarde tes ${xp} XP et ta série de ${streak} jour${streak > 1 ? "s" : ""}.`}
              </h2>
              <p className="mt-2.5 max-w-md text-[13px] font-medium leading-6 text-indigo-100/75">
                Ta progression actuelle sera automatiquement rattachée à ton compte. Aucune
                leçon ne sera perdue.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/auth?mode=signup"
                  className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[13.5px] font-extrabold text-brand-800 shadow-[0_16px_32px_-18px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5"
                >
                  <UserRound size={17} />
                  Créer mon compte
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-[13.5px] font-extrabold text-white ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <LogIn size={17} />
                  J'ai déjà un compte
                </Link>
              </div>
              {!apiReady && (
                <p className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-amber-200">
                  <CloudOff size={13} />
                  Les comptes sont momentanément indisponibles sur cette adresse.
                </p>
              )}
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Ce que tu gardes</p>
            <h2 className="mt-1 text-[17px] font-extrabold text-ink">Ta progression actuelle</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <StatCard
                icon={Gem}
                value={xp}
                label="XP gagnés"
                tone="bg-violet-50 text-violet-600 ring-violet-100"
              />
              <StatCard
                icon={Flame}
                value={`${streak} j`}
                label="Série en cours"
                tone="bg-amber-50 text-amber-600 ring-amber-100"
              />
              <StatCard
                icon={Heart}
                value={hearts}
                label="Cœurs"
                tone="bg-rose-50 text-rose-500 ring-rose-100"
              />
              <StatCard
                icon={BarChart3}
                value={completed}
                label="Leçons terminées"
                tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
              />
            </div>
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-[11px] font-medium leading-5 text-slate-500">
              En invité, tout est enregistré dans ce navigateur. Avec un compte, ces données
              te suivent sur mobile et ordinateur.
            </p>
          </section>
        </div>
      </div>
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    setUploading(true);
    try {
      const avatar = await fileToAvatar(file);
      await updateProfile({ avatar });
      setMessage("Ta photo a été mise à jour.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible d'envoyer cette photo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveName() {
    setError(null);
    setMessage(null);
    setSavingName(true);
    try {
      await updateProfile({ name: name.trim() || null });
      setMessage("Ton prénom a été enregistré.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Impossible d'enregistrer le prénom.");
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="space-y-5">
      {welcome && (
        <div className="animate-fade-up flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-[12px] font-bold text-emerald-800 ring-1 ring-emerald-200">
          <Check size={16} className="shrink-0 text-emerald-600" />
          {welcome === "google"
            ? "Connexion Google réussie. Ta progression est synchronisée."
            : "Bienvenue ! Ton compte est créé et ta progression a été sauvegardée."}
        </div>
      )}

      <PageHeader
        eyebrow="Mon espace"
        title={user.name ? `Bonjour ${user.name}` : "Mon profil"}
        description="Ta photo, tes informations et la progression liée à ton compte."
        icon={UserRound}
        iconTone="from-brand-500 to-brand-700"
      />

      <section className="animate-fade-up relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#16143c] via-[#312e81] to-[#5b21b6] text-white shadow-[0_34px_70px_-32px_rgba(23,22,43,0.9)]">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative">
              <UserAvatar
                user={user}
                size={92}
                onDark
                className="shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] ring-4 ring-white/20"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Changer ma photo"
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-lg ring-2 ring-white transition hover:-translate-y-0.5 hover:bg-brand-50 disabled:opacity-60"
                disabled={uploading}
              >
                {uploading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-200/60">
                {rank.label}
              </p>
              <h2 className="truncate text-[24px] font-extrabold tracking-[-0.02em]">
                {user.name || user.email.split("@")[0]}
              </h2>
              <p className="mt-0.5 truncate text-[12px] font-semibold text-indigo-100/65">
                {user.email}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-indigo-100 ring-1 ring-white/15">
                  <ShieldCheck size={11} className="text-emerald-300" />
                  {user.provider === "google" ? "Google" : "Email"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-indigo-100 ring-1 ring-white/15">
                  <Cloud size={11} className="text-sky-300" />
                  Synchronisé
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-sm">
            <ProgressRing
              value={overall}
              size={64}
              stroke={7}
              trackClassName="stroke-white/15"
              barClassName="stroke-emerald-300"
              label="Progression globale"
            >
              <span className="text-[13px] font-extrabold">{overall}%</span>
            </ProgressRing>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-200/60">
                Parcours terminé
              </p>
              <p className="text-lg font-extrabold">
                {completed}
                <span className="text-[12px] font-bold text-indigo-100/50"> / {TOTAL_UNITS} leçons</span>
              </p>
              <p className="text-[11px] font-semibold text-indigo-100/60">{xp} XP au total</p>
            </div>
          </div>
        </div>
      </section>

      {(message || error) && (
        <div
          className={cn(
            "animate-fade-up flex items-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-bold ring-1",
            error
              ? "bg-rose-50 text-rose-700 ring-rose-200"
              : "bg-emerald-50 text-emerald-800 ring-emerald-200",
          )}
        >
          {error ? <CloudOff size={16} /> : <Check size={16} />}
          {error ?? message}
        </div>
      )}

      <div className="animate-fade-up grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <UserRound size={17} />
            </span>
            <div>
              <p className="eyebrow">Informations</p>
              <h2 className="text-[16px] font-extrabold text-ink">Mon compte</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                Prénom affiché
              </span>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={60}
                  placeholder="Ton prénom"
                  className="h-11 min-w-0 flex-1 rounded-2xl bg-slate-50 px-3.5 text-[13px] font-semibold text-ink outline-none ring-1 ring-slate-200 transition focus:bg-white focus:ring-2 focus:ring-brand-400"
                />
                <button
                  type="button"
                  onClick={saveName}
                  disabled={savingName || name.trim() === (user.name ?? "")}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-brand-600 px-4 text-[12px] font-extrabold text-white transition hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  {savingName ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Enregistrer
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                Adresse email
              </span>
              <div className="flex h-11 items-center gap-2 rounded-2xl bg-slate-100 px-3.5 text-[13px] font-semibold text-slate-500">
                <Mail size={16} className="shrink-0 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
            </label>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-400" />
                <span className="text-[11.5px] font-bold text-slate-500">Membre depuis</span>
              </div>
              <span className="text-[11.5px] font-extrabold text-ink">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-[12px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-ink disabled:opacity-60"
            >
              {uploading ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <ImagePlus size={15} />
              )}
              Changer ma photo (JPG ou PNG)
            </button>
            <p className="text-center text-[10px] font-medium text-slate-400">
              La photo est recadrée et compressée sur ton appareil avant l'envoi.
            </p>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <BarChart3 size={17} />
            </span>
            <div>
              <p className="eyebrow">Mes statistiques</p>
              <h2 className="text-[16px] font-extrabold text-ink">Ma progression</h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <StatCard
              icon={Gem}
              value={xp}
              label="XP gagnés"
              tone="bg-violet-50 text-violet-600 ring-violet-100"
            />
            <StatCard
              icon={Flame}
              value={`${streak} j`}
              label="Série en cours"
              tone="bg-amber-50 text-amber-600 ring-amber-100"
            />
            <StatCard
              icon={Check}
              value={completed}
              label="Leçons terminées"
              tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
            />
            <StatCard
              icon={BarChart3}
              value={`${accuracy}%`}
              label="Précision"
              tone="bg-sky-50 text-sky-600 ring-sky-100"
            />
          </div>

          <div className="mt-4 space-y-2">
            <Link
              to="/learn"
              className="btn-shine flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-[12.5px] font-extrabold text-white shadow-[0_14px_30px_-16px_rgba(90,69,232,0.95)] transition hover:-translate-y-0.5"
            >
              Continuer mon parcours
            </Link>
            <Link
              to="/progress"
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-50 text-[12.5px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-ink"
            >
              Voir mes statistiques
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-[12.5px] font-extrabold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

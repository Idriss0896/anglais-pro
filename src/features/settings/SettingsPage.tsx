import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AudioLines,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  LockKeyhole,
  Mail,
  Moon,
  MonitorCog,
  Palette,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Target,
  UserRound,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "@/lib/icons";
import { useAuth } from "@/auth/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { Toggle } from "@/components/Toggle";
import { Button } from "@/components/Button";
import { UserAvatar } from "@/components/UserAvatar";
import { ProgressBar } from "@/components/ProgressBar";
import { useSettingsStore, type ThemePreference } from "@/store/useSettingsStore";
import { todayXp, useProgressStore } from "@/store/useProgressStore";
import { speak } from "@/lib/audio";
import { getRank } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const THEMES: {
  value: ThemePreference;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "Clair", hint: "Fond lumineux", icon: Palette },
  { value: "dark", label: "Sombre", hint: "Repos des yeux", icon: Moon },
  { value: "system", label: "Système", hint: "Suit l'appareil", icon: MonitorCog },
];

const GOALS = [20, 30, 50, 100];

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card card-hover overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-strong transition-transform duration-300 hover:rotate-6 hover:scale-105">
          <Icon size={21} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[11.5px] font-medium leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone)}>
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-extrabold text-ink">{title}</p>
          <p className="text-[10.5px] font-medium leading-4 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user, apiReady, logout, updateAccount } = useAuth();
  const theme = useSettingsStore((state) => state.theme);
  const audio = useSettingsStore((state) => state.audio);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setAudio = useSettingsStore((state) => state.setAudio);

  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const activity = useProgressStore((state) => state.activity);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const setDailyGoal = useProgressStore((state) => state.setDailyGoal);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  const [resetOpen, setResetOpen] = useState(false);
  const [tested, setTested] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountPending, setAccountPending] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);

  const rank = getRank(xp);
  const goalXp = todayXp(activity);
  const goalPercent = Math.min(100, Math.round((goalXp / Math.max(1, dailyGoal)) * 100));

  const testVoice = () => {
    const ok = speak("Hello! Welcome to English Pro. Let's practise speaking together.");
    setTested(ok);
  };

  async function saveAccount() {
    setAccountMessage(null);
    setAccountError(null);
    if (!currentPassword) {
      setAccountError("Saisis ton mot de passe actuel pour confirmer.");
      return;
    }
    setAccountPending(true);
    try {
      await updateAccount({
        currentPassword,
        email: email.trim(),
        newPassword: newPassword || undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setAccountMessage("Tes informations de connexion ont été mises à jour.");
    } catch (caught) {
      setAccountError(caught instanceof Error ? caught.message : "Impossible d'enregistrer ces changements.");
    } finally {
      setAccountPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Préférences"
        title="Réglages"
        description="Tout ce qui concerne l'affichage, le son et ta progression, réuni au même endroit."
        icon={SlidersHorizontal}
        iconTone="bg-[#6d28d9]"
      />

      <Section
        icon={Palette}
        title="Apparence"
        description="Choisis le thème qui te convient le mieux."
      >
        <div className="px-5 py-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                    active
                      ? "bg-brand-soft ring-2 ring-[#6d28d9]"
                      : "bg-surface-soft ring-1 ring-line hover:bg-surface-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      active ? "bg-[#6d28d9] text-white" : "bg-surface text-slate-500 ring-1 ring-line",
                    )}
                  >
                    <option.icon size={19} strokeWidth={active ? 2.6 : 2.1} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-extrabold text-ink">
                      {option.label}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      {option.hint}
                    </span>
                  </span>
                  {active && (
                    <Check size={18} strokeWidth={3} className="ml-auto shrink-0 text-brand-strong" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </Section>

      <Section
        icon={Volume2}
        title="Audio"
        description="Une voix anglaise lit chaque mot et chaque expression."
      >
        <Row
          icon={audio ? Volume2 : VolumeX}
          tone={audio ? "bg-emerald-soft text-emerald-strong" : "bg-surface-muted text-slate-500"}
          title="Prononciation vocale"
          description={
            audio
              ? "Activée — la voix lit les mots anglais."
              : "Désactivée — les mots ne sont plus lus."
          }
        >
          <span
            className={cn(
              "hidden text-[10px] font-extrabold uppercase tracking-[0.1em] sm:block",
              audio ? "text-emerald-strong" : "text-slate-500",
            )}
          >
            {audio ? "Activée" : "Désactivée"}
          </span>
          <Toggle checked={audio} onChange={setAudio} label="Activer la prononciation vocale" />
        </Row>

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-azure-soft text-azure-strong">
              <AudioLines size={18} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[12.5px] font-extrabold text-ink">Tester la voix</p>
              <p className="text-[10.5px] font-medium text-slate-500">
                {audio
                  ? "Écoute un court exemple en anglais."
                  : "Active d'abord la prononciation vocale."}
              </p>
            </div>
          </div>
          <Button variant="soft" size="sm" onClick={testVoice} disabled={!audio}>
            <Play size={18} strokeWidth={2.4} />
            {tested ? "Réécouter" : "Écouter"}
          </Button>
        </div>
      </Section>

      <Section
        icon={Target}
        title="Apprentissage"
        description="Fixe le rythme que tu veux tenir chaque jour."
      >
        <div className="px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12.5px] font-extrabold text-ink">Objectif quotidien</p>
              <p className="text-[10.5px] font-medium text-slate-500">
                {goalXp} XP aujourd'hui · {dailyGoal} XP visés
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  aria-pressed={dailyGoal === goal}
                  className={cn(
                    "h-9 rounded-full px-3.5 text-[11px] font-extrabold transition-colors",
                    dailyGoal === goal
                      ? "bg-[#6d28d9] text-white"
                      : "bg-surface-soft text-slate-500 ring-1 ring-line hover:text-ink",
                  )}
                >
                  {goal} XP
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>Aujourd'hui</span>
              <span>{goalPercent}%</span>
            </div>
            <ProgressBar
              value={goalPercent}
              height="h-2"
              barClassName="bg-emerald-500"
              label="Objectif quotidien"
            />
          </div>
        </div>

        <Row
          icon={Flame}
          tone="bg-amber-soft text-amber-strong"
          title="Série de jours"
          description={`${streak} jour${streak > 1 ? "s" : ""} d'affilée · niveau ${rank.label}`}
        >
          <Link
            to="/progress"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-soft px-3.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-line transition-colors hover:text-ink"
          >
            Voir ma progression
            <ChevronRight size={16} />
          </Link>
        </Row>
      </Section>

      <Section
        icon={UserRound}
        title="Compte"
        description="Tes informations et l'accès à ton profil."
      >
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar user={user} size={44} />
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-extrabold text-ink">
                {user ? user.name || user.email.split("@")[0] : "Mode invité"}
              </p>
              <p className="truncate text-[10.5px] font-semibold text-slate-500">
                {user ? user.email : apiReady ? "Aucun compte connecté" : "Comptes indisponibles"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-soft px-3.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-line transition-colors hover:text-ink"
            >
              <UserRound size={16} />
              Mon profil
            </Link>
            {user && (
              <Button variant="secondary" size="sm" onClick={() => void logout()}>
                Se déconnecter
              </Button>
            )}
          </div>
        </div>
      </Section>

      <Section
        icon={LockKeyhole}
        title="Connexion et sécurité"
        description="Modifie l'adresse email et le mot de passe de ton compte."
      >
        {!user ? (
          <div className="px-5 py-5 text-[12px] font-semibold text-slate-500">
            Connecte-toi pour modifier tes informations de connexion.
          </div>
        ) : user.provider === "google" ? (
          <div className="flex items-start gap-3 px-5 py-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-strong">
              <KeyRound size={19} />
            </span>
            <p className="text-[12px] font-semibold leading-5 text-slate-500">
              Ce compte utilise Google. La connexion et le mot de passe se gèrent depuis ton compte Google.
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-5 py-5">
            {(accountMessage || accountError) && (
              <div className={cn(
                "flex items-center gap-2 rounded-2xl px-3.5 py-3 text-[11.5px] font-bold ring-1",
                accountError
                  ? "bg-rose-soft text-rose-strong ring-rose-strong/20"
                  : "bg-emerald-soft text-emerald-strong ring-emerald-strong/20",
              )}>
                {accountError ? <KeyRound size={15} /> : <Check size={15} strokeWidth={3} />}
                {accountError ?? accountMessage}
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Adresse email</span>
              <span className="relative flex items-center">
                <Mail size={16} className="pointer-events-none absolute left-3.5 text-slate-400" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="h-11 w-full rounded-2xl bg-surface-soft pl-10 pr-3.5 text-[13px] font-semibold text-ink outline-none ring-1 ring-line transition focus:bg-surface focus:ring-2 focus:ring-brand-400" />
              </span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Mot de passe actuel</span>
                <span className="relative flex items-center">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 text-slate-400" />
                  <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type={showCurrentPassword ? "text" : "password"} autoComplete="current-password" className="h-11 w-full rounded-2xl bg-surface-soft px-10 text-[13px] font-semibold text-ink outline-none ring-1 ring-line transition focus:bg-surface focus:ring-2 focus:ring-brand-400" />
                  <button type="button" onClick={() => setShowCurrentPassword((value) => !value)} aria-label={showCurrentPassword ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"} className="absolute right-2 grid h-8 w-8 place-items-center rounded-xl text-slate-400 transition hover:bg-surface hover:text-ink">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Nouveau mot de passe</span>
                <span className="relative flex items-center">
                  <KeyRound size={16} className="pointer-events-none absolute left-3.5 text-slate-400" />
                  <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type={showNewPassword ? "text" : "password"} autoComplete="new-password" placeholder="Laisser vide pour garder l'actuel" className="h-11 w-full rounded-2xl bg-surface-soft px-10 text-[13px] font-semibold text-ink outline-none ring-1 ring-line transition focus:bg-surface focus:ring-2 focus:ring-brand-400" />
                  <button type="button" onClick={() => setShowNewPassword((value) => !value)} aria-label={showNewPassword ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"} className="absolute right-2 grid h-8 w-8 place-items-center rounded-xl text-slate-400 transition hover:bg-surface hover:text-ink">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10.5px] font-medium text-slate-400">Le nouveau mot de passe doit contenir 8 caractères, une lettre et un chiffre.</p>
              <Button variant="primary" size="sm" onClick={() => void saveAccount()} disabled={accountPending}>
                {accountPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
      </Section>

      <Section
        icon={RotateCcw}
        title="Données"
        description="La progression est enregistrée sur cet appareil."
      >
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-soft text-rose-strong">
              <RotateCcw size={17} />
            </span>
            <div>
              <p className="text-[12.5px] font-extrabold text-ink">Réinitialiser la progression</p>
              <p className="text-[10.5px] font-medium text-slate-500">
                Efface XP, leçons, favoris et succès. Tes réglages restent intacts.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setResetOpen(true)} icon={RotateCcw}>
            Réinitialiser
          </Button>
        </div>
      </Section>

      <p className="text-center text-[10px] font-bold text-slate-400">
        ANGLO CLUB · réglages enregistrés sur cet appareil
      </p>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Réinitialiser la progression ?"
        description="Toute ta progression sera effacée : XP, leçons terminées, favoris et succès. Tes réglages resteront intacts."
        icon={RotateCcw}
        iconTone="bg-rose-soft text-rose-strong"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="danger"
              full
              onClick={() => {
                resetProgress();
                setResetOpen(false);
              }}
              icon={RotateCcw}
            >
              Oui, tout effacer
            </Button>
            <Button variant="secondary" full onClick={() => setResetOpen(false)}>
              Annuler
            </Button>
          </div>
        }
      />
    </div>
  );
}

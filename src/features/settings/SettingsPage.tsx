import { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { MaterialIcon } from "@/components/MaterialIcon";
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
  icon: string;
}[] = [
  { value: "light", label: "Clair", hint: "Fond lumineux", icon: "light_mode" },
  { value: "dark", label: "Sombre", hint: "Repos des yeux", icon: "dark_mode" },
  { value: "system", label: "Système", hint: "Suit l'appareil", icon: "brightness_auto" },
];

const GOALS = [20, 30, 50, 100];

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
          <MaterialIcon name={icon} size={21} />
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
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: string;
  tone: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone)}>
          <MaterialIcon name={icon} size={18} />
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
  const { user, apiReady, logout } = useAuth();
  const theme = useSettingsStore((state) => state.theme);
  const audio = useSettingsStore((state) => state.audio);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setAudio = useSettingsStore((state) => state.setAudio);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);

  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const activity = useProgressStore((state) => state.activity);
  const dailyGoal = useProgressStore((state) => state.dailyGoal);
  const setDailyGoal = useProgressStore((state) => state.setDailyGoal);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  const [resetOpen, setResetOpen] = useState(false);
  const [tested, setTested] = useState(false);

  const rank = getRank(xp);
  const goalXp = todayXp(activity);
  const goalPercent = Math.min(100, Math.round((goalXp / Math.max(1, dailyGoal)) * 100));

  const testVoice = () => {
    const ok = speak("Hello! Welcome to English Pro. Let's practise speaking together.");
    setTested(ok);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Préférences"
        title="Réglages"
        description="Tout ce qui concerne l'affichage, le son et ta progression, réuni au même endroit."
        icon={SlidersHorizontal}
        iconTone="bg-[#4c1d95]"
      />

      <Section
        icon="palette"
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
                      ? "bg-brand-soft ring-2 ring-[#4c1d95]"
                      : "bg-surface-soft ring-1 ring-line hover:bg-surface-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      active ? "bg-[#4c1d95] text-white" : "bg-surface text-slate-500 ring-1 ring-line",
                    )}
                  >
                    <MaterialIcon name={option.icon} size={19} filled={active} />
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
                    <MaterialIcon
                      name="check"
                      size={18}
                      className="ml-auto shrink-0 text-brand-strong"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Row
          icon="animation"
          tone="bg-violet-soft text-violet-strong"
          title="Réduire les animations"
          description="Supprime les mouvements et les transitions."
        >
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:block">
            {reducedMotion ? "Activé" : "Désactivé"}
          </span>
          <Toggle
            checked={reducedMotion}
            onChange={setReducedMotion}
            label="Réduire les animations"
          />
        </Row>
      </Section>

      <Section
        icon="volume_up"
        title="Audio"
        description="Une voix anglaise lit chaque mot et chaque expression."
      >
        <Row
          icon={audio ? "volume_up" : "volume_off"}
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
              <MaterialIcon name="graphic_eq" size={18} />
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
            <MaterialIcon name="play_arrow" size={18} />
            {tested ? "Réécouter" : "Écouter"}
          </Button>
        </div>
      </Section>

      <Section
        icon="track_changes"
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
                      ? "bg-[#4c1d95] text-white"
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
          icon="local_fire_department"
          tone="bg-amber-soft text-amber-strong"
          title="Série de jours"
          description={`${streak} jour${streak > 1 ? "s" : ""} d'affilée · niveau ${rank.label}`}
        >
          <Link
            to="/progress"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-soft px-3.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-line transition-colors hover:text-ink"
          >
            Voir ma progression
            <MaterialIcon name="chevron_right" size={16} />
          </Link>
        </Row>
      </Section>

      <Section
        icon="person"
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
              <MaterialIcon name="person" size={16} />
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
        icon="restart_alt"
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

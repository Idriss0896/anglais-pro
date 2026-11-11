import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Logo } from "@/components/Logo";
import { ApiError, googleStartUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

const googleErrors: Record<string, string> = {
  google_unavailable:
    "La connexion Google n'est pas encore configurée. Utilise ton email en attendant.",
  google_state: "La session Google a expiré. Réessaie.",
  google_token: "Google n'a pas pu valider la connexion. Réessaie.",
  google_profile: "Impossible de lire ton profil Google. Réessaie.",
  google_email: "Ton adresse Google n'est pas vérifiée.",
  google_failed: "La connexion Google a échoué. Réessaie ou utilise ton email.",
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className="relative flex items-center">
        <Icon size={17} className="pointer-events-none absolute left-3.5 text-slate-400" />
        {children}
      </span>
    </label>
  );
}

export function AuthPage() {
  const { user, apiReady, googleEnabled, login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthError = searchParams.get("error");
  const message = useMemo(() => {
    if (error) return error;
    if (oauthError) return googleErrors[oauthError] ?? "La connexion a échoué.";
    return null;
  }, [error, oauthError]);

  useEffect(() => {
    if (user && !pending) {
      navigate("/profile?welcome=1", { replace: true });
    }
  }, [user, pending, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSearchParams(next === "signup" ? { mode: "signup" } : {}, { replace: true });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!apiReady) {
      setError("Le service de compte n'est pas disponible sur cette adresse.");
      return;
    }
    if (!email.includes("@")) {
      setError("Saisis une adresse email valide.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/profile?welcome=1", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Une erreur est survenue. Réessaie dans un instant.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0e0c28] px-4 py-6 text-white sm:px-6 lg:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-brand-500/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-sky-400/25 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[11.5px] font-extrabold text-indigo-100 ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft size={14} />
          Continuer à apprendre sans compte
        </Link>

        <div className="grid overflow-hidden rounded-[34px] bg-white shadow-[0_50px_120px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/15 lg:grid-cols-[1.02fr_1fr]">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#6d28d9] p-8 text-white lg:block lg:p-10">
            <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <Logo onDark />
              <h1 className="mt-10 text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em]">
                Ton anglais avance,
                <br />
                même quand tu changes
                <br />
                d'appareil.
              </h1>
              <p className="mt-4 max-w-sm text-[13.5px] font-medium leading-6 text-indigo-100/75">
                Commence en invité, puis crée ton compte quand tu veux : XP, série,
                cœurs et leçons terminées sont conservés.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Progression synchronisée sur tous tes appareils",
                  "Ta photo et ton prénom sur ton espace",
                  "Connexion par email ou avec Google",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[12.5px] font-bold text-white/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-2 rounded-2xl bg-white/10 p-3 text-[11px] font-bold text-indigo-100/75 ring-1 ring-white/10">
                <ShieldCheck size={16} className="text-emerald-300" />
                Mot de passe chiffré, données hébergées sur Neon.
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-7 lg:p-9">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <Logo />
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                Gratuit
              </span>
            </div>

            <div className="mt-5 lg:mt-0">
              <p className="eyebrow">Ton espace</p>
              <h2 className="mt-1 text-[25px] font-extrabold tracking-[-0.02em] text-ink">
                {mode === "login" ? "Content de te revoir" : "Crée ton compte"}
              </h2>
              <p className="mt-1.5 text-[12.5px] font-medium leading-5 text-slate-500">
                {mode === "login"
                  ? "Retrouve ta progression, ta série et tes expressions favorites."
                  : "Ta progression actuelle sera automatiquement rattachée à ton compte."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
              {(["login", "signup"] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  className={cn(
                    "h-10 rounded-xl text-[12.5px] font-extrabold transition-all",
                    mode === item
                      ? "bg-white text-ink shadow-[0_8px_18px_-10px_rgba(23,22,43,0.4)]"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  {item === "login" ? "Se connecter" : "S'inscrire"}
                </button>
              ))}
            </div>

            {!apiReady && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-[11.5px] font-semibold leading-5 text-amber-800 ring-1 ring-amber-200">
                <WifiOff size={16} className="mt-0.5 shrink-0" />
                Le service de compte n'est pas joignable depuis cette adresse. Utilise la
                version déployée sur Vercel pour te connecter.
              </div>
            )}

            {message && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-[11.5px] font-semibold leading-5 text-rose-700 ring-1 ring-rose-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {message}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
              {mode === "signup" && (
                <Field icon={UserRound} label="Prénom (optionnel)">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Comment veux-tu être appelé ?"
                    className="h-12 w-full rounded-2xl bg-slate-50 pl-10 pr-3.5 text-[13.5px] font-semibold text-ink outline-none ring-1 ring-slate-200 transition placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-400"
                  />
                </Field>
              )}

              <Field icon={Mail} label="Adresse email">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="toi@exemple.com"
                  className="h-12 w-full rounded-2xl bg-slate-50 pl-10 pr-3.5 text-[13.5px] font-semibold text-ink outline-none ring-1 ring-slate-200 transition placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-400"
                />
              </Field>

              <Field icon={Lock} label="Mot de passe">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
                  className="h-12 w-full rounded-2xl bg-slate-50 pl-10 pr-11 text-[13.5px] font-semibold text-ink outline-none ring-1 ring-slate-200 transition placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-2 grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </Field>

              {mode === "signup" && (
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  En créant un compte, tu acceptes que ta progression soit sauvegardée.
                </p>
              )}

              <button
                type="submit"
                disabled={pending || !apiReady}
                className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-[14px] font-extrabold text-white shadow-[0_18px_36px_-18px_rgba(90,69,232,0.95)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                ou
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {googleEnabled ? (
              <a
                href={googleStartUrl()}
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-white text-[13.5px] font-extrabold text-ink ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:ring-slate-300"
              >
                <GoogleMark />
                Continuer avec Google
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Ajoute GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sur Vercel pour activer Google."
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-50 text-[13.5px] font-extrabold text-slate-400 ring-1 ring-slate-200"
              >
                <GoogleMark />
                Google bientôt disponible
              </button>
            )}

            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-slate-500 transition hover:text-ink"
            >
              Continuer sans compte
              <ArrowLeft size={13} className="rotate-180" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

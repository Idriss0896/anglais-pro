import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CloudUpload, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { completedCount, useProgressStore } from "@/store/useProgressStore";

const DISMISS_KEY = "anglais-pro:guest-banner";

/**
 * Appears once a guest has actually started learning, to offer an account
 * without ever blocking the first lesson.
 */
export function GuestBanner() {
  const { user, loading, apiReady } = useAuth();
  const xp = useProgressStore((state) => state.xp);
  const lessons = useProgressStore((state) => state.lessons);
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  const started = xp > 0 || completedCount(lessons) > 0;

  if (!apiReady || loading || user || !started || dismissed) return null;
  if (pathname === "/profile") return null;

  return (
    <div className="animate-fade-up mb-4 flex flex-col gap-3 rounded-[24px] bg-gradient-to-r from-brand-50 via-white to-sky-50 p-3.5 ring-1 ring-brand-100 sm:flex-row sm:items-center">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-brand-600 shadow-[0_10px_22px_-14px_rgba(90,69,232,0.6)] ring-1 ring-brand-100">
        <CloudUpload size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold text-ink">
          Ta progression est enregistrée sur cet appareil
        </p>
        <p className="text-[11px] font-medium leading-5 text-slate-500">
          Crée ton compte gratuit pour la retrouver sur ton téléphone et ton ordinateur.
        </p>
      </div>
      <Link
        to="/auth?mode=signup"
        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[11.5px] font-extrabold text-white shadow-[0_12px_24px_-14px_rgba(90,69,232,0.95)] transition hover:-translate-y-0.5 hover:bg-brand-700"
      >
        Créer mon compte
        <ArrowRight size={13} />
      </Link>
      <button
        type="button"
        aria-label="Masquer ce message"
        onClick={() => {
          setDismissed(true);
          window.sessionStorage.setItem(DISMISS_KEY, "1");
        }}
        className="grid h-8 w-8 shrink-0 place-items-center self-end rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-600 sm:self-auto"
      >
        <X size={15} />
      </button>
    </div>
  );
}

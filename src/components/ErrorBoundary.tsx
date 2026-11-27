import { Component, type ErrorInfo, type ReactNode } from "react";
import { Compass, RefreshCw, RotateCcw } from "@/lib/icons";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Filet de sécurité global : une erreur inattendue ne doit jamais laisser
 * l'utilisateur devant un écran blanc. On propose de recharger ou de revenir
 * à l'accueil. Les erreurs de chunk (ancien bundle après un déploiement) sont
 * réglées automatiquement par un seul rechargement.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const chunkFailure =
      /chunkloaderror|loading chunk|dynamically imported module|importing a module script/i.test(
        `${error.name} ${error.message}`,
      );

    if (chunkFailure && typeof window !== "undefined") {
      const key = "anglo-chunk-reload";
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, "1");
        window.location.reload();
        return;
      }
    }

    // Visible dans la console et dans les journaux de l'hébergeur.
    console.error("ANGLO CLUB — erreur non gérée", error, info.componentStack);
  }

  private goHome = () => {
    window.location.hash = "#/accueil";
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center bg-surface-soft px-5 py-10 text-center"
      >
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-brand-strong ring-1 ring-brand-500/15">
          <Compass size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Un petit accroc technique</h1>
        <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          L'écran n'a pas pu s'afficher correctement. Ta progression est enregistrée : recharge
          la page pour reprendre là où tu t'es arrêté.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="motion-button inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-extrabold text-white shadow-[0_16px_30px_-16px_rgba(124,45,255,0.9)] ring-1 ring-white/20 transition active:scale-[0.98]"
          >
            <RefreshCw size={17} />
            Recharger
          </button>
          <button
            type="button"
            onClick={this.goHome}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-surface px-6 text-sm font-extrabold text-ink ring-1 ring-line transition hover:bg-brand-soft active:scale-[0.98]"
          >
            <RotateCcw size={17} />
            Accueil
          </button>
        </div>
      </div>
    );
  }
}

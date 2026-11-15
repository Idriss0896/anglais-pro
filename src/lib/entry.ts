const ENTERED_KEY = "anglais-pro:entered";

/**
 * Mémorise le fait que le visiteur est déjà entré dans l'application : la page
 * de présentation ne s'affiche alors plus au retour sur la racine du site.
 */
export function hasEnteredApp() {
  try {
    return window.localStorage.getItem(ENTERED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEnteredApp() {
  try {
    window.localStorage.setItem(ENTERED_KEY, "1");
  } catch {
    // Navigation privée ou stockage bloqué : la session reste utilisable.
  }
}

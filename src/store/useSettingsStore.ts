import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  /** Thème de l'interface : clair, sombre ou selon le système. */
  theme: ThemePreference;
  /** Prononciation audio des mots anglais. */
  audio: boolean;
  /** Réduit les animations et les transitions. */
  reducedMotion: boolean;
  setTheme: (value: ThemePreference) => void;
  setAudio: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
}

/**
 * Préférences locales de l'appareil : elles ne sont pas synchronisées avec le
 * compte, car elles décrivent l'écran et le confort de lecture de l'utilisateur.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      audio: true,
      reducedMotion: false,
      setTheme: (theme) => set({ theme }),
      setAudio: (audio) => set({ audio }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    { name: "anglais-pro-settings", version: 1 },
  ),
);

/** Thème réellement appliqué (le mode « système » suit l'appareil). */
export function resolvedTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

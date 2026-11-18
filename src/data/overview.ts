/**
 * Vue d'ensemble du parcours, volontairement légère : elle ne contient aucune
 * leçon. La page de présentation et la coquille de l'application peuvent ainsi
 * s'afficher sans télécharger les 81 leçons. `curriculum.ts` vérifie en
 * développement que ces chiffres restent alignés sur le contenu réel.
 */
export interface LevelOverview {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  cefr: string;
  lessons: number;
  exercises: number;
}

export const LEVEL_OVERVIEW: LevelOverview[] = [
  { id: "level-1", num: 1, title: "Débutant", subtitle: "Les bases pour se débrouiller", cefr: "A1 – A2", lessons: 23, exercises: 301 },
  { id: "level-2", num: 2, title: "Intermédiaire", subtitle: "Gagner en aisance", cefr: "B1", lessons: 22, exercises: 250 },
  { id: "level-3", num: 3, title: "Avancé", subtitle: "Parler avec assurance", cefr: "B2", lessons: 18, exercises: 221 },
  { id: "level-4", num: 4, title: "Professionnel", subtitle: "Réussir en anglais au travail", cefr: "B2 – C1", lessons: 18, exercises: 126 },
];

export const TOTAL_UNITS = LEVEL_OVERVIEW.reduce((sum, level) => sum + level.lessons, 0);
export const TOTAL_QUESTIONS = LEVEL_OVERVIEW.reduce((sum, level) => sum + level.exercises, 0);
/** Nombre d'expressions des blocs « phrases » (mis à jour avec le contenu). */
export const TOTAL_PHRASES = 1168;

import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarCheck,
  Crown,
  Flame,
  Footprints,
  Gem,
  GraduationCap,
  Medal,
  Rocket,
  Target,
  Trophy,
  type LucideIcon,
} from "@/lib/icons";
import { TOTAL_UNITS } from "@/data/overview";

export interface AchievementStats {
  completed: number;
  total: number;
  streak: number;
  bestStreak: number;
  xp: number;
  bestAccuracy: number;
  perfectLessons: number;
  /** Numéros des niveaux entièrement terminés. */
  completedLevels: number[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  goal: number;
  value: (stats: AchievementStats) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    title: "Premier pas",
    description: "Termine ta première leçon",
    icon: Footprints,
    tone: "bg-amber-400",
    goal: 1,
    value: (stats) => stats.completed,
  },
  {
    id: "five-lessons",
    title: "En route",
    description: "Termine 5 leçons",
    icon: BookOpenCheck,
    tone: "bg-emerald-400",
    goal: 5,
    value: (stats) => stats.completed,
  },
  {
    id: "fifteen-lessons",
    title: "Studieux",
    description: "Termine 15 leçons",
    icon: Medal,
    tone: "bg-sky-400",
    goal: 15,
    value: (stats) => stats.completed,
  },
  {
    id: "halfway",
    title: "À mi-chemin",
    description: `Termine la moitié des ${TOTAL_UNITS} leçons`,
    icon: Target,
    tone: "bg-indigo-400",
    goal: Math.ceil(TOTAL_UNITS / 2),
    value: (stats) => stats.completed,
  },
  {
    id: "graduate",
    title: "Diplômé",
    description: `Termine les ${TOTAL_UNITS} leçons`,
    icon: GraduationCap,
    tone: "bg-fuchsia-500",
    goal: TOTAL_UNITS,
    value: (stats) => stats.completed,
  },
  {
    id: "level-1",
    title: "Les bases acquises",
    description: "Termine tout le niveau Débutant",
    icon: Crown,
    tone: "bg-emerald-500",
    goal: 1,
    value: (stats) => (stats.completedLevels.includes(1) ? 1 : 0),
  },
  {
    id: "level-2",
    title: "À l'aise",
    description: "Termine tout le niveau Intermédiaire",
    icon: Rocket,
    tone: "bg-azure-500",
    goal: 1,
    value: (stats) => (stats.completedLevels.includes(2) ? 1 : 0),
  },
  {
    id: "level-3",
    title: "Assurance",
    description: "Termine tout le niveau Avancé",
    icon: Medal,
    tone: "bg-fuchsia-500",
    goal: 1,
    value: (stats) => (stats.completedLevels.includes(3) ? 1 : 0),
  },
  {
    id: "level-4",
    title: "Prêt pour le travail",
    description: "Termine tout le niveau Professionnel",
    icon: Briefcase,
    tone: "bg-amber-500",
    goal: 1,
    value: (stats) => (stats.completedLevels.includes(4) ? 1 : 0),
  },
  {
    id: "streak-3",
    title: "Petite flamme",
    description: "3 jours d'affilée",
    icon: Flame,
    tone: "bg-orange-400",
    goal: 3,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "streak-7",
    title: "Semaine parfaite",
    description: "7 jours d'affilée",
    icon: CalendarCheck,
    tone: "bg-rose-400",
    goal: 7,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "streak-30",
    title: "Discipline d'or",
    description: "30 jours d'affilée",
    icon: Trophy,
    tone: "bg-amber-500",
    goal: 30,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "xp-500",
    title: "500 XP",
    description: "Gagne 500 points d'expérience",
    icon: Gem,
    tone: "bg-violet-400",
    goal: 500,
    value: (stats) => stats.xp,
  },
  {
    id: "xp-2000",
    title: "2000 XP",
    description: "Gagne 2 000 points d'expérience",
    icon: Award,
    tone: "bg-blue-400",
    goal: 2000,
    value: (stats) => stats.xp,
  },
  {
    id: "perfect-10",
    title: "Sans faute",
    description: "10 leçons avec 100 % de précision",
    icon: BadgeCheck,
    tone: "bg-yellow-400",
    goal: 10,
    value: (stats) => stats.perfectLessons,
  },
];

export interface Rank {
  label: string;
  min: number;
  max: number;
  tone: string;
}

export const RANKS: Rank[] = [
  { label: "Départ", min: 0, max: 299, tone: "bg-indigo-400" },
  { label: "Apprenti", min: 300, max: 799, tone: "bg-emerald-400" },
  { label: "Intermédiaire", min: 800, max: 1499, tone: "bg-sky-400" },
  { label: "Confirmé", min: 1500, max: 2499, tone: "bg-indigo-400" },
  { label: "Expert", min: 2500, max: 4999, tone: "bg-fuchsia-500" },
  { label: "Ambassadeur", min: 5000, max: Number.POSITIVE_INFINITY, tone: "bg-amber-400" },
];

export function getRank(xp: number) {
  return RANKS.find((rank) => xp >= rank.min && xp <= rank.max) ?? RANKS[0];
}

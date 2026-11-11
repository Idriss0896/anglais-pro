import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  Crown,
  Flame,
  GraduationCap,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface AchievementStats {
  completed: number;
  total: number;
  streak: number;
  bestStreak: number;
  xp: number;
  bestAccuracy: number;
  perfectLessons: number;
  level1Complete: boolean;
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
    icon: Sparkles,
    tone: "from-amber-400 to-orange-500",
    goal: 1,
    value: (stats) => stats.completed,
  },
  {
    id: "five-lessons",
    title: "En route",
    description: "Termine 5 leçons",
    icon: BookOpenCheck,
    tone: "from-emerald-400 to-teal-500",
    goal: 5,
    value: (stats) => stats.completed,
  },
  {
    id: "fifteen-lessons",
    title: "Studieux",
    description: "Termine 15 leçons",
    icon: Medal,
    tone: "from-sky-400 to-blue-500",
    goal: 15,
    value: (stats) => stats.completed,
  },
  {
    id: "halfway",
    title: "À mi-chemin",
    description: "Termine la moitié du parcours",
    icon: Target,
    tone: "from-indigo-400 to-violet-500",
    goal: Math.ceil(63 / 2),
    value: (stats) => stats.completed,
  },
  {
    id: "graduate",
    title: "Diplômé",
    description: "Termine les 63 leçons",
    icon: GraduationCap,
    tone: "from-fuchsia-500 to-purple-600",
    goal: 63,
    value: (stats) => stats.completed,
  },
  {
    id: "level-1",
    title: "Fondations solides",
    description: "Termine tout le niveau 1",
    icon: Crown,
    tone: "from-emerald-500 to-green-600",
    goal: 1,
    value: (stats) => (stats.level1Complete ? 1 : 0),
  },
  {
    id: "streak-3",
    title: "Petite flamme",
    description: "3 jours d'affilée",
    icon: Flame,
    tone: "from-orange-400 to-red-500",
    goal: 3,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "streak-7",
    title: "Semaine parfaite",
    description: "7 jours d'affilée",
    icon: CalendarCheck,
    tone: "from-rose-400 to-pink-500",
    goal: 7,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "streak-30",
    title: "Discipline d'or",
    description: "30 jours d'affilée",
    icon: Trophy,
    tone: "from-amber-500 to-yellow-500",
    goal: 30,
    value: (stats) => stats.bestStreak,
  },
  {
    id: "xp-500",
    title: "500 XP",
    description: "Gagne 500 points d'expérience",
    icon: Zap,
    tone: "from-violet-400 to-indigo-500",
    goal: 500,
    value: (stats) => stats.xp,
  },
  {
    id: "xp-2000",
    title: "2000 XP",
    description: "Gagne 2 000 points d'expérience",
    icon: Award,
    tone: "from-blue-400 to-indigo-600",
    goal: 2000,
    value: (stats) => stats.xp,
  },
  {
    id: "perfect-10",
    title: "Sans faute",
    description: "10 leçons avec 100 % de précision",
    icon: Star,
    tone: "from-yellow-400 to-amber-500",
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
  { label: "Curieux", min: 0, max: 299, tone: "from-slate-400 to-slate-500" },
  { label: "Apprenti", min: 300, max: 799, tone: "from-emerald-400 to-teal-500" },
  { label: "Intermédiaire", min: 800, max: 1499, tone: "from-sky-400 to-blue-500" },
  { label: "Confirmé", min: 1500, max: 2499, tone: "from-indigo-400 to-violet-500" },
  { label: "Expert", min: 2500, max: 4999, tone: "from-fuchsia-500 to-purple-600" },
  { label: "Ambassadeur", min: 5000, max: Number.POSITIVE_INFINITY, tone: "from-amber-400 to-orange-500" },
];

export function getRank(xp: number) {
  return RANKS.find((rank) => xp >= rank.min && xp <= rank.max) ?? RANKS[0];
}

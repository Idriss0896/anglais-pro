import {
  BookMarked,
  BookOpen,
  MessageCircle,
  Tag,
  type LucideIcon,
} from "@/lib/icons";
import type { CategoryKey } from "../types";

export interface CategoryTheme {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  chip: string;
  iconBg: string;
  iconText: string;
  /** Couleur pleine et profonde pour les grandes surfaces (héros, cartes). */
  card: string;
  gradient: string;
  dot: string;
  soft: string;
  text: string;
  bar: string;
  description: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryTheme> = {
  grammar: {
    label: "Grammaire",
    shortLabel: "Grammaire",
    icon: BookOpen,
    chip: "bg-indigo-soft text-indigo-strong ring-1 ring-indigo-strong/20",
    iconBg: "bg-indigo-soft",
    iconText: "text-indigo-strong",
    card: "bg-indigo-700",
    gradient: "bg-indigo-500",
    dot: "bg-indigo-500",
    soft: "bg-indigo-soft",
    text: "text-indigo-strong",
    bar: "bg-indigo-500",
    description: "Les règles et structures essentielles, expliquées simplement.",
  },
  vocabulary: {
    label: "Vocabulaire",
    shortLabel: "Vocabulaire",
    icon: Tag,
    chip: "bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20",
    iconBg: "bg-emerald-soft",
    iconText: "text-emerald-strong",
    card: "bg-emerald-700",
    gradient: "bg-emerald-500",
    dot: "bg-emerald-500",
    soft: "bg-emerald-soft",
    text: "text-emerald-strong",
    bar: "bg-emerald-500",
    description: "Le vocabulaire du quotidien, classé par thèmes utiles.",
  },
  expressions: {
    label: "Expressions",
    shortLabel: "Expressions",
    icon: MessageCircle,
    chip: "bg-amber-soft text-amber-strong ring-1 ring-amber-strong/20",
    iconBg: "bg-amber-soft",
    iconText: "text-amber-strong",
    card: "bg-amber-700",
    gradient: "bg-amber-400",
    dot: "bg-amber-500",
    soft: "bg-amber-soft",
    text: "text-amber-strong",
    bar: "bg-amber-500",
    description: "Les phrases et idiomes que les anglophones utilisent vraiment.",
  },
  reading: {
    label: "Lecture",
    shortLabel: "Lecture",
    icon: BookMarked,
    chip: "bg-sky-soft text-sky-strong ring-1 ring-sky-strong/20",
    iconBg: "bg-sky-soft",
    iconText: "text-sky-strong",
    card: "bg-sky-700",
    gradient: "bg-sky-500",
    dot: "bg-sky-500",
    soft: "bg-sky-soft",
    text: "text-sky-strong",
    bar: "bg-sky-500",
    description: "Des textes courts pour lire, comprendre et traduire en contexte.",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

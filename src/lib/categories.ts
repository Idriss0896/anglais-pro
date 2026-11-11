import {
  BookMarked,
  BookOpen,
  MessageCircle,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { CategoryKey } from "../types";

export interface CategoryTheme {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  chip: string;
  iconBg: string;
  iconText: string;
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
    chip: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    gradient: "from-indigo-500 to-violet-500",
    dot: "bg-indigo-500",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    bar: "bg-indigo-500",
    description: "Les règles et structures essentielles, expliquées simplement.",
  },
  vocabulary: {
    label: "Vocabulaire",
    shortLabel: "Vocabulaire",
    icon: Tag,
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
    description: "Le vocabulaire du quotidien, classé par thèmes utiles.",
  },
  expressions: {
    label: "Expressions",
    shortLabel: "Expressions",
    icon: MessageCircle,
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    gradient: "from-amber-400 to-orange-500",
    dot: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-700",
    bar: "bg-amber-500",
    description: "Les phrases et idiomes que les anglophones utilisent vraiment.",
  },
  reading: {
    label: "Lecture",
    shortLabel: "Lecture",
    icon: BookMarked,
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
    iconBg: "bg-sky-100",
    iconText: "text-sky-600",
    gradient: "from-sky-500 to-cyan-500",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-700",
    bar: "bg-sky-500",
    description: "Des textes courts pour lire, comprendre et traduire en contexte.",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

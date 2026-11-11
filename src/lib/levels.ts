export interface LevelTheme {
  gradient: string;
  soft: string;
  text: string;
  ring: string;
  bar: string;
  dot: string;
  badge: string;
}

export const LEVEL_THEMES: Record<number, LevelTheme> = {
  1: {
    gradient: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-100",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  },
  2: {
    gradient: "from-indigo-500 to-blue-500",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-100",
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  },
  3: {
    gradient: "from-fuchsia-500 to-violet-600",
    soft: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-100",
    bar: "bg-fuchsia-500",
    dot: "bg-fuchsia-500",
    badge: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100",
  },
};

export const LEVEL_EMOJIS: Record<number, string> = {
  1: "🌱",
  2: "🌿",
  3: "🌳",
};

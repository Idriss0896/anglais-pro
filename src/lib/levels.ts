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
    gradient: "bg-emerald-500",
    soft: "bg-emerald-soft",
    text: "text-emerald-strong",
    ring: "ring-emerald-strong/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badge: "bg-emerald-soft text-emerald-strong ring-1 ring-emerald-strong/20",
  },
  2: {
    gradient: "bg-indigo-500",
    soft: "bg-indigo-soft",
    text: "text-indigo-strong",
    ring: "ring-indigo-strong/20",
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
    badge: "bg-indigo-soft text-indigo-strong ring-1 ring-indigo-strong/20",
  },
  3: {
    gradient: "bg-fuchsia-500",
    soft: "bg-fuchsia-soft",
    text: "text-fuchsia-strong",
    ring: "ring-fuchsia-strong/20",
    bar: "bg-fuchsia-500",
    dot: "bg-fuchsia-500",
    badge: "bg-fuchsia-soft text-fuchsia-strong ring-1 ring-fuchsia-strong/20",
  },
};

export const LEVEL_EMOJIS: Record<number, string> = {
  1: "🌱",
  2: "🌿",
  3: "🌳",
};

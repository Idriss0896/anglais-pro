import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayActivity, LessonProgress } from "../types";
import { todayKey, yesterdayKey } from "../lib/utils";

export const MAX_HEARTS = 3;
/** On démarre avec un seul cœur : les autres se gagnent en terminant des leçons. */
export const STARTING_HEARTS = 1;

export interface ProgressData {
  xp: number;
  hearts: number;
  streak: number;
  bestStreak: number;
  lastStudyDay: string | null;
  dailyGoal: number;
  activity: Record<string, DayActivity>;
  lessons: Record<string, LessonProgress>;
  favorites: string[];
}

interface ProgressState extends ProgressData {
  sound: boolean;
  addXp: (amount: number) => void;
  completeLesson: (id: string, accuracy: number, xp: number) => void;
  loseHeart: () => void;
  restoreHearts: () => void;
  toggleFavorite: (id: string) => void;
  setDailyGoal: (value: number) => void;
  setSound: (value: boolean) => void;
  resetProgress: () => void;
  importProgress: (data: Partial<ProgressData>) => void;
}

const defaultProgress = {
  xp: 0,
  hearts: STARTING_HEARTS,
  streak: 0,
  bestStreak: 0,
  lastStudyDay: null as string | null,
  dailyGoal: 50,
  activity: {} as Record<string, DayActivity>,
  lessons: {} as Record<string, LessonProgress>,
  favorites: [] as string[],
  sound: true,
};

function bumpActivity(
  activity: Record<string, DayActivity>,
  day: string,
  xp: number,
  lessons: number,
) {
  const current = activity[day] ?? { xp: 0, lessons: 0 };
  return {
    ...activity,
    [day]: { xp: current.xp + xp, lessons: current.lessons + lessons },
  };
}

function touchStreak(
  state: Pick<ProgressState, "streak" | "bestStreak" | "lastStudyDay">,
  day: string,
) {
  if (state.lastStudyDay === day) {
    return {
      streak: Math.max(1, state.streak),
      bestStreak: Math.max(1, state.bestStreak),
      lastStudyDay: day,
    };
  }
  const streak = state.lastStudyDay === yesterdayKey() ? state.streak + 1 : 1;
  return {
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastStudyDay: day,
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...defaultProgress,
      sound: true,

      addXp: (amount) =>
        set((state) => {
          const day = todayKey();
          return {
            xp: state.xp + amount,
            activity: bumpActivity(state.activity, day, amount, 0),
            ...touchStreak(state, day),
          };
        }),

      completeLesson: (id, accuracy, xp) =>
        set((state) => {
          const day = todayKey();
          const previous = state.lessons[id];
          const nextLesson: LessonProgress = {
            completed: true,
            bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, accuracy),
            attempts: (previous?.attempts ?? 0) + 1,
            lastPlayedAt: new Date().toISOString(),
            xp: (previous?.xp ?? 0) + xp,
          };
          return {
            xp: state.xp + xp,
            // Un cœur se gagne à chaque leçon terminée (3 maximum).
            hearts: Math.min(MAX_HEARTS, state.hearts + 1),
            activity: bumpActivity(state.activity, day, xp, 1),
            lessons: { ...state.lessons, [id]: nextLesson },
            ...touchStreak(state, day),
          };
        }),

      loseHeart: () =>
        set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),

      restoreHearts: () => set({ hearts: MAX_HEARTS }),

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((favorite) => favorite !== id)
            : [...state.favorites, id],
        })),

      setDailyGoal: (value) => set({ dailyGoal: value }),
      setSound: (value) => set({ sound: value }),

      resetProgress: () =>
        set((state) => ({
          ...defaultProgress,
          activity: {},
          lessons: {},
          favorites: [],
          sound: state.sound,
          dailyGoal: state.dailyGoal,
        })),

      importProgress: (data) =>
        set((state) => ({
          xp: typeof data.xp === "number" ? data.xp : state.xp,
          hearts:
            typeof data.hearts === "number"
              ? Math.min(MAX_HEARTS, Math.max(0, Math.round(data.hearts)))
              : state.hearts,
          streak: typeof data.streak === "number" ? data.streak : state.streak,
          bestStreak:
            typeof data.bestStreak === "number" ? data.bestStreak : state.bestStreak,
          lastStudyDay:
            typeof data.lastStudyDay === "string" || data.lastStudyDay === null
              ? data.lastStudyDay
              : state.lastStudyDay,
          dailyGoal:
            typeof data.dailyGoal === "number" ? data.dailyGoal : state.dailyGoal,
          activity: data.activity ? { ...data.activity } : state.activity,
          lessons: data.lessons ? { ...data.lessons } : state.lessons,
          favorites: data.favorites ? [...data.favorites] : state.favorites,
        })),
    }),
    {
      name: "anglais-pro-v3",
      version: 4,
      migrate: (persisted) => {
        const state = persisted as Partial<ProgressState> | undefined;
        if (!state || typeof state !== "object") return persisted as ProgressState;
        const hearts = typeof state.hearts === "number" ? state.hearts : STARTING_HEARTS;
        return {
          ...state,
          hearts: Math.min(MAX_HEARTS, Math.max(0, Math.round(hearts))),
        } as ProgressState;
      },
    },
  ),
);

export function progressSnapshot(state: ProgressData): ProgressData {
  return {
    xp: state.xp,
    hearts: state.hearts,
    streak: state.streak,
    bestStreak: state.bestStreak,
    lastStudyDay: state.lastStudyDay,
    dailyGoal: state.dailyGoal,
    activity: state.activity,
    lessons: state.lessons,
    favorites: state.favorites,
  };
}

export function todayXp(activity: Record<string, DayActivity>) {
  return activity[todayKey()]?.xp ?? 0;
}

export function completedCount(lessons: Record<string, LessonProgress>) {
  return Object.values(lessons).filter((lesson) => lesson.completed).length;
}

export function accuracyAverage(lessons: Record<string, LessonProgress>) {
  const completed = Object.values(lessons).filter((lesson) => lesson.completed);
  if (completed.length === 0) return 0;
  return Math.round(
    completed.reduce((total, lesson) => total + lesson.bestAccuracy, 0) /
      completed.length,
  );
}

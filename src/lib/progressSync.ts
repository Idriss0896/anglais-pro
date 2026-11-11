import type { DayActivity, LessonProgress } from "@/types";
import { MAX_HEARTS, type ProgressData } from "@/store/useProgressStore";

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord<T>(value: unknown): Record<string, T> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, T>)
    : {};
}

/**
 * Guest progress is never thrown away: we combine the local and remote copies
 * by keeping the most advanced value for every counter. A user who studied
 * before signing up keeps their XP, lessons and favourites.
 */
export function mergeProgress(local: ProgressData, remote: unknown): ProgressData {
  if (!remote || typeof remote !== "object" || Array.isArray(remote)) return local;
  const other = remote as Partial<ProgressData>;

  const activity: Record<string, DayActivity> = { ...local.activity };
  for (const [day, value] of Object.entries(asRecord<DayActivity>(other.activity))) {
    const current = activity[day];
    if (!current) {
      activity[day] = {
        xp: asNumber(value?.xp),
        lessons: asNumber(value?.lessons),
      };
      continue;
    }
    activity[day] = {
      xp: Math.max(current.xp, asNumber(value?.xp)),
      lessons: Math.max(current.lessons, asNumber(value?.lessons)),
    };
  }

  const lessons: Record<string, LessonProgress> = { ...local.lessons };
  for (const [id, value] of Object.entries(asRecord<LessonProgress>(other.lessons))) {
    const current = lessons[id];
    if (!current) {
      lessons[id] = {
        completed: Boolean(value?.completed),
        bestAccuracy: asNumber(value?.bestAccuracy),
        attempts: asNumber(value?.attempts),
        lastPlayedAt:
          typeof value?.lastPlayedAt === "string" ? value.lastPlayedAt : "",
        xp: asNumber(value?.xp),
      };
      continue;
    }
    lessons[id] = {
      completed: current.completed || Boolean(value?.completed),
      bestAccuracy: Math.max(current.bestAccuracy, asNumber(value?.bestAccuracy)),
      attempts: Math.max(current.attempts, asNumber(value?.attempts)),
      lastPlayedAt:
        typeof value?.lastPlayedAt === "string" &&
        value.lastPlayedAt > (current.lastPlayedAt ?? "")
          ? value.lastPlayedAt
          : current.lastPlayedAt,
      xp: Math.max(current.xp, asNumber(value?.xp)),
    };
  }

  const favorites = Array.from(
    new Set([
      ...local.favorites.filter((id) => typeof id === "string"),
      ...(Array.isArray(other.favorites)
        ? other.favorites.filter((id): id is string => typeof id === "string")
        : []),
    ]),
  );

  const lastStudyDay =
    typeof other.lastStudyDay === "string" &&
    (!local.lastStudyDay || other.lastStudyDay > local.lastStudyDay)
      ? other.lastStudyDay
      : local.lastStudyDay;

  return {
    xp: Math.max(local.xp, asNumber(other.xp)),
    hearts: Math.min(MAX_HEARTS, Math.max(local.hearts, asNumber(other.hearts, local.hearts))),
    streak: Math.max(local.streak, asNumber(other.streak)),
    bestStreak: Math.max(local.bestStreak, asNumber(other.bestStreak)),
    lastStudyDay,
    dailyGoal:
      asNumber(other.dailyGoal) >= 10 ? asNumber(other.dailyGoal) : local.dailyGoal,
    activity,
    lessons,
    favorites,
  };
}

import { sql, ensureSchema } from "./_lib/db.js";
import { getSessionUser } from "./_lib/auth.js";
import {
  fail,
  json,
  methodNotAllowed,
  parseBody,
  rateLimit,
  requireSameOrigin,
} from "./_lib/http.js";

const MAX_STATE_LENGTH = 400_000;
const MAX_HEARTS = 3;

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]{0,79}$/i;
const FAVORITE_KEY = /^[a-z0-9][a-z0-9:_-]{0,79}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/;

function int(value, min, max, fallback = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Ne jamais faire confiance à l'état envoyé par le client : on ne garde que les
 * champs connus, avec des types, des bornes et un nombre d'entrées limités.
 * Les compteurs restent ceux du joueur (progression réelle), mais un état
 * forgé ne peut ni saturer la base ni casser l'affichage.
 */
function sanitizeState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const xp = int(raw.xp, 0, 50_000_000);
  const streak = int(raw.streak, 0, 100_000);
  const bestStreak = Math.max(streak, int(raw.bestStreak, 0, 100_000));

  const lastStudyDay =
    typeof raw.lastStudyDay === "string" && DAY_KEY.test(raw.lastStudyDay)
      ? raw.lastStudyDay
      : null;

  const dailyGoal = int(raw.dailyGoal, 10, 10_000, 30);

  const activity = {};
  if (raw.activity && typeof raw.activity === "object" && !Array.isArray(raw.activity)) {
    for (const [day, value] of Object.entries(raw.activity).slice(0, 400)) {
      if (!DAY_KEY.test(day) || !value || typeof value !== "object") continue;
      activity[day] = {
        xp: int(value.xp, 0, 100_000),
        lessons: int(value.lessons, 0, 1_000),
      };
    }
  }

  const lessons = {};
  const rawLessons = raw.lessons && typeof raw.lessons === "object" && !Array.isArray(raw.lessons)
    ? raw.lessons
    : {};
  for (const [id, value] of Object.entries(rawLessons).slice(0, 1_000)) {
    if (!UNIT_KEY.test(id) || !value || typeof value !== "object") continue;
    lessons[id] = {
      completed: value.completed === true,
      bestAccuracy: int(value.bestAccuracy, 0, 100),
      attempts: int(value.attempts, 0, 100_000),
      lastPlayedAt:
        typeof value.lastPlayedAt === "string" && ISO_DATE.test(value.lastPlayedAt)
          ? value.lastPlayedAt.slice(0, 40)
          : null,
      xp: int(value.xp, 0, 5_000_000),
    };
  }

  const favorites = [];
  if (Array.isArray(raw.favorites)) {
    for (const entry of raw.favorites.slice(0, 2_000)) {
      if (typeof entry !== "string" || entry.length > 80) continue;
      if (!FAVORITE_KEY.test(entry)) continue;
      if (!favorites.includes(entry)) favorites.push(entry);
    }
  }

  return {
    xp,
    hearts: int(raw.hearts, 0, MAX_HEARTS),
    streak,
    bestStreak,
    lastStudyDay,
    dailyGoal,
    activity,
    lessons,
    favorites,
  };
}

export default async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) {
    return methodNotAllowed(res, ["GET", "PUT"]);
  }
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, "progress", { max: 120, windowMs: 60_000 })) {
    return fail(res, 429, "too_many_requests", "Trop de synchronisations. Réessaie bientôt.");
  }

  try {
    const user = await getSessionUser(req);
    if (!user) {
      return fail(res, 401, "unauthorized", "Connecte-toi pour synchroniser ta progression.");
    }

    await ensureSchema();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT state, updated_at FROM progress WHERE user_id = ${user.id} LIMIT 1
      `;
      return json(res, 200, {
        state: rows[0]?.state ?? null,
        updatedAt: rows[0]?.updated_at ?? null,
      });
    }

    const body = parseBody(req);
    const state = sanitizeState(body?.state);
    if (!state) {
      return fail(res, 400, "invalid_state", "La progression envoyée est invalide.");
    }

    let serialized;
    try {
      serialized = JSON.stringify(state);
    } catch {
      return fail(res, 400, "invalid_state", "La progression envoyée est invalide.");
    }
    if (serialized.length > MAX_STATE_LENGTH) {
      return fail(res, 413, "state_too_large", "La progression dépasse la taille autorisée.");
    }

    const rows = await sql`
      INSERT INTO progress (user_id, state, updated_at)
      VALUES (${user.id}, ${serialized}::jsonb, now())
      ON CONFLICT (user_id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = now()
      RETURNING updated_at
    `;
    return json(res, 200, { ok: true, state, updatedAt: rows[0]?.updated_at ?? null });
  } catch (error) {
    console.error("[progress]", error);
    return fail(res, 500, "server_error", "Impossible de synchroniser la progression.");
  }
}

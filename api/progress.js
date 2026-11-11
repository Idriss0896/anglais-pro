import { sql, ensureSchema } from "../_lib/db.js";
import { getSessionUser } from "../_lib/auth.js";
import { fail, json, methodNotAllowed, parseBody } from "../_lib/http.js";

const MAX_STATE_LENGTH = 400_000;

export default async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) {
    return methodNotAllowed(res, ["GET", "PUT"]);
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
    const state = body?.state;
    if (!state || typeof state !== "object" || Array.isArray(state)) {
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
    return json(res, 200, { ok: true, updatedAt: rows[0]?.updated_at ?? null });
  } catch (error) {
    console.error("[progress]", error);
    return fail(res, 500, "server_error", "Impossible de synchroniser la progression.");
  }
}

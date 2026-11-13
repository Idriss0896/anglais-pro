import { sql, ensureSchema } from "./_lib/db.js";
import { getSessionUser, publicUser } from "./_lib/auth.js";
import {
  cleanText,
  fail,
  json,
  methodNotAllowed,
  parseBody,
  rateLimit,
  requireSameOrigin,
} from "./_lib/http.js";

const MAX_AVATAR_LENGTH = 400_000; // ~300 Ko utiles après compression côté client

function validAvatar(value) {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  if (value.length > MAX_AVATAR_LENGTH) return undefined;
  if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  if (/^https:\/\/[^\s]+$/i.test(value)) return value;
  return undefined;
}

export default async function handler(req, res) {
  if (!["PATCH", "POST"].includes(req.method)) {
    return methodNotAllowed(res, ["PATCH", "POST"]);
  }
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, "profile", { max: 20, windowMs: 60_000 })) {
    return fail(res, 429, "too_many_requests", "Trop de tentatives. Réessaie dans une minute.");
  }

  try {
    const current = await getSessionUser(req);
    if (!current) {
      return fail(res, 401, "unauthorized", "Connecte-toi pour modifier ton profil.");
    }

    const body = parseBody(req);
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = cleanText(body.name, 60);
      updates.name = name || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "avatar")) {
      const avatar = validAvatar(body.avatar);
      if (avatar === undefined) {
        return fail(
          res,
          400,
          "invalid_avatar",
          "L'image est invalide ou trop lourde (300 Ko maximum).",
        );
      }
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return json(res, 200, { user: current });
    }

    await ensureSchema();
    const rows = await sql`
      UPDATE users SET
        name = ${Object.prototype.hasOwnProperty.call(updates, "name") ? updates.name : current.name},
        avatar = ${Object.prototype.hasOwnProperty.call(updates, "avatar") ? updates.avatar : current.avatar},
        updated_at = now()
      WHERE id = ${current.id}
      RETURNING id, email, name, avatar, provider, created_at
    `;
    return json(res, 200, { user: publicUser(rows[0]) });
  } catch (error) {
    console.error("[profile]", error);
    return fail(res, 500, "server_error", "Impossible d'enregistrer le profil.");
  }
}

import { sql, ensureSchema } from "./_lib/db.js";
import { getSessionUser, hashPassword, publicUser, verifyPassword } from "./_lib/auth.js";
import {
  fail,
  isStrongPassword,
  isValidEmail,
  json,
  methodNotAllowed,
  normalizeEmail,
  parseBody,
  rateLimit,
  requireSameOrigin,
} from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH" && req.method !== "POST") {
    return methodNotAllowed(res, ["PATCH", "POST"]);
  }
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, "account-update", { max: 8, windowMs: 60_000 })) {
    return fail(res, 429, "too_many_requests", "Trop de tentatives. Réessaie dans une minute.");
  }

  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return fail(res, 401, "unauthorized", "Connecte-toi pour modifier tes identifiants.");
    }

    const body = parseBody(req);
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const nextEmail = Object.prototype.hasOwnProperty.call(body, "email")
      ? normalizeEmail(body.email)
      : sessionUser.email;
    const nextPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const wantsEmail = nextEmail !== sessionUser.email;
    const wantsPassword = nextPassword.length > 0;

    if (!wantsEmail && !wantsPassword) {
      return fail(res, 400, "no_changes", "Aucune modification à enregistrer.");
    }
    if (!currentPassword) {
      return fail(res, 400, "current_password_required", "Saisis ton mot de passe actuel.");
    }
    if (!isValidEmail(nextEmail)) {
      return fail(res, 400, "invalid_email", "Cette adresse email n'est pas valide.");
    }
    if (wantsPassword && !isStrongPassword(nextPassword)) {
      return fail(
        res,
        400,
        "weak_password",
        "Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.",
      );
    }

    await ensureSchema();
    const rows = await sql`
      SELECT id, email, name, avatar, provider, password_hash, created_at
      FROM users
      WHERE id = ${sessionUser.id}
      LIMIT 1
    `;
    const current = rows[0];
    if (!current?.password_hash || current.provider === "google") {
      return fail(
        res,
        400,
        "google_account",
        "Ce compte est lié à Google. Gère ta connexion depuis ton compte Google.",
      );
    }
    if (!(await verifyPassword(currentPassword, current.password_hash))) {
      return fail(res, 400, "wrong_password", "Le mot de passe actuel est incorrect.");
    }

    if (wantsEmail) {
      const duplicate = await sql`
        SELECT id FROM users WHERE email = ${nextEmail} AND id <> ${sessionUser.id} LIMIT 1
      `;
      if (duplicate.length > 0) {
        return fail(res, 409, "email_taken", "Cette adresse email est déjà utilisée.");
      }
    }

    const nextHash = wantsPassword ? await hashPassword(nextPassword) : current.password_hash;
    const updated = await sql`
      UPDATE users
      SET email = ${nextEmail},
          password_hash = ${nextHash},
          updated_at = now()
      WHERE id = ${sessionUser.id}
      RETURNING id, email, name, avatar, provider, created_at
    `;

    return json(res, 200, { user: publicUser(updated[0]) });
  } catch (error) {
    console.error("[account]", error);
    return fail(res, 500, "server_error", "Impossible de modifier les identifiants.");
  }
}

import { sql, ensureSchema } from "../_lib/db.js";
import {
  createSession,
  hashPassword,
  publicUser,
} from "../_lib/auth.js";
import {
  cleanText,
  fail,
  isStrongPassword,
  isValidEmail,
  json,
  methodNotAllowed,
  normalizeEmail,
  parseBody,
  rateLimit,
  requireSameOrigin,
} from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, "signup", { max: 8, windowMs: 60_000 })) {
    return fail(res, 429, "too_many_requests", "Trop de tentatives. Réessaie dans une minute.");
  }

  const body = parseBody(req);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = cleanText(body.name, 60) || null;

  if (!isValidEmail(email)) {
    return fail(res, 400, "invalid_email", "Cette adresse email n'est pas valide.");
  }
  if (password.length > 200) {
    return fail(res, 400, "weak_password", "Le mot de passe est trop long.");
  }
  if (!isStrongPassword(password)) {
    return fail(
      res,
      400,
      "weak_password",
      "Le mot de passe doit contenir au moins 8 caractères, dont une lettre et un chiffre.",
    );
  }

  try {
    await ensureSchema();
    const passwordHash = await hashPassword(password);
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, provider)
      VALUES (${email}, ${passwordHash}, ${name}, 'email')
      RETURNING id, email, name, avatar, provider, created_at
    `;
    const user = publicUser(rows[0]);
    await createSession(req, res, user.id);
    return json(res, 201, { user });
  } catch (error) {
    if (error?.code === "23505") {
      return fail(
        res,
        409,
        "email_taken",
        "Un compte existe déjà avec cette adresse. Connecte-toi.",
      );
    }
    if (error?.status === 503) {
      return fail(res, 503, "db_not_configured", "La base de données n'est pas encore configurée.");
    }
    console.error("[signup]", error);
    return fail(res, 500, "server_error", "Impossible de créer le compte pour le moment.");
  }
}

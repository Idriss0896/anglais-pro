import {
  burnPasswordTime,
  createSession,
  findUserByEmail,
  publicUser,
  verifyPassword,
} from "../_lib/auth.js";
import {
  fail,
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
  if (!rateLimit(req, "login", { max: 12, windowMs: 60_000 })) {
    return fail(res, 429, "too_many_requests", "Trop de tentatives. Réessaie dans une minute.");
  }

  const body = parseBody(req);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmail(email) || !password) {
    return fail(res, 400, "invalid_credentials", "Email ou mot de passe incorrect.");
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      // Même temps de réponse qu'un compte existant (anti-énumération).
      await burnPasswordTime(password);
      return fail(res, 401, "invalid_credentials", "Email ou mot de passe incorrect.");
    }
    if (!user.password_hash) {
      await burnPasswordTime(password);
      return fail(
        res,
        409,
        "oauth_only",
        "Ce compte a été créé avec Google. Utilise le bouton « Continuer avec Google ».",
      );
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return fail(res, 401, "invalid_credentials", "Email ou mot de passe incorrect.");
    }
    await createSession(req, res, user.id);
    return json(res, 200, { user: publicUser(user) });
  } catch (error) {
    if (error?.status === 503) {
      return fail(res, 503, "db_not_configured", "La base de données n'est pas encore configurée.");
    }
    console.error("[login]", error);
    return fail(res, 500, "server_error", "Connexion impossible pour le moment.");
  }
}

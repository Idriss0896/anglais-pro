import { randomBytes, scrypt as scryptCallback, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sql, ensureSchema } from "./db.js";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE = "ap_session";
const STATE_COOKIE = "ap_oauth_state";
const SESSION_DAYS = 14;
const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

/**
 * Hash factice utilisé quand l'email est inconnu : on paie le même coût de
 * calcul qu'une vraie vérification pour ne pas révéler l'existence du compte.
 */
const DUMMY_HASH =
  "s1$Y5yaIxSmcv4Pcq9Vpo-A_w$No_-VF8oHw2fWWKLneoOqWJ8xfbUtTQ7KmgnQkbC-wc4dXWqfMeiTyFi7njmO6mmfIe423_-_7ieGbRUmMNWog";

export async function burnPasswordTime(password) {
  await verifyPassword(typeof password === "string" ? password : "", DUMMY_HASH);
  return false;
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return `s1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  const [version, salt, hash] = stored.split("$");
  if (version !== "s1" || !salt || !hash) return false;
  try {
    const expected = Buffer.from(hash, "base64url");
    const derived = Buffer.from(
      await scrypt(password, Buffer.from(salt, "base64url"), expected.length, SCRYPT_PARAMS),
    );
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function parseCookies(req) {
  const header = req.headers.cookie;
  const result = {};
  if (!header) return result;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

function cookieOptions(req, maxAge, path = "/") {
  const secure =
    req.headers["x-forwarded-proto"] === "https" || Boolean(process.env.VERCEL);
  return [
    `Path=${path}`,
    "HttpOnly",
    "SameSite=Lax",
    "Priority=High",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function setSessionCookie(req, res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions(req, maxAge)}`,
  );
}

export function clearSessionCookie(req, res) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; ${cookieOptions(req, 0)}`,
  );
}

export function setStateCookie(req, res, state) {
  res.setHeader(
    "Set-Cookie",
    `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieOptions(req, 600)}`,
  );
}

export function clearStateCookie(req, res) {
  res.setHeader("Set-Cookie", `${STATE_COOKIE}=; ${cookieOptions(req, 0)}`);
}

export function readStateCookie(req) {
  return parseCookies(req)[STATE_COOKIE] || "";
}

export function randomState() {
  return randomBytes(24).toString("base64url");
}

export async function createSession(req, res, userId) {
  await ensureSchema();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  // Purge opportuniste : évite que la table des sessions grossisse sans fin.
  await sql`DELETE FROM sessions WHERE expires_at < now()`;
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expiresAt.toISOString()})
  `;
  setSessionCookie(req, res, token);
  return token;
}

export async function destroySession(req, res) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token && sql) {
    try {
      await ensureSchema();
      await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
    } catch {
      // Logging out must never fail because the DB is unreachable.
    }
  }
  clearSessionCookie(req, res);
}

export async function getSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !sql) return null;
  await ensureSchema();
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.avatar, u.provider, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > now()
    LIMIT 1
  `;
  return rows.length > 0 ? publicUser(rows[0]) : null;
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const rows = await sql`
    SELECT id, email, name, avatar, provider, password_hash, created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return rows[0] || null;
}

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || null,
    avatar: row.avatar || null,
    provider: row.provider || "email",
    createdAt: row.created_at,
  };
}

export { SESSION_COOKIE };

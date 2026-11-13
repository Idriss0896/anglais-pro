export function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

export function fail(res, status, code, message, extra) {
  json(res, status, { error: { code, message, ...(extra ?? {}) } });
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export function requestUrl(req) {
  const proto =
    req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL ? "https" : "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return new URL(req.url || "/", `${proto}://${host}`);
}

export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

const buckets = new Map();

/**
 * Very small in-memory rate limiter. Serverless instances are ephemeral, so it
 * only softens bursts; it is not a replacement for an edge rate limiter.
 */
export function rateLimit(req, key, { max = 12, windowMs = 60_000 } = {}) {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [entry, value] of buckets) {
      if (value.resetAt < now) buckets.delete(entry);
    }
  }
  return bucket.count <= max;
}

function allowedOrigins() {
  return (process.env.APP_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Protections CSRF : on refuse les écritures dont l'en-tête `Origin` ne
 * correspond pas à l'hôte de l'application. Les cookies sont déjà SameSite=Lax,
 * cette vérification ajoute une seconde barrière.
 */
export function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowlist = allowedOrigins();
  if (allowlist.includes(origin)) return true;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return Boolean(host) && originHost === host;
  } catch {
    return false;
  }
}

export function requireSameOrigin(req, res) {
  if (isSameOrigin(req)) return true;
  fail(res, 403, "forbidden_origin", "Origine de la requête non autorisée.");
  return false;
}

export function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  fail(res, 405, "method_not_allowed", "Méthode non autorisée.");
}

export function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

export function cleanText(value, max = 80) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

/** Un mot de passe solide : 8+ caractères, au moins une lettre et un chiffre. */
export function isStrongPassword(value) {
  if (typeof value !== "string" || value.length < 8 || value.length > 200) return false;
  return /[a-zA-Z]/.test(value) && /\d/.test(value);
}

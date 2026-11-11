export function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export function fail(res, status, code, message, extra) {
  json(res, status, { error: { code, message, ...(extra ?? {}) } });
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
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

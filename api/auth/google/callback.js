import { sql, ensureSchema } from "../../_lib/db.js";
import {
  clearPkceCookie,
  clearStateCookie,
  createSession,
  readPkceCookie,
  readStateCookie,
  safeEqual,
} from "../../_lib/auth.js";
import { requestUrl } from "../../_lib/http.js";

function redirectError(res, code) {
  res.statusCode = 302;
  res.setHeader("Location", `/#/auth?error=${encodeURIComponent(code)}`);
  res.end();
}

export default async function handler(req, res) {
  const url = requestUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return redirectError(res, "google_unavailable");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readStateCookie(req);
  const verifier = readPkceCookie(req);

  // Les cookies OAuth sont à usage unique, même si la vérification échoue.
  clearStateCookie(req, res);
  clearPkceCookie(req, res);

  if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
    return redirectError(res, "google_state");
  }
  if (!verifier) return redirectError(res, "google_state");

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("[google] token exchange failed", tokenResponse.status);
      return redirectError(res, "google_token");
    }

    const tokens = await tokenResponse.json();
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error("[google] userinfo failed", profileResponse.status);
      return redirectError(res, "google_profile");
    }

    const profile = await profileResponse.json();
    const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
    const googleId = typeof profile.sub === "string" ? profile.sub : "";
    if (!email || profile.email_verified !== true || !googleId) {
      return redirectError(res, "google_email");
    }
    const picture =
      typeof profile.picture === "string" && profile.picture.startsWith("https://")
        ? profile.picture.slice(0, 1000)
        : null;

    await ensureSchema();
    const rows = await sql`
      INSERT INTO users (email, name, avatar, provider, google_id)
      VALUES (
        ${email},
        ${typeof profile.name === "string" ? profile.name.slice(0, 60) : null},
        ${picture},
        'google',
        ${googleId}
      )
      ON CONFLICT (email) DO UPDATE SET
        google_id = COALESCE(users.google_id, EXCLUDED.google_id),
        name = COALESCE(users.name, EXCLUDED.name),
        avatar = COALESCE(users.avatar, EXCLUDED.avatar),
        updated_at = now()
      RETURNING id
    `;

    await createSession(req, res, rows[0].id);
    res.statusCode = 302;
    res.setHeader("Location", "/#/profile?welcome=google");
    res.end();
  } catch (error) {
    console.error("[google] callback failed", error);
    return redirectError(res, "google_failed");
  }
}

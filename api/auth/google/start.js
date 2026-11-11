import { randomState, setStateCookie } from "../_lib/auth.js";
import { requestUrl } from "../_lib/http.js";

export default async function handler(req, res) {
  const url = requestUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.statusCode = 302;
    res.setHeader("Location", "/#/auth?error=google_unavailable");
    res.end();
    return;
  }

  const state = randomState();
  setStateCookie(req, res, state);

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("prompt", "select_account");
  authorize.searchParams.set("access_type", "online");

  res.statusCode = 302;
  res.setHeader("Location", authorize.toString());
  res.end();
}

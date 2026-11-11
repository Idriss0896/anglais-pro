import { getSessionUser } from "../_lib/auth.js";
import { json, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL) {
    try {
      const user = await getSessionUser(req);
      return json(res, 200, {
        user,
        googleEnabled: Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
        ),
      });
    } catch (error) {
      console.error("[me]", error);
      return json(res, 200, {
        user: null,
        googleEnabled: Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
        ),
        degraded: true,
      });
    }
  }
  return json(res, 200, { user: null, googleEnabled: false, dbConfigured: false });
}

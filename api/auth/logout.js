import { destroySession } from "../_lib/auth.js";
import { json, methodNotAllowed, requireSameOrigin } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireSameOrigin(req, res)) return;
  await destroySession(req, res);
  return json(res, 200, { ok: true });
}

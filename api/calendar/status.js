// api/calendar/status.js
import { getStoredTokenForUid } from "../lib/tokenStore.js";

export default async function handler(req, res) {
  try {
    const uid = req.query?.uid || req.body?.uid;

    if (!uid || typeof uid !== "string" || uid.length < 5) {
      return res
        .status(400)
        .json({ connected: false, error: "Missing or invalid uid" });
    }

    const token = await getStoredTokenForUid(uid);
    const isConnected = Boolean(token && token.refresh_token);

    return res.status(200).json({ connected: isConnected });
  } catch (e) {
    console.error("Error en /api/calendar/status:", e);
    return res
      .status(500)
      .json({ connected: false, error: "Internal server error" });
  }
}
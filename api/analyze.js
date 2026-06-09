import { handleAnalyze } from "../src/server/handlers.js";
import { isAccessAllowed } from "../src/server/auth.js";
import { handleOptions, setCorsHeaders } from "../src/server/cors.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    if (!isAccessAllowed(req)) {
      res.status(401).json({ error: "Unauthorized. Please provide the site password." });
      return;
    }

    res.status(200).json(await handleAnalyze(req.body || {}));
  } catch (error) {
    res.status(500).json({ error: error.message || "Analyze failed" });
  }
}

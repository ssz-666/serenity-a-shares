import { handleAnalyze } from "../src/server/handlers.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    res.status(200).json(await handleAnalyze(req.body || {}));
  } catch (error) {
    res.status(500).json({ error: error.message || "Analyze failed" });
  }
}

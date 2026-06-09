import { isAccessAllowed } from "../src/server/auth.js";
import { handleOptions, setCorsHeaders } from "../src/server/cors.js";

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (!isAccessAllowed(req)) {
    res.status(401).json({ error: "Unauthorized. Please provide the site password." });
    return;
  }

  const rawSymbols = req.query?.symbols || "";
  const symbols = String(rawSymbols).split(",").map((item) => item.trim()).filter(Boolean);

  res.status(200).json({
    provider: process.env.DATA_PROVIDER || "mock",
    symbols,
    message: "Market-data adapter placeholder. Connect Tushare, AkShare proxy, Eastmoney mirror, or a custom endpoint here."
  });
}

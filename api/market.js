export default function handler(req, res) {
  const rawSymbols = req.query?.symbols || "";
  const symbols = String(rawSymbols).split(",").map((item) => item.trim()).filter(Boolean);

  res.status(200).json({
    provider: process.env.DATA_PROVIDER || "mock",
    symbols,
    message: "Market-data adapter placeholder. Connect Tushare, AkShare proxy, Eastmoney mirror, or a custom endpoint here."
  });
}

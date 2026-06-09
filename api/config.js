import { getAccessMode } from "../src/server/auth.js";
import { handleOptions, setCorsHeaders } from "../src/server/cors.js";

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  res.status(200).json({
    modelProviders: ["mock", "chatgpt-main", "domestic-lite", "openai-compatible", "openai-compatible-lite", "custom-http", "custom-http-lite"],
    dataProviders: ["mock", "tushare", "akshare-proxy", "custom-http"],
    env: {
      mainModelProvider: process.env.MAIN_MODEL_PROVIDER || "domestic-lite",
      liteModelProvider: process.env.LITE_MODEL_PROVIDER || "domestic-lite",
      modelProvider: process.env.MODEL_PROVIDER || "mock",
      dataProvider: process.env.DATA_PROVIDER || "mock",
      accessMode: getAccessMode(),
      hasChatGPT: Boolean(process.env.CHATGPT_API_KEY && process.env.CHATGPT_MODEL),
      hasDomestic: Boolean(process.env.DOMESTIC_API_KEY && process.env.DOMESTIC_BASE_URL && process.env.DOMESTIC_MODEL),
      hasMarketData: Boolean(process.env.TUSHARE_TOKEN || process.env.AKSHARE_BASE_URL || process.env.CUSTOM_DATA_BASE_URL)
    },
    note: "Secrets stay on the server. Do not put API keys in public frontend files."
  });
}

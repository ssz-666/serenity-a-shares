export default function handler(_req, res) {
  res.status(200).json({
    modelProviders: ["mock", "chatgpt-main", "domestic-lite", "openai-compatible", "openai-compatible-lite", "custom-http", "custom-http-lite"],
    dataProviders: ["mock", "tushare", "akshare-proxy", "custom-http"],
    env: {
      mainModelProvider: process.env.MAIN_MODEL_PROVIDER || "chatgpt-main",
      liteModelProvider: process.env.LITE_MODEL_PROVIDER || "domestic-lite",
      modelProvider: process.env.MODEL_PROVIDER || "mock",
      dataProvider: process.env.DATA_PROVIDER || "mock"
    },
    note: "Secrets stay on the server. Do not put API keys in public frontend files."
  });
}

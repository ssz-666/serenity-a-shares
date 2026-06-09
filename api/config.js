export default function handler(_req, res) {
  res.status(200).json({
    modelProviders: ["mock", "openai-compatible", "custom-http"],
    dataProviders: ["mock", "tushare", "akshare-proxy", "custom-http"],
    env: {
      modelProvider: process.env.MODEL_PROVIDER || "mock",
      dataProvider: process.env.DATA_PROVIDER || "mock"
    },
    note: "Secrets stay on the server. Do not put API keys in public frontend files."
  });
}

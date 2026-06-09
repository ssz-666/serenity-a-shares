import { buildSerenityAnalysis } from "../stock/serenity-engine.js";
import { runModelProvider } from "../providers/model-providers.js";

export async function handleAnalyze(payload) {
  const request = {
    industry: payload.industry || "robotics",
    mode: payload.mode || "screen",
    framework: payload.framework || "combined",
    tickers: Array.isArray(payload.tickers) ? payload.tickers : [],
    riskAnswers: payload.riskAnswers || {},
    provider: payload.provider || process.env.MODEL_PROVIDER || "mock"
  };

  const frameworkResult = buildSerenityAnalysis(request);
  const modelResult = await runModelProvider(request.provider, {
    prompt: buildModelPrompt(request, frameworkResult),
    frameworkResult
  });

  return {
    generatedAt: new Date().toISOString(),
    request,
    frameworkResult,
    modelResult,
    disclaimer: "框架辅助，不是投资建议；只输出 A/B/C/D 证据强度，不给买卖建议、入场价或仓位指令。"
  };
}

function buildModelPrompt(request, frameworkResult) {
  return [
    "你是 A 股 chokepoint 框架分析助手。",
    "硬约束：只做 A/B/C/D 分层，不给买入、卖出、推荐、入场价、仓位建议；反对杠杆；保留 DYOR。",
    `行业：${request.industry}`,
    `模式：${request.mode}`,
    `候选：${frameworkResult.candidates.map((item) => `${item.name}(${item.code}) ${item.grade}`).join("；")}`,
    "请基于候选的产业链位置、风险和待验证信号，输出简洁中文分析。"
  ].join("\n");
}

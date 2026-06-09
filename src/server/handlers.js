import { buildSerenityAnalysis } from "../stock/serenity-engine.js";
import { runModelProvider } from "../providers/model-providers.js";

export async function handleAnalyze(payload) {
  const request = {
    industry: payload.industry || "robotics",
    mode: payload.mode || "screen",
    framework: payload.framework || "combined",
    tickers: Array.isArray(payload.tickers) ? payload.tickers : [],
    riskAnswers: payload.riskAnswers || {},
    provider: payload.provider || process.env.MAIN_MODEL_PROVIDER || process.env.MODEL_PROVIDER || "mock",
    pipeline: normalizePipeline(payload.pipeline || {})
  };

  const frameworkResult = buildSerenityAnalysis(request);
  const modelResult = await runModelProvider(request.provider, {
    prompt: buildModelPrompt(request, frameworkResult),
    frameworkResult,
    taskType: "main-analysis"
  });

  return {
    generatedAt: new Date().toISOString(),
    request,
    frameworkResult,
    modelResult,
    pipeline: describePipeline(request.pipeline),
    disclaimer: "框架辅助，不是投资建议；只输出 A/B/C/D 证据强度，不给买卖建议、入场价或仓位指令。"
  };
}

function buildModelPrompt(request, frameworkResult) {
  return [
    "你是 A 股 chokepoint 框架分析助手。",
    "硬约束：只做 A/B/C/D 分层，不给买入、卖出、推荐、入场价、仓位建议；反对杠杆；保留 DYOR。",
    `行业：${request.industry}`,
    `模式：${request.mode}`,
    `框架：${request.framework}`,
    `主力分析 API：${request.pipeline.mainAnalysisProvider}`,
    `便宜任务 API：${request.pipeline.liteTaskProvider}`,
    `候选：${frameworkResult.candidates.map((item) => `${item.name}(${item.code}) ${item.grade}`).join("；")}`,
    "请基于候选的产业链位置、风险和待验证信号，输出简洁中文分析。"
  ].join("\n");
}

function normalizePipeline(pipeline) {
  return {
    mainAnalysisProvider: pipeline.mainAnalysisProvider || process.env.MAIN_MODEL_PROVIDER || "chatgpt-main",
    liteTaskProvider: pipeline.liteTaskProvider || process.env.LITE_MODEL_PROVIDER || "domestic-lite",
    backendServices: Array.isArray(pipeline.backendServices)
      ? pipeline.backendServices
      : ["market-data", "financial-metrics", "cache", "auth", "risk-control"],
    apiConfig: pipeline.apiConfig || {}
  };
}

function describePipeline(pipeline) {
  return {
    mainAnalysis: {
      provider: pipeline.mainAnalysisProvider,
      responsibilities: ["主力分析", "逻辑推理", "综合判断", "报告生成"]
    },
    liteTasks: {
      provider: pipeline.liteTaskProvider,
      responsibilities: ["基础总结", "标题生成", "分类", "客服问答", "简单财报提取"]
    },
    backend: {
      services: pipeline.backendServices,
      responsibilities: ["行情抓取", "财务指标计算", "缓存", "权限", "风控"]
    },
    apiConfig: {
      chatgptModel: pipeline.apiConfig?.chatgpt?.model || process.env.CHATGPT_MODEL || null,
      domesticModel: pipeline.apiConfig?.domestic?.model || process.env.DOMESTIC_MODEL || null,
      dataProvider: pipeline.apiConfig?.backend?.dataProvider || process.env.DATA_PROVIDER || "mock"
    }
  };
}

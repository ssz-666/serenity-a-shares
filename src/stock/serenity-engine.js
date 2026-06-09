import { roboticsCandidates } from "./robotics-candidates.js";
import { attachBuffettReview, buildBuffettGuardrails } from "./buffett-engine.js";

const gradeRank = { A: 4, B: 3, C: 2, D: 1 };

export function buildSerenityAnalysis(request) {
  const pool = request.industry === "robotics" ? roboticsCandidates : roboticsCandidates;
  const selectedCodes = new Set(request.tickers || []);
  let candidates = pool
    .filter((item) => !selectedCodes.size || selectedCodes.has(item.code))
    .map((candidate) => scoreCandidate(candidate, request.riskAnswers));

  candidates = attachBuffettReview(candidates);

  const scoreKey = request.framework === "buffett" ? "buffettScore" : request.framework === "combined" ? "blendedScore" : "score";
  candidates.sort((left, right) => getComparable(right, scoreKey) - getComparable(left, scoreKey));

  return {
    industry: "机器人 / 物理 AI",
    method: "Serenity A 股 chokepoint：上游、单点、低覆盖、国产替代、无红线。",
    candidates,
    guardrails: [
      "只做 A/B/C/D 证据强度，不给买入/卖出/推荐。",
      "公司只是产业链位置示例，使用前必须自己核验公告、财报和客户验证。",
      "不使用融资融券、雪球、DMA、个股期权、配资等杠杆工具。"
    ].concat(buildBuffettGuardrails()),
    apiHooks: [
      "/api/analyze：统一分析入口，可接任意 LLM。",
      "/api/market：行情、估值、资金流、公告数据入口。",
      "/api/config：查看服务端开放的模型和数据源类型。"
    ]
  };
}

function getComparable(candidate, key) {
  if (key === "buffettScore") return candidate.buffett?.buffettScore || 0;
  return candidate[key] || 0;
}

function scoreCandidate(candidate, riskAnswers = {}) {
  let score = candidate.baseGrade === "A" ? 82 : 70;
  const notes = [];

  if (riskAnswers.hasFinancialRedFlag) {
    score -= 30;
    notes.push("存在财务或治理红线，需要降级复核。");
  }
  if (riskAnswers.isCrowdedTheme) {
    score -= 8;
    notes.push("主题交易拥挤，估值和波动需要额外折扣。");
  }
  if (riskAnswers.hasVerifiedRobotRevenue) {
    score += 6;
    notes.push("机器人业务收入兑现路径更清晰。");
  }
  if (riskAnswers.hasInstitutionalFollow) {
    score += 4;
    notes.push("机构跟随信号改善，但这不是入场理由。");
  }

  return {
    ...candidate,
    score: Math.max(0, Math.min(100, score)),
    grade: toGrade(score),
    verificationNotes: notes
  };
}

function toGrade(score) {
  if (score >= 78) return "A";
  if (score >= 62) return "B";
  if (score >= 45) return "C";
  return "D";
}

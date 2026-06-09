const qualityProfiles = {
  "688017": {
    circle: "边界内：减速器商业逻辑清楚，但人形机器人放量节奏仍有较高技术和需求不确定性。",
    moat: "中强：精密制造、客户认证、工艺积累形成壁垒，但不属于消费品牌式宽护城河。",
    cash: "需要跟踪：主题上行期容易先交易远期预期，现金流和订单兑现比收入增速更关键。",
    management: "公开信息未见一票否决红旗，仍需持续看扩产纪律和费用控制。",
    buffettGrade: "B",
    buffettScore: 74
  },
  "002979": {
    circle: "边界内：运动控制和伺服系统可解释，但竞争格局比减速器更分散。",
    moat: "中等：产品和渠道积累有价值，但客户可选项较多，定价权需要验证。",
    cash: "需要重点跟踪经营现金流、应收账款和库存，不宜只看收入增长。",
    management: "更像执行型制造公司，资本配置要看是否聚焦高回报细分。",
    buffettGrade: "B",
    buffettScore: 70
  },
  "688160": {
    circle: "边界内：低压伺服、无框电机和人机界面业务较容易理解。",
    moat: "中等偏弱：小而专是优点，但规模、客户黏性和定价权仍需验证。",
    cash: "利润体量较小，现金流波动会显著影响质量评分。",
    management: "需要看机器人方向投入能否形成持续回报，而不是只形成费用。",
    buffettGrade: "B",
    buffettScore: 67
  },
  "603662": {
    circle: "边界内：传感器业务可理解，但机器人力传感收入占比需要拆清楚。",
    moat: "中等：传感器有工艺和客户壁垒，但细分市场玩家不少。",
    cash: "要剔除非经常性项目，优先看扣非利润和经营现金流。",
    management: "关注并购、业务扩张和费用投放是否提高每股内在价值。",
    buffettGrade: "B",
    buffettScore: 65
  },
  "002472": {
    circle: "在能力圈内：精密齿轮和传动业务成熟，但机器人纯度不高。",
    moat: "中等：制造能力和客户关系较强，但主业更受汽车链周期影响。",
    cash: "成熟制造属性更强，应看自由现金流和资本开支纪律。",
    management: "重点看机器人业务扩张是否克制，避免为主题做低回报投入。",
    buffettGrade: "B",
    buffettScore: 66
  }
};

export function attachBuffettReview(candidates) {
  return candidates.map((candidate) => {
    const profile = qualityProfiles[candidate.code] || fallbackProfile;
    return {
      ...candidate,
      buffett: profile,
      blendedScore: Math.round(candidate.score * 0.55 + profile.buffettScore * 0.45),
      blendedGrade: toGrade(candidate.score * 0.55 + profile.buffettScore * 0.45)
    };
  });
}

export function buildBuffettGuardrails() {
  return [
    "巴菲特框架只做生意质量复核，不给买入/卖出/入场价。",
    "重点看能力圈、护城河、现金流、管理层和安全边际。",
    "技术制造公司复杂度高，不能把高景气自动等同于宽护城河。"
  ];
}

const fallbackProfile = {
  circle: "需要先解释清楚商业模式，否则视为能力圈外。",
  moat: "护城河未验证。",
  cash: "现金流质量未验证。",
  management: "管理层质量未验证。",
  buffettGrade: "C",
  buffettScore: 50
};

function toGrade(score) {
  if (score >= 78) return "A";
  if (score >= 62) return "B";
  if (score >= 45) return "C";
  return "D";
}

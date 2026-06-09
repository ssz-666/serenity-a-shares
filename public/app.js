const cards = document.querySelector("#cards");
const runButton = document.querySelector("#runButton");
const apiStatus = document.querySelector("#apiStatus");
const timestamp = document.querySelector("#timestamp");
const modelText = document.querySelector("#modelText");

const controls = {
  industry: document.querySelector("#industry"),
  framework: document.querySelector("#framework"),
  provider: document.querySelector("#provider"),
  crowded: document.querySelector("#crowded"),
  verifiedRevenue: document.querySelector("#verifiedRevenue"),
  institutional: document.querySelector("#institutional"),
  redFlag: document.querySelector("#redFlag")
};

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("config failed");
    const config = await response.json();
    apiStatus.textContent = `API 已连接 · ${config.env?.modelProvider || "mock"}`;
  } catch {
    apiStatus.textContent = "静态模式 · 本地规则";
  }
}

async function runAnalysis() {
  runButton.disabled = true;
  runButton.textContent = "分析中";

  const payload = {
    industry: controls.industry.value,
    framework: controls.framework.value,
    provider: controls.provider.value,
    riskAnswers: {
      isCrowdedTheme: controls.crowded.checked,
      hasVerifiedRobotRevenue: controls.verifiedRevenue.checked,
      hasInstitutionalFollow: controls.institutional.checked,
      hasFinancialRedFlag: controls.redFlag.checked
    }
  };

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    render(data);
  } catch (error) {
    render(runLocalAnalysis(payload));
  } finally {
    runButton.disabled = false;
    runButton.textContent = "运行框架分析";
  }
}

function render(data) {
  timestamp.textContent = new Date(data.generatedAt).toLocaleString("zh-CN");
  modelText.textContent = data.modelResult?.text || data.modelResult?.error || "模型未返回内容。";
  cards.innerHTML = "";

  for (const item of data.frameworkResult.candidates) {
    const displayGrade = controls.framework.value === "combined" ? item.blendedGrade || item.grade : item.grade;
    const article = document.createElement("article");
    article.className = "candidate";
    article.innerHTML = `
      <div class="grade ${displayGrade.toLowerCase()}">${displayGrade}</div>
      <div>
        <h3>${item.name}（${item.code}）</h3>
        <div class="meta">${item.segment} · Serenity ${item.score}/100 · Buffett ${item.buffett?.buffettScore || "-"} /100 · 综合 ${item.blendedScore || item.score}/100</div>
        <p>${item.chokepoint}</p>
        <div class="tags">${item.strengths.map((text) => `<span class="tag">${text}</span>`).join("")}</div>
        ${item.buffett ? `<p><strong>巴菲特复核：</strong>${item.buffett.moat} ${item.buffett.cash}</p>` : ""}
        <p class="risk">主要风险：${item.risks.join("；")}</p>
        ${item.verificationNotes.length ? `<p>校准：${item.verificationNotes.join("；")}</p>` : ""}
      </div>
    `;
    cards.append(article);
  }
}

const localCandidates = [
  {
    code: "688017",
    name: "绿的谐波",
    segment: "谐波减速器",
    chokepoint: "日本哈默纳科是全球锚，A 股里属于最经典的减速器单点映射。",
    baseGrade: "A",
    strengths: ["上游核心部件", "机器人运动链条关键环节", "替换和认证成本较高"],
    risks: ["人形机器人预期拥挤", "估值波动大", "需要验证放量节奏"],
    buffett: {
      moat: "中强：精密制造、客户认证、工艺积累形成壁垒。",
      cash: "现金流和订单兑现比收入增速更关键。",
      buffettScore: 74
    }
  },
  {
    code: "002979",
    name: "雷赛智能",
    segment: "运动控制 / 伺服 / 步进",
    chokepoint: "比整机更上游，比大型平台公司更接近小盘运动控制候选。",
    baseGrade: "A",
    strengths: ["运动控制小盘", "机器人执行层核心部件", "产品线与自动化需求相关"],
    risks: ["现金流和库存需要持续跟踪", "竞争强度高", "客户结构需要验证"],
    buffett: {
      moat: "中等：产品和渠道积累有价值，但客户可选项较多。",
      cash: "经营现金流、应收账款和库存需要重点跟踪。",
      buffettScore: 70
    }
  },
  {
    code: "688160",
    name: "步科股份",
    segment: "低压伺服 / 无框电机 / 人机界面",
    chokepoint: "机器人动力解决方案属性明确，属于运动控制链里的小盘候选。",
    baseGrade: "A",
    strengths: ["运动控制纯度较高", "无框电机与机器人方向相关", "小盘低覆盖特征更明显"],
    risks: ["利润体量小", "现金流波动", "需要验证机器人业务占比"],
    buffett: {
      moat: "中等偏弱：小而专是优点，规模和定价权仍需验证。",
      cash: "利润体量小，现金流波动会显著影响质量评分。",
      buffettScore: 67
    }
  },
  {
    code: "603662",
    name: "柯力传感",
    segment: "力 / 力矩传感器",
    chokepoint: "传感器是机器人感知层关键部件，但收入兑现路径需要继续验证。",
    baseGrade: "B",
    strengths: ["感知环节有产业弹性", "力传感器与机器人方向相关", "可作为补充观察"],
    risks: ["机器人收入占比需要拆分", "非经常项扰动", "主题交易可能先于业绩"],
    buffett: {
      moat: "中等：传感器有工艺和客户壁垒，但细分市场玩家不少。",
      cash: "要剔除非经常性项目，优先看扣非利润和经营现金流。",
      buffettScore: 65
    }
  },
  {
    code: "002472",
    name: "双环传动",
    segment: "RV 减速器 / 精密齿轮",
    chokepoint: "RV 减速器位置不错，但汽车齿轮属性更重，机器人纯度低于绿的谐波。",
    baseGrade: "B",
    strengths: ["精密传动能力", "RV 减速器产业位置合理", "制造能力成熟"],
    risks: ["机器人业务纯度不足", "主业周期影响更大", "不够小盘冷门"],
    buffett: {
      moat: "中等：制造能力和客户关系较强，但主业更受汽车链周期影响。",
      cash: "成熟制造属性更强，应看自由现金流和资本开支纪律。",
      buffettScore: 66
    }
  }
];

function runLocalAnalysis(payload) {
  const candidates = localCandidates.map((candidate) => {
    let score = candidate.baseGrade === "A" ? 82 : 70;
    const verificationNotes = [];

    if (payload.riskAnswers.hasFinancialRedFlag) {
      score -= 30;
      verificationNotes.push("存在财务或治理红线，需要降级复核。");
    }
    if (payload.riskAnswers.isCrowdedTheme) {
      score -= 8;
      verificationNotes.push("主题交易拥挤，估值和波动需要额外折扣。");
    }
    if (payload.riskAnswers.hasVerifiedRobotRevenue) {
      score += 6;
      verificationNotes.push("机器人业务收入兑现路径更清晰。");
    }
    if (payload.riskAnswers.hasInstitutionalFollow) {
      score += 4;
      verificationNotes.push("机构跟随信号改善，但这不是入场理由。");
    }

    const blendedScore = Math.round(score * 0.55 + candidate.buffett.buffettScore * 0.45);
    return {
      ...candidate,
      score,
      grade: toGrade(score),
      blendedScore,
      blendedGrade: toGrade(blendedScore),
      verificationNotes
    };
  });

  const sortKey = payload.framework === "buffett" ? "buffett" : payload.framework === "serenity" ? "serenity" : "combined";
  candidates.sort((left, right) => {
    if (sortKey === "buffett") return right.buffett.buffettScore - left.buffett.buffettScore;
    if (sortKey === "serenity") return right.score - left.score;
    return right.blendedScore - left.blendedScore;
  });

  return {
    generatedAt: new Date().toISOString(),
    frameworkResult: { candidates },
    modelResult: {
      text: "静态模式：当前使用浏览器内置规则引擎。接入后端 API 后，可调用任意 OpenAI 兼容模型或自定义模型服务。"
    }
  };
}

function toGrade(score) {
  if (score >= 78) return "A";
  if (score >= 62) return "B";
  if (score >= 45) return "C";
  return "D";
}

runButton.addEventListener("click", runAnalysis);
loadConfig();
runAnalysis();

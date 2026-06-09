# serenity-a-shares

[![skills.sh](https://skills.sh/b/ssz-666/serenity-a-shares)](https://skills.sh/ssz-666/serenity-a-shares)

> A 股版的 Serenity (@aleabitoreddit) chokepoint 选股框架 skill。

## 一键安装

```bash
npx skills add ssz-666/serenity-a-shares
```

支持 Claude Code、Cursor、OpenCode、Codex 等 50+ AI agent。
首次使用会提示你选择安装到哪个 agent。

把 Twitter 用户 [Serenity (@aleabitoreddit)](https://x.com/aleabitoreddit) 在美股
AI / 半导体供应链上的"卡脖子选股法"移植到 A 股，做了**重写**而非翻译，
因为两个市场在 T+1 / 涨跌停 / 政策权重 / 信号源 / 风控 等维度结构性不同。

## 来源 & 致谢

本 skill 基于以下两个公开 repo 的二次创作：

- [yan-labs/serenity-aleabitoreddit](https://github.com/yan-labs/serenity-aleabitoreddit) —
  原始推特存档 + 美股 AI/半导体供应链 skill
- [leslieyeo/serenity-reply](https://github.com/leslieyeo/serenity-reply) —
  Serenity 思维框架的中文蒸馏版

以及 [singularityresearchfund.substack.com](https://singularityresearchfund.substack.com/p/inside-the-mind-of-serenity-aleabitoreddit)
的第三方深度分析。

本 repo **不隶属于、不被授权于** Serenity 本人。
所有内容基于其公开推文 + 第三方公开分析的再加工。

## 结构

```
serenity-a-shares/
├── SKILL.md                              # 主 skill 文件（含 frontmatter）
├── README.md                             # 你在看的这个
├── public/                               # API 版网页前端
├── api/                                  # Vercel Serverless API 入口
├── src/                                  # 候选池、评分规则、模型/数据源适配器
└── references/
    ├── methodology.md                    # 8 条核心原则的 A 股改写
    ├── industry-map.md                   # 美股 chokepoint → A 股标的池映射
    ├── cn-market-rules.md                # A 股微观结构差异（T+1 / 涨跌停 / ST 等）
    ├── signal-sources.md                 # A 股的 chokepoint 信号源拼图
    └── risk-calibration.md               # 风险校准 & Serenity 本人局限的诚实讨论
```

## API 版网页

这个 repo 也预留了一个手机可访问的网页控制台，用来把 skill 的选股框架产品化。
它只做 A/B/C/D 证据强度、风险校准和尽调清单，不输出买入 / 卖出 / 推荐 / 入场价。

本地运行：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

已预留接口：

- `POST /api/analyze`：统一分析入口，接 Serenity 规则引擎和可替换 LLM
- `GET /api/market?symbols=688017,002979`：行情 / 财报 / 公告 / 资金流数据入口
- `GET /api/config`：查看当前服务端开放的模型和数据源类型

模型和数据源都通过环境变量切换，真实密钥不要写进前端代码：

```bash
cp .env.example .env
```

可选模型层：

- `MODEL_PROVIDER=mock`：默认占位，不调用外部模型
- `MODEL_PROVIDER=openai-compatible`：兼容 OpenAI 风格的 `/chat/completions` 接口
- `MODEL_PROVIDER=custom-http`：转发到你自己的模型服务

可选数据层：

- `DATA_PROVIDER=mock`：默认占位
- `DATA_PROVIDER=tushare`：预留 Tushare 接口位置
- `DATA_PROVIDER=akshare-proxy`：预留自建 AkShare 服务代理
- `DATA_PROVIDER=custom-http`：转发到你自己的行情 / 财报服务

如果要手机公网访问，建议把 GitHub 仓库接到 Vercel。GitHub Pages 只能托管静态网页，
不适合保存 API key；Vercel / Cloudflare Workers / Netlify Functions 这类带服务端环境变量的平台更适合 API 版。

本仓库已带 GitHub Pages 工作流：`.github/workflows/pages.yml` 会把 `public/` 发布为静态手机页面。
静态页面会自动使用浏览器内置规则引擎；如果要调用真实模型或行情 API，请再接 Vercel / Cloudflare Workers 作为后端。

## 怎么用

### 方式 1：用 skills CLI 一键安装（推荐）

```bash
npx skills add ssz-666/serenity-a-shares
```

CLI 会自动检测你装了哪些 AI agent（Claude Code、Cursor、OpenCode 等），
并把 skill 放到对应位置，下次开始对话就能用。

### 方式 2：直接放进 Claude.ai Project

把整个 `serenity-a-shares/` 文件夹（包括 SKILL.md 和 references/）放进
Claude.ai 的 Project Knowledge，然后在对话里说：
> 用 serenity-a-shares 的视角看 XX 这只股票

### 方式 3：Claude Code 手动复制

```bash
cp -r serenity-a-shares ~/.claude/skills/
```

### 方式 4：直接粘贴

把 `SKILL.md` 内容粘进对话开头作为 system instruction 也可以，
但加载 `references/*.md` 的能力会丢失，建议用前面三种。

## 触发场景

skill 会在以下场景自动激活：
- 用户问 A 股某只股票能不能买（特别是半导体 / AI / 算力 / 国产替代相关）
- 用户问某个赛道有什么"隐形冠军"或"国产替代标的"
- 用户问"AI 算力上游 / 光通信 / 机器人 / 电力链 / 存储链"等产业链问题
- 用户提到"chokepoint / 卡脖子 / 供应链瓶颈"
- 用户想用 Serenity 视角看 A 股

## 三个工作流

详见 SKILL.md，简要说：
1. **评估单一标的** — 给出 A/B/C/D 四档判断（不是买卖建议）
2. **沿产业链反向找 chokepoint** — 从行业到候选名单
3. **复盘已有持仓** — 重审 thesis 是否成立

## ⚠️ 重要免责声明

1. **不是投资建议**。本 skill 仅做框架辅助和决策清单，不给买卖结论
2. **不下单、不调用券商接口**
3. **不替代用户的尽调**。任何标的在操作前必须看年报 / 公告 / 调研纪要 / 政策文件
4. **Serenity 的回报是自报、未审计、生存者偏差严重**
5. **跨市场移植有损耗**。Serenity 真正的护城河是技术背景，不是方法本身
6. **A 股政策权重远高于美股**。chokepoint 公司可能因政策一夜暴涨或暴跌
7. **T+1 + 涨跌停** 让美股原则中的"扛波动 / 加仓"逻辑必须重写，本 skill 已重写
8. **作者不对使用本 skill 产生的任何投资结果负责**

## 一些诚实的话

如果你完全照搬本 skill 而不做独立思考，那等于把决策权交给了一个
"Twitter 网红 + AI 黑盒 + 跨市场翻译"的三重不确定来源。

这套框架真正的价值不是给你答案，而是**让你问对问题**。
当你看完它之后还是觉得需要"直接告诉我买什么"，
请关掉这个 skill，去找一位真正持牌的投资顾问。

写于 2026 年 5 月。AI 算力周期已进入第三年扩张，
任何"显学型 chokepoint"都已经定价较充分，
寻找下一代真 chokepoint 的难度在上升。

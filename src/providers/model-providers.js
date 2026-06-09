export async function runModelProvider(provider, payload) {
  if (provider === "openai-compatible") {
    return callOpenAICompatible(payload);
  }

  if (provider === "custom-http") {
    return callCustomHttp(payload);
  }

  return {
    provider: "mock",
    text: "当前使用 mock 模型。接入模型后，这里会返回模型对 A/B/C/D 分层、风险项和验证清单的补充分析。"
  };
}

async function callOpenAICompatible({ prompt }) {
  const apiKey = process.env.MODEL_API_KEY;
  const baseUrl = process.env.MODEL_BASE_URL;
  const model = process.env.MODEL_NAME;

  if (!apiKey || !baseUrl || !model) {
    return missingConfig("openai-compatible", ["MODEL_API_KEY", "MODEL_BASE_URL", "MODEL_NAME"]);
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是谨慎的 A 股框架分析助手，必须遵守不提供买卖建议的边界。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    return { provider: "openai-compatible", error: await response.text() };
  }

  const data = await response.json();
  return {
    provider: "openai-compatible",
    model,
    text: data.choices?.[0]?.message?.content || ""
  };
}

async function callCustomHttp(payload) {
  const endpoint = process.env.MODEL_BASE_URL;
  const apiKey = process.env.MODEL_API_KEY;

  if (!endpoint) {
    return missingConfig("custom-http", ["MODEL_BASE_URL"]);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { "authorization": `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return { provider: "custom-http", error: await response.text() };
  }

  return {
    provider: "custom-http",
    text: await response.text()
  };
}

function missingConfig(provider, keys) {
  return {
    provider,
    error: `Missing environment variables: ${keys.join(", ")}`
  };
}

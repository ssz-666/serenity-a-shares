export async function runModelProvider(provider, payload) {
  if (provider === "chatgpt-main") {
    return callChatGPTMain(payload);
  }

  if (provider === "domestic-lite") {
    return callDomesticLite(payload);
  }

  if (provider === "openai-compatible") {
    return callOpenAICompatible(payload);
  }

  if (provider === "openai-compatible-lite") {
    return callOpenAICompatible(payload, {
      apiKeyEnv: "LITE_MODEL_API_KEY",
      baseUrlEnv: "LITE_MODEL_BASE_URL",
      modelEnv: "LITE_MODEL_NAME",
      provider: "openai-compatible-lite"
    });
  }

  if (provider === "custom-http") {
    return callCustomHttp(payload);
  }

  if (provider === "custom-http-lite") {
    return callCustomHttp(payload, {
      endpointEnv: "LITE_MODEL_BASE_URL",
      apiKeyEnv: "LITE_MODEL_API_KEY",
      provider: "custom-http-lite"
    });
  }

  return {
    provider: "mock",
    text: "当前使用 mock 模型。接入模型后，这里会返回模型对 A/B/C/D 分层、风险项和验证清单的补充分析。"
  };
}

async function callChatGPTMain(payload) {
  return callOpenAICompatible(payload, {
    apiKeyEnv: "CHATGPT_API_KEY",
    baseUrlEnv: "CHATGPT_BASE_URL",
    modelEnv: "CHATGPT_MODEL",
    provider: "chatgpt-main",
    fallbackBaseUrl: "https://api.openai.com/v1"
  });
}

async function callDomesticLite(payload) {
  return callOpenAICompatible(payload, {
    apiKeyEnv: "DOMESTIC_API_KEY",
    baseUrlEnv: "DOMESTIC_BASE_URL",
    modelEnv: "DOMESTIC_MODEL",
    provider: "domestic-lite"
  });
}

async function callOpenAICompatible({ prompt }, options = {}) {
  const provider = options.provider || "openai-compatible";
  const apiKeyEnv = options.apiKeyEnv || "MODEL_API_KEY";
  const baseUrlEnv = options.baseUrlEnv || "MODEL_BASE_URL";
  const modelEnv = options.modelEnv || "MODEL_NAME";
  const apiKey = process.env[apiKeyEnv];
  const baseUrl = process.env[baseUrlEnv] || options.fallbackBaseUrl;
  const model = process.env[modelEnv];

  if (!apiKey || !baseUrl || !model) {
    return missingConfig(provider, [apiKeyEnv, baseUrlEnv, modelEnv]);
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
    return { provider, error: await response.text() };
  }

  const data = await response.json();
  return {
    provider,
    model,
    text: data.choices?.[0]?.message?.content || ""
  };
}

async function callCustomHttp(payload, options = {}) {
  const provider = options.provider || "custom-http";
  const endpoint = process.env[options.endpointEnv || "MODEL_BASE_URL"];
  const apiKey = process.env[options.apiKeyEnv || "MODEL_API_KEY"];

  if (!endpoint) {
    return missingConfig(provider, [options.endpointEnv || "MODEL_BASE_URL"]);
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
    return { provider, error: await response.text() };
  }

  return {
    provider,
    text: await response.text()
  };
}

function missingConfig(provider, keys) {
  return {
    provider,
    error: `Missing environment variables: ${keys.join(", ")}`
  };
}

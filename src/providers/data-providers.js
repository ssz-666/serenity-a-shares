export async function getMarketSnapshot(symbols, provider = process.env.DATA_PROVIDER || "mock") {
  if (provider === "custom-http") {
    return callCustomData(symbols);
  }

  if (provider === "akshare-proxy") {
    return callAkshareProxy(symbols);
  }

  if (provider === "tushare") {
    return {
      provider,
      symbols,
      note: "Tushare adapter reserved. Add endpoint-specific calls after choosing the exact Tushare data modules."
    };
  }

  return {
    provider: "mock",
    symbols,
    rows: symbols.map((symbol) => ({
      symbol,
      status: "placeholder",
      note: "等待接入行情/财报/公告数据源"
    }))
  };
}

async function callCustomData(symbols) {
  const baseUrl = process.env.CUSTOM_DATA_BASE_URL;
  if (!baseUrl) return { provider: "custom-http", error: "Missing CUSTOM_DATA_BASE_URL" };

  const url = new URL(baseUrl);
  url.searchParams.set("symbols", symbols.join(","));
  const response = await fetch(url);
  return response.json();
}

async function callAkshareProxy(symbols) {
  const baseUrl = process.env.AKSHARE_BASE_URL;
  if (!baseUrl) return { provider: "akshare-proxy", error: "Missing AKSHARE_BASE_URL" };

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/market?symbols=${encodeURIComponent(symbols.join(","))}`);
  return response.json();
}

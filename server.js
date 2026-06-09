import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleAnalyze } from "./src/server/handlers.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(publicDir, requested));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/config") {
      sendJson(res, 200, {
        modelProviders: ["mock", "chatgpt-main", "domestic-lite", "openai-compatible", "openai-compatible-lite", "custom-http", "custom-http-lite"],
        dataProviders: ["mock", "tushare", "akshare-proxy", "custom-http"],
        note: "API keys are read from server environment variables only."
      });
      return;
    }

    if (url.pathname === "/api/analyze" && req.method === "POST") {
      const payload = await readJson(req);
      sendJson(res, 200, await handleAnalyze(payload));
      return;
    }

    if (url.pathname === "/api/market") {
      const symbols = (url.searchParams.get("symbols") || "").split(",").filter(Boolean);
      sendJson(res, 200, {
        provider: process.env.DATA_PROVIDER || "mock",
        symbols,
        message: "Market-data adapter placeholder. Connect Tushare, AkShare proxy, or a custom endpoint here."
      });
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}).listen(port, () => {
  console.log(`Serenity A-shares web app running at http://localhost:${port}`);
});

export function setCorsHeaders(res) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Site-Password");
    return;
  }

  const headers = res.headers || {};
  headers["access-control-allow-origin"] = process.env.ALLOWED_ORIGIN || "*";
  headers["access-control-allow-methods"] = "GET,POST,OPTIONS";
  headers["access-control-allow-headers"] = "Content-Type, X-Site-Password";
}

export function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCorsHeaders(res);
  res.status(204).end();
  return true;
}

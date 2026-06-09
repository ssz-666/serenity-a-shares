export function isAccessAllowed(reqLike = {}) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return true;

  const headers = reqLike.headers || {};
  const provided = readHeader(headers, "x-site-password") || reqLike.sitePassword;
  return provided === expected;
}

export function getAccessMode() {
  return process.env.SITE_PASSWORD ? "password" : "open";
}

function readHeader(headers, name) {
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] || headers[name.toLowerCase()];
}

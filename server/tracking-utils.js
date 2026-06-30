import crypto from "node:crypto";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(payload));
}

export function sendNoContent(response) {
  response.writeHead(204, { "Cache-Control": "no-store" });
  response.end();
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
  }

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getHeader(request, name) {
  const value = request.headers[name.toLowerCase()] || request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export function getClientIp(request) {
  const forwardedFor = getHeader(request, "x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || getHeader(request, "x-real-ip") || getHeader(request, "cf-connecting-ip") || request.socket?.remoteAddress || "";
}

export function maskIp(ipAddress) {
  if (!ipAddress) return "";

  if (ipAddress.includes(":")) {
    const parts = ipAddress.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}:xxxx:xxxx`;
  }

  const parts = ipAddress.split(".");
  if (parts.length !== 4) return ipAddress;
  return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
}

export function hashIp(ipAddress) {
  const secret = process.env.IP_HASH_SECRET || process.env.ADMIN_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing IP_HASH_SECRET");
  }

  return crypto.createHmac("sha256", secret).update(ipAddress).digest("hex");
}

export function getLocation(request) {
  const city = decodeHeader(getHeader(request, "x-vercel-ip-city"));
  const region = decodeHeader(getHeader(request, "x-vercel-ip-country-region"));
  const country = decodeHeader(getHeader(request, "x-vercel-ip-country"));
  const location = [city, region, country].filter(Boolean).join(", ");

  return {
    city,
    region,
    country,
    location: location || "Localisation inconnue"
  };
}

function decodeHeader(value = "") {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getDeviceType(userAgent = "") {
  const agent = userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(agent)) return "Tablette";
  if (/mobi|iphone|android.*mobile|windows phone/.test(agent)) return "Smartphone";
  if (/bot|crawler|spider|crawling/.test(agent)) return "Robot";
  return "Ordinateur";
}

export function getBrowser(userAgent = "") {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/chrome\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  return "Inconnu";
}

export async function supabaseRequest(path, options = {}) {
  const url = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function isAuthorized(request) {
  const token = process.env.ADMIN_TOKEN;
  const authHeader = getHeader(request, "authorization") || "";
  const candidate = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : getHeader(request, "x-admin-token") || "";

  if (!token || !candidate) return false;

  const expected = Buffer.from(token);
  const received = Buffer.from(candidate);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

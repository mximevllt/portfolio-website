import {
  getBrowser,
  getClientIp,
  getDeviceType,
  getHeader,
  getLocation,
  hashIp,
  maskIp,
  readJsonBody,
  sendJson,
  sendNoContent,
  supabaseRequest
} from "../server/tracking-utils.js";

function cleanString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const ipAddress = getClientIp(request);

    if (!ipAddress) {
      sendNoContent(response);
      return;
    }

    const now = new Date().toISOString();
    const userAgent = cleanString(getHeader(request, "user-agent"), 1200);
    const ipHash = hashIp(ipAddress);
    const ipMasked = maskIp(ipAddress);
    const storeRawIp = process.env.TRACK_STORE_RAW_IP === "true";
    const location = getLocation(request);
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const pagePath = cleanString(body.pagePath || body.path || "/", 320);
    const pageTitle = cleanString(body.pageTitle || body.title, 240);
    const referrer = cleanString(body.referrer, 500);
    const language = cleanString(body.language, 80);
    const timezone = cleanString(body.timezone, 120);
    const screenSize = cleanString(body.screenSize, 80);

    const existingRows = await supabaseRequest(`portfolio_visitors?ip_hash=eq.${encodeURIComponent(ipHash)}&select=id,visit_count`);
    const existing = Array.isArray(existingRows) ? existingRows[0] : null;
    const visitorPayload = {
      ip_hash: ipHash,
      ip_address: storeRawIp ? ipAddress : null,
      ip_masked: ipMasked,
      location_label: location.location,
      city: location.city || null,
      region: location.region || null,
      country: location.country || null,
      device_type: deviceType,
      browser,
      user_agent: userAgent,
      last_page_path: pagePath,
      last_page_title: pageTitle,
      last_referrer: referrer || null,
      language: language || null,
      timezone: timezone || null,
      screen_size: screenSize || null,
      last_seen: now
    };

    if (existing?.id) {
      await supabaseRequest(`portfolio_visitors?id=eq.${existing.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ...visitorPayload,
          visit_count: Number(existing.visit_count || 0) + 1
        })
      });
    } else {
      await supabaseRequest("portfolio_visitors", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ...visitorPayload,
          visit_count: 1,
          first_seen: now
        })
      });
    }

    await supabaseRequest("portfolio_visit_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        ip_hash: ipHash,
        ip_address: storeRawIp ? ipAddress : null,
        ip_masked: ipMasked,
        location_label: location.location,
        city: location.city || null,
        region: location.region || null,
        country: location.country || null,
        device_type: deviceType,
        browser,
        page_path: pagePath,
        page_title: pageTitle,
        referrer: referrer || null,
        language: language || null,
        timezone: timezone || null,
        screen_size: screenSize || null,
        user_agent: userAgent,
        visited_at: now
      })
    });

    sendNoContent(response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Tracking unavailable" });
  }
}

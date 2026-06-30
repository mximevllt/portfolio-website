import { isAuthorized, sendJson, supabaseRequest } from "../server/tracking-utils.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const url = new URL(request.url || "/api/admin-visits", "https://portfolio.local");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 250, 1), 500);
    const visitors = await supabaseRequest(`portfolio_visitors?select=*&order=last_seen.desc&limit=${limit}`);
    const events = await supabaseRequest("portfolio_visit_events?select=*&order=visited_at.desc&limit=50");
    const totalVisits = Array.isArray(visitors)
      ? visitors.reduce((total, visitor) => total + Number(visitor.visit_count || 0), 0)
      : 0;

    sendJson(response, 200, {
      generatedAt: new Date().toISOString(),
      totalVisitors: Array.isArray(visitors) ? visitors.length : 0,
      totalVisits,
      visitors: visitors || [],
      latestEvents: events || []
    });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Admin data unavailable" });
  }
}

import { isAuthorized, isExcludedTrackingSource, sendJson, supabaseRequest } from "../server/tracking-utils.js";

function isVisibleTrackingRow(row) {
  return !isExcludedTrackingSource({ city: row?.city, ipMasked: row?.ip_masked });
}

async function getAllEvents(path) {
  const batchSize = 1000;
  const events = [];
  let offset = 0;

  while (true) {
    const batch = await supabaseRequest(`${path}&limit=${batchSize}&offset=${offset}`);
    const rows = Array.isArray(batch) ? batch : [];
    events.push(...rows);
    if (rows.length < batchSize) return events;
    offset += rows.length;
  }
}

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
    const ipHash = url.searchParams.get("ipHash") || "";
    const includeJourneys = url.searchParams.get("includeJourneys") === "true";
    const allEvents = url.searchParams.get("allEvents") === "true";
    const defaultEventLimit = ipHash || includeJourneys || allEvents ? 1000 : 50;
    const eventLimit = Math.min(Math.max(Number(url.searchParams.get("eventLimit")) || defaultEventLimit, 1), 1000);
    const visitorRows = await supabaseRequest(`portfolio_visitors?select=*&order=last_seen.desc&limit=${limit}`);
    const eventFilter = ipHash
      ? `&ip_hash=eq.${encodeURIComponent(ipHash)}`
      : includeJourneys
        ? ""
        : "&event_type=neq.leave";
    const eventsPath = `portfolio_visit_events?select=*&order=visited_at.desc${eventFilter}`;
    const eventRows = allEvents
      ? await getAllEvents(eventsPath)
      : await supabaseRequest(`${eventsPath}&limit=${eventLimit}`);
    const visitors = (Array.isArray(visitorRows) ? visitorRows : []).filter(isVisibleTrackingRow);
    const events = (Array.isArray(eventRows) ? eventRows : []).filter(isVisibleTrackingRow);
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

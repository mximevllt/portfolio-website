const loginForm = document.querySelector("[data-admin-login]");
const tokenInput = document.querySelector("[data-admin-token]");
const logoutButton = document.querySelector("[data-admin-logout]");
const refreshButton = document.querySelector("[data-admin-refresh]");
const statusNode = document.querySelector("[data-admin-status]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const tableBody = document.querySelector("[data-admin-visitors]");
const eventsBody = document.querySelector("[data-admin-events]");
const totalVisitorsNode = document.querySelector("[data-total-visitors]");
const totalVisitsNode = document.querySelector("[data-total-visits]");
const updatedAtNode = document.querySelector("[data-updated-at]");

const tokenKey = "portfolio-admin-token";
let refreshTimer = 0;
let latestVisitsExpanded = false;
let journeysByIp = new Map();
let latestDashboardData = null;
let journeyRequestId = 0;
let dashboardRequestId = 0;
let journeysLoading = false;

function getToken() {
  return sessionStorage.getItem(tokenKey) || "";
}

function setStatus(message, tone = "neutral") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function clean(value) {
  return escapeHtml(value || "-");
}

function formatPagePath(value) {
  const pagePath = String(value || "");

  try {
    const url = new URL(pagePath, "https://portfolio.local");
    if (url.pathname === "/" || url.pathname === "/index.html") return "Accueil";
  } catch {
    // Keep the recorded value when it cannot be interpreted as a URL path.
  }

  return pagePath || "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "Durée non mesurée";
  const minutes = Math.floor(value / 60);
  const remaining = Math.round(value % 60);
  return minutes ? `${minutes} min ${String(remaining).padStart(2, "0")} s` : `${remaining} s`;
}

function renderJourney(ipHash) {
  if (journeysLoading && !journeysByIp.has(ipHash)) {
    return "<span>Chargement du parcours…</span>";
  }

  const events = [...(journeysByIp.get(ipHash) || [])].sort((a, b) => new Date(a.visited_at) - new Date(b.visited_at));
  const leaves = new Map(events.filter((event) => event.event_type === "leave" && event.page_session_id).map((event) => [event.page_session_id, event]));
  const pages = events.filter((event) => event.event_type !== "leave");
  if (!pages.length) return "<span>Pas encore de parcours enregistré</span>";
  return `<ol class="admin-journey">${pages.map((event) => {
    const leave = event.page_session_id ? leaves.get(event.page_session_id) : null;
    return `<li><span>${clean(formatPagePath(event.page_path))}</span><small>${formatDate(event.visited_at)} · ${formatDuration(leave?.duration_seconds)}</small></li>`;
  }).join("")}</ol>`;
}

function getLatestVisitors(data) {
  const visitors = new Map();
  for (const event of data.latestEvents || []) {
    if (event.event_type === "leave" || !event.ip_hash || visitors.has(event.ip_hash)) continue;
    visitors.set(event.ip_hash, event);
  }
  return [...visitors.values()];
}

async function loadJourneys(data, showStatus = true) {
  const requestId = ++journeyRequestId;
  const token = getToken();

  journeysLoading = true;
  if (showStatus) setStatus("Chargement des parcours…", "neutral");
  renderRows(data);

  try {
    const response = await fetch("/api/admin-visits?includeJourneys=true&allEvents=true", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Impossible de charger les parcours.");
    const journeyData = await response.json();
    const journeys = new Map();
    for (const event of journeyData.latestEvents || []) {
      if (!event.ip_hash) continue;
      const events = journeys.get(event.ip_hash) || [];
      events.push(event);
      journeys.set(event.ip_hash, events);
    }

    if (requestId !== journeyRequestId) return;
    journeysByIp = journeys;
    journeysLoading = false;
    if (latestVisitsExpanded) renderRows(latestDashboardData || data);
    setStatus("Parcours affichés. Les durées sont mesurées pour les nouvelles visites.", "success");
  } catch (error) {
    if (requestId !== journeyRequestId) return;
    journeysLoading = false;
    if (latestVisitsExpanded) renderRows(latestDashboardData || data);
    setStatus("Impossible de charger les parcours.", "error");
    throw error;
  }
}

async function toggleLatestVisits() {
  if (!latestDashboardData) return;

  latestVisitsExpanded = !latestVisitsExpanded;
  if (!latestVisitsExpanded) {
    journeyRequestId += 1;
    journeysLoading = false;
    renderRows(latestDashboardData);
    setStatus("Tableau à jour.", "success");
    return;
  }

  await loadJourneys(latestDashboardData);
}

function renderRows(data) {
  totalVisitorsNode.textContent = String(data.totalVisitors || 0);
  totalVisitsNode.textContent = String(data.totalVisits || 0);
  updatedAtNode.textContent = formatDate(data.generatedAt);

  tableBody.innerHTML = (data.visitors || [])
    .map((visitor) => {
      const ip = escapeHtml(visitor.ip_address || visitor.ip_masked || "-");
      return `
        <tr>
          <td>${clean(visitor.location_label)}</td>
          <td>${ip}</td>
          <td>${visitor.visit_count || 0}</td>
          <td>${clean(visitor.device_type)}</td>
          <td>${clean(visitor.browser)}</td>
          <td>${clean(formatPagePath(visitor.last_page_path))}</td>
          <td>${formatDate(visitor.last_seen)}</td>
        </tr>
      `;
    })
    .join("");

  const eventsTable = eventsBody.closest("table");
  const pageHeading = eventsTable.querySelector("thead th:last-child");
  pageHeading.innerHTML = `<button type="button" class="admin-journey-toggle" data-admin-latest-toggle>${latestVisitsExpanded ? "Pages visitées" : "Page"}</button>`;
  const eventRows = latestVisitsExpanded ? getLatestVisitors(data) : (data.latestEvents || []);
  eventsBody.innerHTML = eventRows
    .map((event) => `
        <tr>
          <td>${formatDate(event.visited_at)}</td>
          <td>${clean(event.location_label)}</td>
          <td>${escapeHtml(event.ip_address || event.ip_masked || "-")}</td>
          <td>${clean(event.device_type)}</td>
          <td class="admin-journey-cell">${latestVisitsExpanded ? renderJourney(event.ip_hash) : clean(formatPagePath(event.page_path))}</td>
        </tr>
      `
    )
    .join("");
  eventsTable.querySelector("[data-admin-latest-toggle]")?.addEventListener("click", () => {
    toggleLatestVisits().catch(() => {});
  });
}

async function loadDashboard() {
  const token = getToken();
  if (!token) return;
  const requestId = ++dashboardRequestId;

  setStatus("Actualisation des visites...", "neutral");

  const response = await fetch("/api/admin-visits?allEvents=true", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem(tokenKey);
      dashboard.hidden = true;
      loginForm.hidden = false;
      setStatus("Token admin invalide.", "error");
      return;
    }

    throw new Error("Impossible de charger les visites.");
  }

  const data = await response.json();
  if (requestId !== dashboardRequestId) return;
  latestDashboardData = data;
  loginForm.hidden = true;
  dashboard.hidden = false;
  renderRows(data);
  if (latestVisitsExpanded) {
    await loadJourneys(data, false);
  } else {
    setStatus(`${data.latestEvents.length} visites affichées.`, "success");
  }
}

function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = window.setInterval(() => {
    loadDashboard().catch(() => setStatus("Actualisation impossible pour le moment.", "error"));
  }, 15000);
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = tokenInput.value.trim();
  if (!token) return;

  sessionStorage.setItem(tokenKey, token);
  loadDashboard()
    .then(startAutoRefresh)
    .catch(() => setStatus("Connexion impossible pour le moment.", "error"));
});

logoutButton?.addEventListener("click", () => {
  sessionStorage.removeItem(tokenKey);
  clearInterval(refreshTimer);
  dashboardRequestId += 1;
  journeyRequestId += 1;
  latestDashboardData = null;
  latestVisitsExpanded = false;
  journeysByIp = new Map();
  journeysLoading = false;
  dashboard.hidden = true;
  loginForm.hidden = false;
  setStatus("Session admin fermée.", "neutral");
});

refreshButton?.addEventListener("click", () => {
  loadDashboard().catch(() => setStatus("Actualisation impossible pour le moment.", "error"));
});

if (getToken()) {
  loadDashboard()
    .then(startAutoRefresh)
    .catch(() => setStatus("Connexion impossible pour le moment.", "error"));
}

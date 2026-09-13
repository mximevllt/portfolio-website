(() => {
  const endpoint = "/api/track-visit";

  if (window.location.pathname.endsWith("/admin.html")) {
    return;
  }

  const pageSessionId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const startedAt = Date.now();
  let visibleSince = document.visibilityState === "visible" ? startedAt : null;
  let visibleDurationMs = 0;
  let leaveSent = false;

  function getPagePath() {
    const { pathname, search, hash } = window.location;
    const canonicalPathname = pathname === "/index.html" ? "/" : pathname;
    return `${canonicalPathname}${search}${hash}`;
  }

  const payload = {
    pagePath: getPagePath(),
    pageTitle: document.title,
    referrer: document.referrer,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenSize: `${window.screen.width}x${window.screen.height}`
  };

  function send(payloadToSend) {
    const body = JSON.stringify(payloadToSend);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      try {
        if (navigator.sendBeacon(endpoint, blob)) return;
      } catch {
        // Fall back to fetch below when the browser cannot queue the beacon.
      }
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }

  send({ ...payload, eventType: "view", pageSessionId });

  function sendLeave() {
    if (leaveSent) return;
    leaveSent = true;
    if (visibleSince) visibleDurationMs += Date.now() - visibleSince;
    send({
      ...payload,
      eventType: "leave",
      pageSessionId,
      durationSeconds: Math.max(0, Math.round(visibleDurationMs / 1000))
    });
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest?.("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

    const destination = new URL(link.href, window.location.href);
    const leavesCurrentPage = destination.origin !== window.location.origin
      || destination.pathname !== window.location.pathname
      || destination.search !== window.location.search;

    if (leavesCurrentPage) sendLeave();
  }, { capture: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && visibleSince) {
      visibleDurationMs += Date.now() - visibleSince;
      visibleSince = null;
    } else if (document.visibilityState === "visible" && !visibleSince) {
      visibleSince = Date.now();
    }
  });

  window.addEventListener("pagehide", () => {
    sendLeave();
  });
})();

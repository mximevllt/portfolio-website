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

  const payload = {
    pagePath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
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
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }

  send({ ...payload, eventType: "view", pageSessionId });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && visibleSince) {
      visibleDurationMs += Date.now() - visibleSince;
      visibleSince = null;
    } else if (document.visibilityState === "visible" && !visibleSince) {
      visibleSince = Date.now();
    }
  });

  window.addEventListener("pagehide", () => {
    if (leaveSent) return;
    leaveSent = true;
    if (visibleSince) visibleDurationMs += Date.now() - visibleSince;
    send({
      ...payload,
      eventType: "leave",
      pageSessionId,
      durationSeconds: Math.max(0, Math.round(visibleDurationMs / 1000))
    });
  });
})();

(() => {
  const endpoint = "/api/track-visit";

  if (window.location.pathname.endsWith("/admin.html")) {
    return;
  }

  const payload = {
    pagePath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    pageTitle: document.title,
    referrer: document.referrer,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenSize: `${window.screen.width}x${window.screen.height}`
  };

  const body = JSON.stringify(payload);

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
})();

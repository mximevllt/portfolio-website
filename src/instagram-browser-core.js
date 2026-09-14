export function detectInstagramBrowser({ userAgent = "", platform = "", maxTouchPoints = 0 } = {}) {
  const ua = String(userAgent);
  const isInstagram = /Instagram/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const isTouchIPad = platform === "MacIntel" && Number(maxTouchPoints) > 1;
  const isIOS = isIOSDevice || isTouchIPad;

  return {
    isInstagramMobile: isInstagram && (isIOS || isAndroid),
    platform: isIOS ? "ios" : isAndroid ? "android" : null
  };
}

export function buildIOSExternalURL(currentURL) {
  return `instagram://extbrowser/?url=${encodeURIComponent(new URL(currentURL).href)}`;
}

export function buildAndroidIntent(currentURL) {
  const url = new URL(currentURL);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const scheme = url.protocol.slice(0, -1);
  const fullAddress = url.href.replace(/^https?:\/\//i, "");

  return `intent://${fullAddress}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
}

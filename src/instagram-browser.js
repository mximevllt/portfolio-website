import {
  buildAndroidIntent,
  buildIOSExternalURL,
  detectInstagramBrowser
} from "./instagram-browser-core.js";

const DISMISSED_KEY = "instagram-browser-prompt-dismissed";

function wasPromptDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberPromptDismissal() {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Some in-app browsers can disable storage. Closing still works for this page.
  }
}

function createPrompt(platform, currentURL) {
  const wrapper = document.createElement("div");
  const buttonLabel = platform === "ios" ? "Ouvrir dans Safari" : "Ouvrir dans le navigateur";
  const fallbackText = platform === "ios"
    ? "Si rien ne se passe, appuyez sur ••• puis sur « Ouvrir dans Safari »."
    : "Si rien ne se passe, utilisez le menu ••• d’Instagram puis choisissez « Ouvrir dans le navigateur ».";

  wrapper.className = "instagram-browser-prompt";
  wrapper.innerHTML = `
    <section class="instagram-browser-prompt__panel" role="dialog" aria-modal="true" aria-labelledby="instagram-browser-title" aria-describedby="instagram-browser-description">
      <button class="instagram-browser-prompt__close" type="button" aria-label="Fermer cette instruction">×</button>
      <p class="instagram-browser-prompt__eyebrow">Navigation</p>
      <h2 id="instagram-browser-title">Ouvrir dans votre navigateur</h2>
      <p id="instagram-browser-description" class="instagram-browser-prompt__description">Vous consultez actuellement ce site depuis Instagram. Pour profiter de l’expérience complète, ouvrez-le dans votre navigateur.</p>
      <button class="instagram-browser-prompt__action" type="button">${buttonLabel}</button>
      <p class="instagram-browser-prompt__fallback" tabindex="-1" aria-live="polite">${fallbackText}</p>
    </section>
  `;

  const closeButton = wrapper.querySelector(".instagram-browser-prompt__close");
  const actionButton = wrapper.querySelector(".instagram-browser-prompt__action");
  const fallback = wrapper.querySelector(".instagram-browser-prompt__fallback");
  let fallbackTimer = 0;

  function closePrompt() {
    window.clearTimeout(fallbackTimer);
    rememberPromptDismissal();
    document.removeEventListener("keydown", handleKeydown);
    document.body.classList.remove("instagram-browser-prompt-open");
    wrapper.remove();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") closePrompt();
  }

  closeButton.addEventListener("click", closePrompt);
  document.addEventListener("keydown", handleKeydown);

  actionButton.addEventListener("click", () => {
    const externalURL = platform === "ios"
      ? buildIOSExternalURL(currentURL)
      : buildAndroidIntent(currentURL);

    if (!externalURL) {
      wrapper.classList.add("is-fallback-visible");
      return;
    }

    actionButton.disabled = true;
    wrapper.classList.remove("is-fallback-visible");

    fallbackTimer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        wrapper.classList.add("is-fallback-visible");
        actionButton.disabled = false;
        fallback.focus({ preventScroll: true });
      }
    }, 1400);

    window.location.href = externalURL;
  });

  document.body.append(wrapper);
  document.body.classList.add("instagram-browser-prompt-open");
  actionButton.focus({ preventScroll: true });
}

function initialiseInstagramBrowserPrompt() {
  if (wasPromptDismissed()) return;

  const detection = detectInstagramBrowser({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints
  });

  if (!detection.isInstagramMobile || !detection.platform) return;

  createPrompt(detection.platform, window.location.href);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseInstagramBrowserPrompt, { once: true });
} else {
  initialiseInstagramBrowserPrompt();
}

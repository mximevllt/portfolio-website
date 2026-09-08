const page = document.querySelector("#gasqui-page");

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function initPlan() {
  const section = document.querySelector(".plan-section");
  const heading = document.querySelector(".plan-heading");
  const story = document.querySelector(".plan-story");
  const frame = document.querySelector(".plan-frame");
  const steps = [...document.querySelectorAll(".plan-step")];
  if (!section || !heading || !story || !frame || !steps.length) return;

  story.id = "plan-details";
  story.hidden = true;
  heading.innerHTML = `
    <button class="plan-toggle" type="button" aria-expanded="false" aria-controls="plan-details">
      <span>Le Plan détaillé</span>
      <small>Cliquer pour dérouler les détails d’aménagement structurels du projet</small>
      <b aria-hidden="true">+</b>
    </button>`;
  section.classList.add("plan-collapsible");
  const toggle = heading.querySelector(".plan-toggle");
  let isTimelineReady = false;

  const startTimeline = () => {
    if (isTimelineReady) return;
    isTimelineReady = true;
    const setPhase = (step) => {
      const phase = step.dataset.phase;
      frame.className = `plan-frame phase-${phase}`;
      steps.forEach((item) => item.classList.toggle("active", item === step));
    };

    steps.forEach((step) => step.addEventListener("click", () => setPhase(step)));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setPhase(entry.target)),
      { rootMargin: "-32% 0px -52% 0px", threshold: 0 }
    );
    steps.forEach((step) => observer.observe(step));
  };

  toggle.addEventListener("click", () => {
    const isOpen = story.hidden;
    story.hidden = !isOpen;
    section.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) requestAnimationFrame(startTimeline);
  });
}

function initImageSwitches() {
  const setup = ({ frameSelector, switchSelector, states, hoverState, defaultState, labels }) => {
    const frame = document.querySelector(frameSelector);
    const controls = [...document.querySelectorAll(`${switchSelector} button`)];
    if (!frame || !controls.length) return;

    // The source markup carries inline opacity values. Remove them so the
    // state classes can control the cross-fade consistently.
    frame.querySelectorAll("img").forEach((image) => image.style.removeProperty("opacity"));

    const caption = frame.querySelector("figcaption span");
    const setState = (state) => {
      frame.className = `${frameSelector.slice(1)} is-${state}`;
      controls.forEach((button, index) => {
        const isActive = states[index] === state;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      if (caption) caption.textContent = labels[state];
    };

    controls.forEach((control, index) => {
      control.addEventListener("click", () => setState(states[index]));
    });

    frame.addEventListener("pointerenter", () => setState(hoverState));
    frame.addEventListener("pointerleave", () => setState(defaultState));
    setState(defaultState);
  };
  setup({
    frameSelector: ".lights-frame",
    switchSelector: ".light-switch",
    states: ["day", "night"],
    defaultState: "day",
    hoverState: "night",
    labels: { day: "Le jour", night: "La nuit" }
  });
  setup({
    frameSelector: ".shelter-frame",
    switchSelector: ".shelter-switch",
    states: ["summer", "winter"],
    defaultState: "summer",
    hoverState: "winter",
    labels: { summer: "L’été", winter: "L’hiver" }
  });
}

function initMenu() {
  const menuButton = document.querySelector(".menu-button");
  const navigation = document.querySelector("#main-navigation");
  if (!menuButton || !navigation) return;
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => navigation.classList.remove("open")));
}

function animateStats() {
  const stats = [...document.querySelectorAll(".stat > span")];
  const targets = [421, 190];
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = "true";
      const index = stats.indexOf(entry.target);
      const target = targets[index];
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 1150);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        entry.target.innerHTML = index === 1 ? `<small>≈</small>${value}` : `${value} m²`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }),
    { threshold: 0.5 }
  );
  stats.forEach((stat) => observer.observe(stat));
}

async function loadProject() {
  const response = await fetch("/assets/gasqui/page.html");
  if (!response.ok) throw new Error("La page Château Gasqui n’a pas pu être chargée.");
  page.innerHTML = await response.text();
  page.removeAttribute("aria-busy");
  document.querySelector(".hero-arc")?.remove();
  document.querySelector(".hero-visual")?.remove();
  document.querySelector(".hero")?.classList.add("hero-copy-only");
  document.querySelector(".plan-legend")?.remove();
  document.querySelector(".final-copy")?.remove();
  document.querySelector(".final-section")?.classList.add("plan-download-only");
  document.querySelector(".brand")?.setAttribute("href", "/index.html#projets");
  revealOnScroll();
  initPlan();
  initImageSwitches();
  initMenu();
  animateStats();
}

loadProject().catch((error) => {
  page.removeAttribute("aria-busy");
  page.textContent = error.message;
});

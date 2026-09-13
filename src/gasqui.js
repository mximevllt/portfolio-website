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

function updateProjectCopy() {
  const visionTitle = document.querySelector(".vision-grid h2");
  if (visionTitle) {
    visionTitle.innerHTML = "De l’auto-cueillette germanique<br><em>à un paysage provençal.</em>";
  }

  const cortenCopy = document.querySelector(".corten-story .detail-copy");
  if (!cortenCopy) return;

  const title = cortenCopy.querySelector("h3");
  if (title) title.innerHTML = "Des bordures nettes<br><em>pour les massifs.</em>";

  const paragraphs = [...cortenCopy.querySelectorAll(":scope > p:not(.detail-index)")];
  if (paragraphs[0]) {
    paragraphs[0].textContent =
      "Des bordures en acier corten séparent les chemins en clapissette des plantations. Posées au ras du sol, elles maintiennent la terre et le paillage en place et empêchent les matériaux de se mélanger.";
  }
  if (paragraphs[1]) {
    paragraphs[1].textContent =
      "Elles suivent les courbes du plan et donnent aux massifs une limite propre et régulière. Leur finition oxydée s’accorde simplement avec la terre cuite et les sols minéraux du jardin.";
  }
  paragraphs.slice(2).forEach((paragraph) => paragraph.remove());
  cortenCopy.querySelector(".detail-note")?.remove();
}

function initAnimationReplays() {
  document
    .querySelectorAll(".garland-plan figcaption button, .mirror-plan figcaption button")
    .forEach((button) => {
      button.type = "button";
      button.addEventListener("click", () => {
        const animation = button.closest(".garland-plan, .mirror-plan");
        if (!animation) return;
        animation.classList.remove("is-visible");
        void animation.offsetWidth;
        requestAnimationFrame(() => animation.classList.add("is-visible"));
      });
    });
}

function initZones() {
  const selector = document.querySelector(".zone-selector");
  const feature = document.querySelector(".zone-feature");
  if (!selector || !feature) return;

  const zones = [
    {
      image: "/assets/gasqui/plants/mediterraneennes-lavande-vraie.jpg",
      alt: "Jardin provençal",
      caption: "Senteurs · argent · lumière",
      kicker: "01 — La mémoire du lieu",
      title: "Jardin provençal",
      description:
        "Une scène sèche et lumineuse où les feuillages gris, les ombelles et les parfums familiers répondent à la pierre. La palette privilégie les plantes sobres, capables d’installer une présence généreuse avec peu d’eau.",
      facts: ["Lavande vraie", "Fenouil sauvage", "Orlaya grandiflora", "Immortelles"]
    },
    {
      image: "/assets/gasqui/key-elements/terrasse-terre-cuite.jpg",
      alt: "Espace central du jardin",
      caption: "Terrasse · ombre · partage",
      kicker: "02 — Le cœur du jardin",
      title: "Espace central",
      description:
        "La dalle existante devient le point de rencontre du jardin. Les arbres taillés apportent l’ombre, les terrasses accueillent les pauses et les différents chemins se rejoignent autour de cet espace commun.",
      facts: ["Terre cuite", "Table commune", "Arbres taillés", "Départ des promenades"]
    },
    {
      image: "/assets/gasqui/plants/exotiques-kniphofia.jpg",
      alt: "Jardin exotique",
      caption: "Silhouettes · couleurs · contraste",
      kicker: "03 — Le contrepoint",
      title: "Jardin exotique",
      description:
        "Une allée plus directe mène vers la serre au milieu de feuillages graphiques et de floraisons franches. Les espèces sont choisies pour leur aspect dépaysant et leur adaptation au climat provençal.",
      facts: ["Kniphofia", "Agapanthe", "Grevillea", "Callistemon"]
    },
    {
      image: "/assets/gasqui/key-elements/fontaine-loin.jpg",
      alt: "Restanque herborée",
      caption: "Fontaine · culture · belvédère",
      kicker: "04 — Le jardin utile",
      title: "Restanque herborée",
      description:
        "La restanque rassemble les plantes utiles et médicinales autour de la fontaine ancienne. Une terrasse en bois domine le jardin et offre un point d’arrêt au-dessus des zones de culture.",
      facts: ["Ortie", "Consoude", "Camomille", "Achillée millefeuille"]
    }
  ];

  const buttons = [...selector.querySelectorAll("button")];
  const render = (index) => {
    const zone = zones[index];
    if (!zone) return;
    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
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

function updateProjectCopy() {
  const visionTitle = document.querySelector(".vision-grid h2");
  if (visionTitle) {
    visionTitle.innerHTML = "De l’auto-cueillette germanique<br><em>à un paysage provençal.</em>";
  }

  const cortenCopy = document.querySelector(".corten-story .detail-copy");
  if (!cortenCopy) return;

  const title = cortenCopy.querySelector("h3");
  if (title) title.innerHTML = "Des bordures nettes<br><em>pour les massifs.</em>";

  const paragraphs = [...cortenCopy.querySelectorAll(":scope > p:not(.detail-index)")];
  if (paragraphs[0]) {
    paragraphs[0].textContent =
      "Des bordures en acier corten séparent les chemins en clapissette des plantations. Posées au ras du sol, elles maintiennent la terre et le paillage en place et empêchent les matériaux de se mélanger.";
  }
  if (paragraphs[1]) {
    paragraphs[1].textContent =
      "Elles suivent les courbes du plan et donnent aux massifs une limite propre et régulière. Leur finition oxydée s’accorde simplement avec la terre cuite et les sols minéraux du jardin.";
  }
  paragraphs.slice(2).forEach((paragraph) => paragraph.remove());
  cortenCopy.querySelector(".detail-note")?.remove();
}

function initAnimationReplays() {
  document
    .querySelectorAll(".garland-plan figcaption button, .mirror-plan figcaption button")
    .forEach((button) => {
      button.type = "button";
      button.addEventListener("click", () => {
        const animation = button.closest(".garland-plan, .mirror-plan");
        if (!animation) return;
        animation.classList.remove("is-visible");
        void animation.offsetWidth;
        requestAnimationFrame(() => animation.classList.add("is-visible"));
      });
    });
}

function initZones() {
  const selector = document.querySelector(".zone-selector");
  const feature = document.querySelector(".zone-feature");
  if (!selector || !feature) return;

  const zones = [
    {
      image: "/assets/gasqui/plants/mediterraneennes-lavande-vraie.jpg",
      alt: "Jardin provençal",
      caption: "Senteurs · argent · lumière",
      kicker: "01 — La mémoire du lieu",
      title: "Jardin provençal",
      description:
        "Une scène sèche et lumineuse où les feuillages gris, les ombelles et les parfums familiers répondent à la pierre. La palette privilégie les plantes sobres, capables d’installer une présence généreuse avec peu d’eau.",
      facts: ["Lavande vraie", "Fenouil sauvage", "Orlaya grandiflora", "Immortelles"]
    },
    {
      image: "/assets/gasqui/key-elements/terrasse-terre-cuite.jpg",
      alt: "Espace central du jardin",
      caption: "Terrasse · ombre · partage",
      kicker: "02 — Le cœur du jardin",
      title: "Espace central",
      description:
        "La dalle existante devient le point de rencontre du jardin. Les arbres taillés apportent l’ombre, les terrasses accueillent les pauses et les différents chemins se rejoignent autour de cet espace commun.",
      facts: ["Terre cuite", "Table commune", "Arbres taillés", "Départ des promenades"]
    },
    {
      image: "/assets/gasqui/plants/exotiques-kniphofia.jpg",
      alt: "Jardin exotique",
      caption: "Silhouettes · couleurs · contraste",
      kicker: "03 — Le contrepoint",
      title: "Jardin exotique",
      description:
        "Une allée plus directe mène vers la serre au milieu de feuillages graphiques et de floraisons franches. Les espèces sont choisies pour leur aspect dépaysant et leur adaptation au climat provençal.",
      facts: ["Kniphofia", "Agapanthe", "Grevillea", "Callistemon"]
    },
    {
      image: "/assets/gasqui/key-elements/fontaine-loin.jpg",
      alt: "Restanque herborée",
      caption: "Fontaine · culture · belvédère",
      kicker: "04 — Le jardin utile",
      title: "Restanque herborée",
      description:
        "La restanque rassemble les plantes utiles et médicinales autour de la fontaine ancienne. Une terrasse en bois domine le jardin et offre un point d’arrêt au-dessus des zones de culture.",
      facts: ["Ortie", "Consoude", "Camomille", "Achillée millefeuille"]
    }
  ];

  const buttons = [...selector.querySelectorAll("button")];
  const render = (index) => {
    const zone = zones[index];
    if (!zone) return;
    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    feature.innerHTML = `
      <figure>
        <img src="${zone.image}" alt="${zone.alt}">
        <figcaption>${zone.caption}</figcaption>
      </figure>
      <div class="zone-content">
        <p class="kicker">${zone.kicker}</p>
        <h3>${zone.title}</h3>
        <p class="zone-description">${zone.description}</p>
        <div class="zone-facts">${zone.facts.map((fact) => `<span>${fact}</span>`).join("")}</div>
        <a href="#palette" class="text-link"><span>Explorer sa palette</span><b>↓</b></a>
      </div>`;
  };

  buttons.forEach((button, index) => {
    button.type = "button";
    button.addEventListener("click", () => render(index));
  });
  render(0);
}

function initPlantFilters() {
  const buttons = [...document.querySelectorAll(".filters button")];
  const cards = [...document.querySelectorAll(".plant-card")];
  if (!buttons.length || !cards.length) return;

  const normalize = (value) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

  buttons.forEach((button) => {
    button.type = "button";
    button.addEventListener("click", () => {
      const selectedCategory = normalize(button.firstChild?.textContent || "");
      let visibleIndex = 0;
      cards.forEach((card) => {
        const cardCategory = normalize(card.querySelector(":scope > p")?.textContent || "");
        const isVisible = selectedCategory === "toutes" || cardCategory === selectedCategory;
        card.hidden = !isVisible;
        if (isVisible) {
          card.style.animationDelay = `${(visibleIndex % 6) * 45}ms`;
          visibleIndex += 1;
        }
      });
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
    });
  });
}

function initPlantCards() {
  const floweringPeriods = new Map([
    ["Amelanchier ovalis", "Avril à mai"],
    ["Arbutus unedo", "Octobre à janvier"],
    ["Cotinus coggygria", "Juin à juillet"],
    ["Cupressus sempervirens", "Mars à avril"],
    ["Viburnum tinus", "Novembre à avril"],
    ["Olea europaea", "Mai à juin"],
    ["Pyrus spinosa", "Mars à avril"],
    ["Tamarix gallica", "Mai à juin"],
    ["Salvia pratensis", "Mai à juillet"],
    ["Centranthus ruber", "Avril à octobre"],
    ["Echinops ritro", "Juillet à septembre"],
    ["Foeniculum vulgare", "Juillet à septembre"],
    ["Helichrysum stoechas", "Juin à septembre"],
    ["Lavandula angustifolia", "Juin à août"],
    ["Leucanthemum vulgare", "Juin à septembre"],
    ["Narcissus tazetta", "Février à avril"],
    ["Orlaya grandiflora", "Avril à juin"],
    ["Scabiosa columbaria", "Juin à octobre"],
    ["Agapanthus africanus", "Juin à août"],
    ["Callistemon citrinus", "Avril à juillet"],
    ["Oenothera lindheimeri", "Juin à octobre"],
    ["Punica granatum", "Mai à juillet"],
    ["Grevillea rosmarinifolia", "Printemps et automne"],
    ["Kniphofia uvaria", "Juin à septembre"],
    ["Lagerstroemia indica", "Juillet à octobre"],
    ["Leucadendron salignum", "Janvier à avril"],
    ["Leonotis leonurus", "Août à novembre"],
    ["Perovskia atriplicifolia", "Juillet à octobre"],
    ["Salvia greggii", "Mai à octobre"]
  ]);

  const openPlantCard = (card) => {
    const name = card.querySelector("h3")?.textContent?.trim();
    const latinName = card.querySelector(":scope > i")?.textContent?.trim();
    const category = card.querySelector(":scope > p")?.textContent?.trim();
    const image = card.querySelector("img");
    if (!name || !latinName || !category || !image) return;

    const modal = document.createElement("div");
    modal.className = "plant-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", `Fiche plante : ${name}`);
    modal.innerHTML = `
      <button class="modal-close" type="button" aria-label="Fermer la fiche de ${name}">×</button>
      <article>
        <figure><img src="${image.currentSrc || image.src}" alt="${image.alt}"></figure>
        <div>
          <p class="kicker">${category}</p>
          <h2>${name}</h2>
          <i>${latinName}</i>
          <p>Cette plante fait partie de la palette végétale proposée pour le projet Château Gasqui.</p>
          <span>Floraison · ${floweringPeriods.get(latinName) || "Période à préciser"}</span>
        </div>
      </article>`;

    const close = () => {
      modal.remove();
      document.removeEventListener("keydown", onKeydown);
      card.focus();
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") close();
    };

    modal.querySelector(".modal-close")?.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", onKeydown);
    document.body.append(modal);
    modal.querySelector(".modal-close")?.focus();
  };

  document.querySelectorAll(".plant-card").forEach((card) => {
    card.addEventListener("click", () => openPlantCard(card));
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
  updateProjectCopy();
  revealOnScroll();
  initPlan();
  initImageSwitches();
  initAnimationReplays();
  initZones();
  initPlantFilters();
  initPlantCards();
  initMenu();
  animateStats();
}

loadProject().catch((error) => {
  page.removeAttribute("aria-busy");
  page.textContent = error.message;
});
    });
    feature.innerHTML = `
      <figure>
        <img src="${zone.image}" alt="${zone.alt}">
        <figcaption>${zone.caption}</figcaption>
      </figure>
      <div class="zone-content">
        <p class="kicker">${zone.kicker}</p>
        <h3>${zone.title}</h3>
        <p class="zone-description">${zone.description}</p>
        <div class="zone-facts">${zone.facts.map((fact) => `<span>${fact}</span>`).join("")}</div>
        <a href="#palette" class="text-link"><span>Explorer sa palette</span><b>↓</b></a>
      </div>`;
  };

  buttons.forEach((button, index) => {
    button.type = "button";
    button.addEventListener("click", () => render(index));
  });
  render(0);
}

function initPlantFilters() {
  const buttons = [...document.querySelectorAll(".filters button")];
  const cards = [...document.querySelectorAll(".plant-card")];
  if (!buttons.length || !cards.length) return;

  const normalize = (value) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

  buttons.forEach((button) => {
    button.type = "button";
    button.addEventListener("click", () => {
      const selectedCategory = normalize(button.firstChild?.textContent || "");
      let visibleIndex = 0;
      cards.forEach((card) => {
        const cardCategory = normalize(card.querySelector(":scope > p")?.textContent || "");
        const isVisible = selectedCategory === "toutes" || cardCategory === selectedCategory;
        card.hidden = !isVisible;
        if (isVisible) {
          card.style.animationDelay = `${(visibleIndex % 6) * 45}ms`;
          visibleIndex += 1;
        }
      });
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
    });
  });
}

function initPlantCards() {
  const floweringPeriods = new Map([
    ["Amelanchier ovalis", "Avril à mai"],
    ["Arbutus unedo", "Octobre à janvier"],
    ["Cotinus coggygria", "Juin à juillet"],
    ["Cupressus sempervirens", "Mars à avril"],
    ["Viburnum tinus", "Novembre à avril"],
    ["Olea europaea", "Mai à juin"],
    ["Pyrus spinosa", "Mars à avril"],
    ["Tamarix gallica", "Mai à juin"],
    ["Salvia pratensis", "Mai à juillet"],
    ["Centranthus ruber", "Avril à octobre"],
    ["Echinops ritro", "Juillet à septembre"],
    ["Foeniculum vulgare", "Juillet à septembre"],
    ["Helichrysum stoechas", "Juin à septembre"],
    ["Lavandula angustifolia", "Juin à août"],
    ["Leucanthemum vulgare", "Juin à septembre"],
    ["Narcissus tazetta", "Février à avril"],
    ["Orlaya grandiflora", "Avril à juin"],
    ["Scabiosa columbaria", "Juin à octobre"],
    ["Agapanthus africanus", "Juin à août"],
    ["Callistemon citrinus", "Avril à juillet"],
    ["Oenothera lindheimeri", "Juin à octobre"],
    ["Punica granatum", "Mai à juillet"],
    ["Grevillea rosmarinifolia", "Printemps et automne"],
    ["Kniphofia uvaria", "Juin à septembre"],
    ["Lagerstroemia indica", "Juillet à octobre"],
    ["Leucadendron salignum", "Janvier à avril"],
    ["Leonotis leonurus", "Août à novembre"],
    ["Perovskia atriplicifolia", "Juillet à octobre"],
    ["Salvia greggii", "Mai à octobre"]
  ]);

  const openPlantCard = (card) => {
    const name = card.querySelector("h3")?.textContent?.trim();
    const latinName = card.querySelector(":scope > i")?.textContent?.trim();
    const category = card.querySelector(":scope > p")?.textContent?.trim();
    const image = card.querySelector("img");
    if (!name || !latinName || !category || !image) return;

    const modal = document.createElement("div");
    modal.className = "plant-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", `Fiche plante : ${name}`);
    modal.innerHTML = `
      <button class="modal-close" type="button" aria-label="Fermer la fiche de ${name}">×</button>
      <article>
        <figure><img src="${image.currentSrc || image.src}" alt="${image.alt}"></figure>
        <div>
          <p class="kicker">${category}</p>
          <h2>${name}</h2>
          <i>${latinName}</i>
          <p>Cette plante fait partie de la palette végétale proposée pour le projet Château Gasqui.</p>
          <span>Floraison · ${floweringPeriods.get(latinName) || "Période à préciser"}</span>
        </div>
      </article>`;

    const close = () => {
      modal.remove();
      document.removeEventListener("keydown", onKeydown);
      card.focus();
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") close();
    };

    modal.querySelector(".modal-close")?.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", onKeydown);
    document.body.append(modal);
    modal.querySelector(".modal-close")?.focus();
  };

  document.querySelectorAll(".plant-card").forEach((card) => {
    card.addEventListener("click", () => openPlantCard(card));
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
  updateProjectCopy();
  revealOnScroll();
  initPlan();
  initImageSwitches();
  initAnimationReplays();
  initZones();
  initPlantFilters();
  initPlantCards();
  initMenu();
  animateStats();
}

loadProject().catch((error) => {
  page.removeAttribute("aria-busy");
  page.textContent = error.message;
});

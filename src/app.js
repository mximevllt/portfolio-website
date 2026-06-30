const menuToggle = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".site-menu a");
const dotCanvas = document.querySelector("#dotField");
const flowingMenu = document.querySelector(".flowing-menu");
const heroScrollLink = document.querySelector(".hero-scroll");
const homeHero = document.querySelector(".hero");
const heroLogoWrap = document.querySelector(".hero-logo-wrap");

const projects = [
  {
    slug: "perchee-design-parade-2026",
    title: "Perchée",
    badge: "Design Parade 2026",
    href: "perchee.html",
    images: [
      { file: "Perchée 02.jpg", orientation: "portrait" },
      { file: "Perchée 01.png", orientation: "landscape" },
      { file: "Perchée 03.jpg", orientation: "portrait" }
    ]
  },
  {
    slug: "alta",
    title: "Alta",
    href: "alta.html",
    images: [
      { file: "Alta 02.jpg", orientation: "square" },
      { file: "Alta 01.jpg", orientation: "landscape" },
      { file: "Alta 03.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "rolex-retail-express",
    title: "Rolex Retail Express",
    href: "rolex.html",
    images: [
      { file: "Rolex 01.jpg", orientation: "landscape" },
      { file: "Rolex 02.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "agora-toulon",
    title: "Agora",
    suffix: "- Toulon",
    href: "agora.html",
    images: [
      { file: "Agora 01.png", orientation: "landscape" },
      { file: "Agora 02.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "projet-dionys-hyeres",
    title: "Projet Dionys",
    suffix: "- Hyères",
    note: "plus d'informations à venir",
    images: [
      { file: "Dionys 01.jpg", orientation: "landscape" },
      { file: "Dionys 02.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "page-blanche-giens",
    title: "Page Blanche",
    suffix: "- Presqu'île de Giens",
    note: "plus d'informations à venir",
    images: [
      { file: "Page Blanche 01.jpg", orientation: "landscape" },
      { file: "Page Blanche 02.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "batiment-s-universite-garde",
    title: "Bâtiment S",
    suffix: "- Université de la Garde",
    note: "plus d'informations à venir",
    images: [
      { file: "Bâtiment S 01.png", orientation: "landscape" },
      { file: "Bâtiment S 02.png", orientation: "landscape" }
    ]
  },
  {
    slug: "lampe-spotlight",
    title: "Lampe Spotlight",
    note: "plus d'informations à venir",
    images: [
      { file: "Spotlight 02.jpg", orientation: "portrait" },
      { file: "Spotlight 01.jpg", orientation: "landscape" },
      { file: "Spotlight 03.jpg", orientation: "landscape" }
    ]
  },
  {
    slug: "seau-roche-ruinart",
    title: "Seau Roche Ruinart",
    note: "plus d'informations à venir",
    images: [{ file: "Seaux Ruinart 01.jpg", orientation: "landscape" }]
  }
];

function projectImageUrl(fileName) {
  return encodeURI(`/assets/projects/${fileName}`);
}

function renderProjectTitle(project) {
  const suffix = project.suffix ? `<em>${project.suffix}</em>` : "";
  const badge = project.badge ? `<span class="project-badge">${project.badge}</span>` : "";
  return `<span class="project-title"><h3>${project.title}</h3>${suffix}${badge}</span>`;
}

function renderProjectNote(project) {
  return project.note ? `<span class="project-note">${project.note}</span>` : "";
}

function renderProjectGallery(project) {
  if (!project.images.length) {
    return "";
  }

  const mobileImageIndex = project.images.findIndex((image) => image.orientation === "landscape");
  const preferredMobileIndex = mobileImageIndex >= 0 ? mobileImageIndex : 0;
  const images = project.images
    .map(
      (image, index) => {
        const mobileClass = index === preferredMobileIndex ? " is-mobile-image" : "";
        return `<span class="project-preview__frame is-${image.orientation}${mobileClass}" data-gallery-index="${index}"><img src="${projectImageUrl(image.file)}" alt="" loading="lazy" decoding="async" /></span>`;
      }
    )
    .join("");
  const layout = `layout-${project.images.length}`;

  return `
    <span class="project-preview ${layout}" aria-hidden="true">
      <span class="project-preview__grid">${images}</span>
    </span>
  `;
}

function renderProjects() {
  if (!flowingMenu) return;

  flowingMenu.innerHTML = projects
    .map((project, index) => {
      const number = String(index + 1).padStart(2, "0");
      const hasGallery = project.images.length ? " has-gallery" : "";

      return `
        <a class="flowing-menu__item${hasGallery}" href="${project.href || `#${project.slug}`}">
          <span class="project-link">
            <span class="project-index">${number}</span>
            ${renderProjectTitle(project)}
            ${renderProjectNote(project)}
          </span>
          ${renderProjectGallery(project)}
        </a>
      `;
    })
    .join("");
}

renderProjects();

if (document.body.classList.contains("hero-locked") && window.location.hash) {
  document.body.classList.remove("hero-locked");
}

if (homeHero) {
  let ticking = false;

  function updateHomeBrandVisibility() {
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 0;
    const threshold = Math.max(0, homeHero.offsetTop + homeHero.offsetHeight - navHeight);
    document.body.classList.toggle("home-past-hero", window.scrollY >= threshold - 1);
    ticking = false;
  }

  function requestHomeBrandUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHomeBrandVisibility);
  }

  window.addEventListener("scroll", requestHomeBrandUpdate, { passive: true });
  window.addEventListener("resize", requestHomeBrandUpdate);
  window.addEventListener("hashchange", () => {
    if (window.location.hash) {
      document.body.classList.remove("hero-locked");
    }
    window.setTimeout(requestHomeBrandUpdate, 80);
  });
  updateHomeBrandVisibility();
}

function initHeroLiquidCursor() {
  const canUseHeroCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!homeHero || !heroScrollLink || !canUseHeroCursor || reducedMotion || window.innerWidth <= 740) {
    return;
  }

  const cursor = document.createElement("div");
  cursor.className = "hero-liquid-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;
  let isVisible = false;
  let isSnappedToArrow = false;
  let isForwardingClick = false;
  let frame = 0;

  function isInsideHero(clientX, clientY) {
    const heroRect = homeHero.getBoundingClientRect();
    return clientX >= heroRect.left && clientX <= heroRect.right && clientY >= heroRect.top && clientY <= heroRect.bottom;
  }

  function setHeroCursorVisible(visible) {
    isVisible = visible && !document.body.classList.contains("home-past-hero");
    document.body.classList.toggle("hero-cursor-active", isVisible);
    cursor.classList.toggle("is-visible", isVisible);
  }

  function updatePointer(event) {
    targetX = event.clientX;
    targetY = event.clientY;
    setHeroCursorVisible(isInsideHero(event.clientX, event.clientY));
  }

  function refreshVisibility() {
    setHeroCursorVisible(isInsideHero(targetX, targetY));
  }

  function updateLogoMask(cursorX, cursorY, radiusX, radiusY, angle) {
    if (!heroLogoWrap) return;

    const logoRect = heroLogoWrap.getBoundingClientRect();
    const intersectsLogo =
      isVisible &&
      cursorX + radiusX >= logoRect.left &&
      cursorX - radiusX <= logoRect.right &&
      cursorY + radiusY >= logoRect.top &&
      cursorY - radiusY <= logoRect.bottom;

    heroLogoWrap.classList.toggle("is-logo-masked", intersectsLogo);

    if (!intersectsLogo) return;

    const centerX = cursorX - logoRect.left;
    const centerY = cursorY - logoRect.top;
    const insetRadiusX = radiusX;
    const insetRadiusY = radiusY;
    const points = [];
    const segments = 44;

    for (let index = 0; index < segments; index += 1) {
      const theta = (index / segments) * Math.PI * 2;
      const ellipseX = Math.cos(theta) * insetRadiusX;
      const ellipseY = Math.sin(theta) * insetRadiusY;
      const rotatedX = ellipseX * Math.cos(angle) - ellipseY * Math.sin(angle);
      const rotatedY = ellipseX * Math.sin(angle) + ellipseY * Math.cos(angle);
      points.push(`${centerX + rotatedX}px ${centerY + rotatedY}px`);
    }

    heroLogoWrap.style.setProperty("--logo-mask-x", `${centerX}px`);
    heroLogoWrap.style.setProperty("--logo-mask-y", `${centerY}px`);
    heroLogoWrap.style.setProperty("--logo-mask-rx", `${insetRadiusX}px`);
    heroLogoWrap.style.setProperty("--logo-mask-ry", `${insetRadiusY}px`);
    heroLogoWrap.style.setProperty("--logo-mask-polygon", `polygon(${points.join(", ")})`);
  }

  function render(time = 0) {
    const arrowRect = heroScrollLink.getBoundingClientRect();
    const arrowX = arrowRect.left + arrowRect.width / 2;
    const arrowY = arrowRect.top + arrowRect.height / 2;
    const heroRect = homeHero.getBoundingClientRect();
    const dx = arrowX - targetX;
    const dy = arrowY - targetY;
    const distance = Math.hypot(dx, dy);
    const isOrbiting = isVisible && distance < 180;
    const angle = Math.atan2(dy, dx);
    const pull = Math.max(0, 1 - Math.min(distance, 420) / 420);
    const stretch = 1 + pull * 0.74;
    const squeeze = 1 - pull * 0.18;
    const maskRadiusX = isOrbiting ? 32 : 27 * stretch;
    const maskRadiusY = isOrbiting ? 32 : 27 * squeeze;

    const destinationX = isOrbiting ? arrowX : targetX;
    const destinationY = isOrbiting ? Math.min(arrowY, heroRect.bottom - 34) : targetY;

    x += (destinationX - x) * (isOrbiting ? 0.22 : 0.14);
    y += (destinationY - y) * (isOrbiting ? 0.22 : 0.14);
    isSnappedToArrow = isOrbiting;

    cursor.classList.toggle("is-orbiting", isOrbiting);
    heroScrollLink.classList.toggle("is-cursor-target", isOrbiting);
    cursor.style.setProperty("--cursor-rotate", `${angle}rad`);
    cursor.style.setProperty("--cursor-scale-x", isOrbiting ? "1" : String(stretch));
    cursor.style.setProperty("--cursor-scale-y", isOrbiting ? "1" : String(squeeze));
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(var(--cursor-rotate)) scale(var(--cursor-scale-x), var(--cursor-scale-y))`;
    updateLogoMask(x, y, maskRadiusX, maskRadiusY, isOrbiting ? 0 : angle);

    frame = requestAnimationFrame(render);
  }

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("scroll", refreshVisibility, { passive: true });
  window.addEventListener("resize", refreshVisibility);
  window.addEventListener("click", () => {
    if (isVisible && isSnappedToArrow && !isForwardingClick) {
      isForwardingClick = true;
      heroScrollLink.click();
      window.setTimeout(() => {
        isForwardingClick = false;
      }, 0);
    }
  });
  homeHero.addEventListener("pointerleave", () => setHeroCursorVisible(false));
  heroScrollLink.addEventListener("click", () => setHeroCursorVisible(false));

  render();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(frame);
    cursor.remove();
  });
}

initHeroLiquidCursor();

const animatedBlocks = document.querySelectorAll("[data-animate]");
const flowingItems = document.querySelectorAll(".flowing-menu__item");
const smoothAnchorLinks = document.querySelectorAll('a[href^="#"]');

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}

menuToggle?.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

function scrollToTarget(target) {
  document.body.classList.remove("hero-locked");

  const startY = window.scrollY;
  const endY = target.getBoundingClientRect().top + window.scrollY;
  const distance = endY - startY;
  const duration = 1100;
  const startTime = performance.now();

  function easeOutAccent(progress) {
    return 1 - Math.pow(1 - progress, 3.9);
  }

  function tick() {
    const progress = Math.min((performance.now() - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeOutAccent(progress));

    if (progress >= 1) {
      window.scrollTo(0, endY);
      window.setTimeout(() => window.scrollTo(0, endY), 80);
      return;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

smoothAnchorLinks.forEach((link) => {
  if (link === heroScrollLink) return;

  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    setMenu(false);
    scrollToTarget(target);
  });
});

heroScrollLink?.addEventListener("click", (event) => {
  const target = document.querySelector("#projets");
  if (!target) return;

  event.preventDefault();
  scrollToTarget(target);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.22,
    rootMargin: "0px 0px -8% 0px"
  }
);

animatedBlocks.forEach((block, index) => {
  block.style.transitionDelay = `${index * 110}ms`;
  revealObserver.observe(block);
});

const touchAccordion = window.matchMedia("(hover: none), (pointer: coarse)");

function setActiveProjectItem(activeItem) {
  flowingItems.forEach((item) => {
    item.classList.toggle("is-active", item === activeItem);
  });
}

flowingItems.forEach((item) => {
  item.addEventListener("pointerenter", () => {
    setActiveProjectItem(item);
  });

  item.addEventListener("pointerdown", () => {
    if (touchAccordion.matches) {
      setActiveProjectItem(item);
    }
  });

  item.addEventListener("pointerleave", () => {
    if (!touchAccordion.matches) {
      item.classList.remove("is-active");
    }
  });
});

if (dotCanvas) {
  const context = dotCanvas.getContext("2d");
  const config = {
    dotRadius: 0.3,
    dotSpacing: 19,
    bulgeStrength: 14,
    sparkle: false,
    waveAmplitude: 0.5,
    cursorRadius: 750,
    cursorForce: 0.17,
    bulgeOnly: false,
    gradientFrom: "#382b2b",
    gradientTo: "#271e1e"
  };

  let width = 0;
  let height = 0;
  let dots = [];
  let animationFrame = 0;
  let pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false
  };

  function buildDots() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = dotCanvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dotCanvas.width = Math.floor(width * pixelRatio);
    dotCanvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    dots = [];
    const offsetX = (width % config.dotSpacing) / 2;
    const offsetY = (height % config.dotSpacing) / 2;

    for (let y = offsetY; y <= height; y += config.dotSpacing) {
      for (let x = offsetX; x <= width; x += config.dotSpacing) {
        dots.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * 0.1;
    pointer.y += (pointer.targetY - pointer.y) * 0.1;

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, config.gradientFrom);
    gradient.addColorStop(1, config.gradientTo);
    context.fillStyle = gradient;

    for (const dot of dots) {
      const dx = dot.x - pointer.x;
      const dy = dot.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence = pointer.active ? Math.max(0, 1 - distance / config.cursorRadius) : 0;
      const wave = Math.sin(time * 0.0016 + dot.phase) * config.waveAmplitude;
      const push = influence * config.bulgeStrength;
      const angle = Math.atan2(dy, dx);
      const x = dot.x + Math.cos(angle) * push;
      const y = dot.y + Math.sin(angle) * push + wave;
      const radius = config.dotRadius + influence * config.cursorForce * 2.1;
      const alpha = 0.22 + influence * 0.5;

      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    animationFrame = requestAnimationFrame(draw);
  }

  function updatePointer(event) {
    const rect = dotCanvas.getBoundingClientRect();
    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    pointer.active = true;
  }

  dotCanvas.addEventListener("pointermove", updatePointer);
  dotCanvas.addEventListener("pointerenter", updatePointer);
  dotCanvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", buildDots);
  buildDots();
  draw();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationFrame);
  });
}

const beforeAfterSliders = document.querySelectorAll("[data-before-after]");

beforeAfterSliders.forEach((slider) => {
  const afterLayer = slider.querySelector(".before-after__after");
  const handle = slider.querySelector(".before-after__handle");
  const range = slider.querySelector(".before-after__range");

  if (!afterLayer || !handle || !range) return;

  function setSliderPosition(value) {
    const position = Math.min(100, Math.max(0, value));
    slider.style.setProperty("--slider-position", `${position}%`);
    range.value = String(position);
    range.setAttribute("aria-valuenow", String(Math.round(position)));
  }

  function positionFromPointer(event) {
    const rect = slider.getBoundingClientRect();
    return ((event.clientX - rect.left) / rect.width) * 100;
  }

  slider.addEventListener("pointerdown", (event) => {
    slider.setPointerCapture(event.pointerId);
    setSliderPosition(positionFromPointer(event));
  });

  slider.addEventListener("pointermove", (event) => {
    if (!slider.hasPointerCapture(event.pointerId)) return;
    setSliderPosition(positionFromPointer(event));
  });

  range.addEventListener("input", () => {
    setSliderPosition(Number(range.value));
  });

  setSliderPosition(Number(range.value || 50));
});

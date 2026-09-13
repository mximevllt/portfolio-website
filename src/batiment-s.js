const stage = document.querySelector("[data-zoning-stage]");

if (stage) {
  const copy = document.querySelector("[data-zone-copy]");
  const label = copy?.querySelector("[data-zone-label]");
  const title = copy?.querySelector("[data-zone-title]");
  const text = copy?.querySelector("[data-zone-text]");
  const views = new Map(
    [...stage.querySelectorAll("[data-zone-view]")].map((image) => [image.dataset.zoneView, image])
  );
  const masks = new Map();
  const maskOrder = ["passerelle", "travail", "rangements", "sport", "art", "vie"];
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const mobileCards = [...document.querySelectorAll("[data-zone-scroll]")];
  const existingSection = document.querySelector(".bs-existing");
  const existingKicker = existingSection?.querySelector(".bs-eyebrow");
  const zoneContent = {
    general: {
      label: "Vue générale",
      title: "Un volume commun à activer.",
      text: "Le Bâtiment S devient un ensemble continu où la grande hauteur, les circulations et les usages se répondent. Survolez les zones pour découvrir leur rôle dans le projet."
    },
    vide: {
      label: "Bâtiment ouvert",
      title: "Un espace commun, lisible et traversant.",
      text: "Même hors des pôles identifiés, l’ouverture du bâtiment rend perceptibles les niveaux, les circulations et l’activité collective qui se développe autour du hall."
    },
    passerelle: {
      label: "Intervention centrale",
      title: "Passerelle multidirectrice",
      text: "La passerelle relie les niveaux et plusieurs pôles du projet. Elle transforme la circulation en un lieu à part entière, utilisable pour se déplacer, faire une pause, déjeuner ou observer le hall."
    },
    vie: {
      label: "Pôle collectif",
      title: "Espace de vie",
      text: "Le grand hall devient un espace de détente et de convivialité. La double hauteur et la lumière naturelle font de ce volume le point de rencontre immédiat du bâtiment."
    },
    travail: {
      label: "Pôle calme",
      title: "Espace de travail",
      text: "Une nouvelle plateforme et un R+2 utilisent des volumes auparavant inexploités. Le R+1 accueille une zone calme et insonorisée, tandis que les niveaux hauts bénéficient des vues et de la lumière des façades."
    },
    rangements: {
      label: "Entrée Sud",
      title: "Entrée & rangements",
      text: "Des casiers et rangements sont installés à l’entrée Sud pour permettre aux étudiants de rester dans le bâtiment et d’y concentrer leurs activités sans multiplier les détours."
    },
    sport: {
      label: "Aile Nord",
      title: "Espace sportif",
      text: "La salle de sport existante est agrandie et reconnectée à la vie générale du bâtiment. Elle devient un pôle visible et facilement accessible depuis le cœur du campus."
    },
    art: {
      label: "Aile Nord",
      title: "Espace arts",
      text: "L’espace dédié à l’art et à la musique rassemble les activités de création dans l’aile Nord, au contact direct des autres usages étudiants."
    }
  };

  let activeZone = "general";
  let framePending = false;
  let latestPoint = null;
  let mobileObserver;

  const isOrange = (red, green, blue, alpha) =>
    alpha > 30 && red > 155 && green > 20 && green < 180 && blue < 125 && red - green > 52;

  const createMask = async (image) => {
    if (!image.complete) {
      await new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", reject, { once: true });
      });
    }

    const width = 1000;
    const height = Math.round(width * (image.naturalHeight / image.naturalWidth));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const pixels = context.getImageData(0, 0, width, height).data;
    const data = new Uint8Array(width * height);
    for (let index = 0, pixel = 0; index < data.length; index += 1, pixel += 4) {
      data[index] = isOrange(pixels[pixel], pixels[pixel + 1], pixels[pixel + 2], pixels[pixel + 3]) ? 1 : 0;
    }

    return { width, height, data };
  };

  const initializeMasks = async () => {
    const maskImages = [...stage.querySelectorAll("[data-zone-mask]")];
    await Promise.all(
      maskImages.map(async (image) => {
        try {
          masks.set(image.dataset.zoneMask, await createMask(image));
        } catch {
          // The interactive view remains usable with the open view as a safe fallback.
        }
      })
    );
  };

  const matchesMask = (mask, x, y) => {
    if (!mask) return false;

    const centerX = Math.round(x * (mask.width - 1));
    const centerY = Math.round(y * (mask.height - 1));
    for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
      for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
        const sampleX = centerX + offsetX;
        const sampleY = centerY + offsetY;
        if (sampleX < 0 || sampleY < 0 || sampleX >= mask.width || sampleY >= mask.height) continue;
        if (mask.data[sampleY * mask.width + sampleX]) return true;
      }
    }
    return false;
  };

  const zoneAt = (x, y) => {
    for (const zone of maskOrder) {
      let maskX = x;
      let maskY = y;
      if (zone === "travail") {
        const workCanvas = { left: 80 / 2970, top: 155 / 1392, width: 2442 / 2970, height: 1212 / 1392 };
        if (
          maskX < workCanvas.left ||
          maskX > workCanvas.left + workCanvas.width ||
          maskY < workCanvas.top ||
          maskY > workCanvas.top + workCanvas.height
        ) continue;
        maskX = (maskX - workCanvas.left) / workCanvas.width;
        maskY = (maskY - workCanvas.top) / workCanvas.height;
      }
      if (matchesMask(masks.get(zone), maskX, maskY)) return zone;
    }
    return "vide";
  };

  const updateCopy = (zone) => {
    const content = zoneContent[zone];
    if (!content || !copy || !label || !title || !text) return;

    copy.classList.add("is-changing");
    window.setTimeout(() => {
      label.textContent = content.label;
      title.textContent = content.title;
      text.textContent = content.text;
      copy.classList.remove("is-changing");
    }, 105);
  };

  const showZone = (zone) => {
    if (!views.has(zone) || zone === activeZone) return;
    views.forEach((image, name) => image.classList.toggle("is-active", name === zone));
    activeZone = zone;
    updateCopy(zone);
  };

  const updateFromPointer = () => {
    framePending = false;
    if (!latestPoint || mobileQuery.matches) return;

    const bounds = stage.getBoundingClientRect();
    const x = (latestPoint.clientX - bounds.left) / bounds.width;
    const y = (latestPoint.clientY - bounds.top) / bounds.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      showZone("general");
      return;
    }

    showZone(masks.size ? zoneAt(x, y) : "vide");
  };

  stage.addEventListener("pointermove", (event) => {
    if (mobileQuery.matches) return;
    latestPoint = event;
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateFromPointer);
  });

  stage.addEventListener("pointerleave", () => {
    if (mobileQuery.matches) return;
    latestPoint = null;
    showZone("general");
  });

  stage.addEventListener("focus", () => {
    if (!mobileQuery.matches) showZone("vide");
  });
  stage.addEventListener("blur", () => {
    if (!mobileQuery.matches) showZone("general");
  });

  const updateExistingImages = () => {
    if (!existingSection || !existingKicker) return;
    if (!mobileQuery.matches) {
      existingSection.classList.remove("is-revealed");
      return;
    }

    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 0;
    existingSection.classList.toggle("is-revealed", existingKicker.getBoundingClientRect().top <= headerHeight + 30);
  };

  const setupMobileZoning = () => {
    mobileObserver?.disconnect();
    stage.tabIndex = mobileQuery.matches ? -1 : 0;

    if (!mobileQuery.matches) {
      showZone("general");
      updateExistingImages();
      return;
    }

    mobileObserver = new IntersectionObserver(
      (entries) => {
        const visibleCard = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        if (visibleCard) showZone(visibleCard.target.dataset.zoneScroll);
      },
      { rootMargin: "-34% 0px -42% 0px", threshold: [0.15, 0.4, 0.7] }
    );

    mobileCards.forEach((card) => mobileObserver.observe(card));
    updateExistingImages();
  };

  mobileQuery.addEventListener("change", setupMobileZoning);
  window.addEventListener("scroll", updateExistingImages, { passive: true });
  window.addEventListener("resize", updateExistingImages);

  initializeMasks();
  setupMobileZoning();
}

(() => {
  function getCurrentRoute() {
    const pathParts = location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const lastPathPart = pathParts.at(-1) || "";
    const detectedRoute = lastPathPart === "index.html"
      ? (pathParts.at(-2) || "home")
      : (lastPathPart === "ak-record-source.html" ? "home" : (lastPathPart || "home"));
    if (detectedRoute === "service") return "music";
    if (detectedRoute === "works") return "releases";
    return detectedRoute;
  }

  let route = getCurrentRoute();

  function siteAsset(filename) {
    if (location.protocol === "file:") return `../${filename}`;
    const repositoryBase = "/tmanecas-music-site/";
    return location.pathname.includes(repositoryBase)
      ? `${repositoryBase}${filename}`
      : `/${filename}`;
  }

  const socialLinks = [
    ["TikTok", "https://www.tiktok.com/@tmanecas", "./tiktok.svg"],
    ["Instagram", "https://www.instagram.com/tmanecas_/", "./instagram.svg"],
    ["YouTube", "https://www.youtube.com/@tmanecas", "./youtube.svg"]
  ];

  const textReplacements = new Map([
    ["AK.REC", "TMANECAS"],
    ["AK Record", "FORTUNA RECORDS"],
    ["About", "Artist"],
    ["Service", "Music"],
    ["Works", "Releases"],
    ["Contact", "Business"],
    ["THE ARTIST", "SEMBANDO"],
    ["The artist", "SEMBANDO"],
    ["DESIGN BY MINO", "FORTUNA RECORDS"],
    ["© 2026 AK.RECORD All rights reserved", "© 2026 TMANECAS / FORTUNA RECORDS"]
  ]);

  function updateRouteLinks(root) {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      let nextHref = href;
      if (href === "./service" || href.startsWith("./service#")) nextHref = "./music";
      if (href === "./works" || href.startsWith("./works#")) nextHref = "./releases";
      if (location.protocol === "file:" && nextHref === "./music") nextHref = "./music/index.html";
      if (location.protocol === "file:" && nextHref === "./releases") nextHref = "./releases/index.html";
      if (nextHref !== href) link.setAttribute("href", nextHref);
    });
  }

  function updateText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const replacement = textReplacements.get(node.nodeValue.trim());
      if (replacement) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), replacement);
    });
  }

  function updateMenuSocials(root) {
    root.querySelectorAll('[data-framer-name="Social List"]').forEach((group) => {
      if (group.closest("footer") || group.dataset.tmanecasSocials === "true") return;
      group.dataset.tmanecasSocials = "true";
      group.classList.add("tmanecas-social-links");
      group.replaceChildren(...socialLinks.map(([label, href, icon]) => {
        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `TMANECAS on ${label}`);
        const image = document.createElement("img");
        image.src = icon;
        image.alt = "";
        link.appendChild(image);
        return link;
      }));
    });
  }

  function updateHomeStatement(root) {
    root.querySelectorAll("p, h1, h2, h3").forEach((element) => {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      if (!text.startsWith("TMANECAS blends Angolan roots") || element.dataset.grandaMambo === "true") return;
      element.dataset.grandaMambo = "true";
      element.innerHTML = 'TMANECAS blends Angolan roots, live energy,<br>and a timeless Semba spirit.<span class="tmanecas-granda-mambo">GRANDA MAMBO</span>';
    });
  }

  function customizeMusic(root) {
    if (route !== "music") return;
    const hero = root.querySelector('[data-framer-name="Section: Hero"]');
    hero?.querySelectorAll(':scope > [data-framer-background-image-wrapper="true"]').forEach((image) => image.remove());
    hero?.querySelectorAll("h1").forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      heading.innerHTML = "TMANECAS<br>SEMBA LEGACY.";
    });

    const intro = root.querySelector('[data-framer-name="Section: Intro"]');
    intro?.querySelectorAll('[data-framer-name="Row 1"] h1, [data-framer-name="Row 1"] p').forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      heading.innerHTML = "WHERE ANGOLAN<br>RHYTHM BECOMES<br>LEGACY.";
    });
    intro?.querySelectorAll('[data-framer-name="Row 2"] h1, [data-framer-name="Row 2"] h2').forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      heading.innerHTML = "TMANECAS CARRIES<br>ANGOLA IN EVERY NOTE<br>SEMBA WITH SOUL,<br>MADE TO MOVE<br>GENERATIONS.";
    });
    root.querySelectorAll('[data-framer-name="Section: Why choose us"]').forEach((section) => section.remove());
  }

  function customizeReleases(root) {
    if (route !== "releases") return;
    const kept = new Map([
      ["Heart Bulletproof", ["SAUDADE", "Longing becomes movement in a timeless Angolan rhythm carried by memory and soul."]],
      ["Midnight Vandal", ["DANGEREUX", "A fearless Semba pulse shaped by desire, danger, and the unmistakable voice of TMANECAS."]],
      ["Saudade", ["SAUDADE", "Longing becomes movement in a timeless Angolan rhythm carried by memory and soul."]],
      ["DAGENREUX", ["DANGEREUX", "A fearless Semba pulse shaped by desire, danger, and the unmistakable voice of TMANECAS."]],
      ["DANGEREX", ["DANGEREUX", "A fearless Semba pulse shaped by desire, danger, and the unmistakable voice of TMANECAS."]],
      ["DANGEREUX", ["DANGEREUX", "A fearless Semba pulse shaped by desire, danger, and the unmistakable voice of TMANECAS."]],
      ["SAUDADE", ["SAUDADE", "Longing becomes movement in a timeless Angolan rhythm carried by memory and soul."]]
    ]);
    const hidden = new Set(["My Rearview", "Pixel Tears"]);

    root.querySelectorAll("a").forEach((anchor) => {
      const paragraphs = [...anchor.querySelectorAll("p")];
      const title = paragraphs.find((paragraph) => kept.has(paragraph.textContent.trim()) || hidden.has(paragraph.textContent.trim()));
      if (!title) return;
      const originalTitle = title.textContent.trim();
      if (hidden.has(originalTitle)) {
        (anchor.parentElement || anchor).style.setProperty("display", "none", "important");
        return;
      }
      const [newTitle, description] = kept.get(originalTitle);
      title.textContent = newTitle;
      if (newTitle === "SAUDADE" || newTitle === "DANGEREUX") {
        const image = anchor.querySelector("img");
        if (image) {
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
          image.src = siteAsset(newTitle === "SAUDADE" ? "saudade.jpg" : "dangereux-work-II.jpg");
          image.alt = `TMANECAS — ${newTitle}`;
        }
      }
      const copy = paragraphs.find((paragraph) => paragraph !== title && paragraph.textContent.trim().length > 30);
      if (copy) copy.textContent = description;
      anchor.removeAttribute("href");
      anchor.removeAttribute("target");
      anchor.removeAttribute("data-framer-page-link-current");
      anchor.setAttribute("aria-disabled", "true");
      anchor.classList.add("tmanecas-release-link-disabled");
      if (anchor.dataset.tmanecasReleaseDisabled !== "true") {
        anchor.dataset.tmanecasReleaseDisabled = "true";
        anchor.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }, true);
      }
    });

    root.querySelectorAll("button, p").forEach((element) => {
      if (element.textContent.replace(/\s+/g, " ").trim().toUpperCase() !== "LOAD MORE") return;
      const target = element.closest('[data-framer-name="Button Load More"]') || element.closest("button") || element;
      target.style.setProperty("display", "none", "important");
    });
  }

  function customizeContact(root) {
    if (route !== "contact") return;
    root.querySelectorAll("p").forEach((paragraph) => {
      const copy = paragraph.textContent.replace(/\s+/g, " ").trim();
      if (!copy.includes("every project starts with a quick discovery session") || !copy.includes("Submit the form")) return;
      paragraph.textContent = "Every TMANECAS collaboration begins with a conversation. For partnerships, press, and creative projects, share the details below. If the vision feels right, Fortuna Records will be in touch to shape the next move. We choose opportunities that respect the music, the culture, and the legacy. Submit the form to start the conversation.";
    });
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    route = getCurrentRoute();
    document.body.classList.toggle("tmanecas-music-route", route === "music");
    document.body.classList.toggle("tmanecas-releases-route", route === "releases");
    updateRouteLinks(document);
    updateText(document);
    updateMenuSocials(document);
    updateHomeStatement(document);
    customizeMusic(document);
    customizeReleases(document);
    customizeContact(document);
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();

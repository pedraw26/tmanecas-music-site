(() => {
  const route = location.pathname.replace(/\/+$/, "").split("/").pop() || "home";
  document.body.classList.toggle("tmanecas-music-route", route === "music");
  document.body.classList.toggle("tmanecas-releases-route", route === "releases");

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
    ["DESIGN BY MINO", "FORTUNA RECORDS"],
    ["© 2026 AK.RECORD All rights reserved", "© 2026 TMANECAS / FORTUNA RECORDS"]
  ]);

  function updateRouteLinks(root) {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === "./service" || href.startsWith("./service#")) link.setAttribute("href", "./music");
      if (href === "./works" || href.startsWith("./works#")) link.setAttribute("href", "./releases");
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
      element.innerHTML = 'TMANECAS blends Angolan roots, live energy,<br>and a timeless Semba spirit. Music made to move, connect, and endure.<span class="tmanecas-granda-mambo">GRANDA MAMBO</span>';
    });
  }

  function customizeMusic(root) {
    if (route !== "music") return;
    root.querySelectorAll('[data-framer-name="Section: Hero"] > [data-framer-background-image-wrapper="true"]').forEach((image) => image.remove());
    root.querySelectorAll('[data-framer-name="Section: Why choose us"]').forEach((section) => section.remove());
  }

  function customizeReleases(root) {
    if (route !== "releases") return;
    const kept = new Map([
      ["Heart Bulletproof", ["DANGEREUX", "A fearless Semba pulse shaped by desire, danger, and the unmistakable voice of TMANECAS."]],
      ["Midnight Vandal", ["SAUDADE", "Longing becomes movement in a timeless Angolan rhythm carried by memory and soul."]],
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
      const copy = paragraphs.find((paragraph) => paragraph !== title && paragraph.textContent.trim().length > 30);
      if (copy) copy.textContent = description;
      anchor.removeAttribute("href");
    });

    root.querySelectorAll("button, p").forEach((element) => {
      if (element.textContent.replace(/\s+/g, " ").trim().toUpperCase() !== "LOAD MORE") return;
      const target = element.closest('[data-framer-name="Button Load More"]') || element.closest("button") || element;
      target.style.setProperty("display", "none", "important");
    });
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    updateRouteLinks(document);
    updateText(document);
    updateMenuSocials(document);
    updateHomeStatement(document);
    customizeMusic(document);
    customizeReleases(document);
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();

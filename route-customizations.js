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

  // The menu overlay is rendered at runtime by the Framer bundle, so its social
  // links still point at the template defaults. Remap them by original host.
  const menuSocialByHost = [
    [/facebook\.com/i, "TikTok", "https://www.tiktok.com/@tmanecas"],
    [/(^|\/\/)(x|twitter)\.com/i, "YouTube", "https://www.youtube.com/@tmanecas"],
    [/instagram\.com/i, "Instagram", "https://www.instagram.com/tmanecas_/"]
  ];

  const textReplacements = new Map([
    ["AK.REC", "TMANECAS"],
    ["AK.", "TMANECAS"],
    ["(+1) 213-555-0198", "FORTUNA RECORDS"],
    ["725 Los Angeles, Suite 302", "SEMBA FROM LUANDA"],
    ["Los Angeles, CA 90014", "ANGOLA TO THE WORLD"],
    ["United States", "BOOKINGS WORLDWIDE"],
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

  const EMAIL_NEGOCIOS = "hello@pedraw.co.uk";

  // ------------------------------------------------------------------
  // Entradas.
  //
  // O estado escondido nasce sempre aqui, por script, nunca como valor
  // por omissao no CSS: uma falha deste ficheiro tem de deixar o texto a
  // vista, e nao um site em branco.
  // ------------------------------------------------------------------
  const semMovimento = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // As paginas do template trazem pares de variantes para larguras
  // diferentes, e uma delas esta sempre em display:none. Escondida, nunca
  // cruzaria o observador — ficaria invisivel para sempre, e aparecia
  // vazia se a janela mudasse de tamanho. Essas entram ja reveladas.
  const estaDesenhado = (elemento) => elemento.getClientRects().length > 0;

  function revelarAoEntrarNoEcra(alvo, revelar, limiar) {
    // Sem temporizador de recurso: um relogio revelaria o bloco a quem
    // ainda vai a meio da pagina. Quem nao tem o observador revela ja.
    if (typeof IntersectionObserver !== "function") { revelar(); return; }
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        revelar();
        observador.disconnect();
      });
    }, { threshold: limiar });
    observador.observe(alvo);
  }

  // Cada palavra no seu span, com o atraso do indice. As linhas vem sempre
  // de literais deste ficheiro — nunca de texto lido do DOM.
  function partirEmPalavras(elemento, linhas) {
    let n = 0;
    elemento.innerHTML = linhas
      .map((linha) => linha.split(" ")
        .map((palavra) =>
          `<span class="tmanecas-palavra" style="transition-delay:${(n++ * 45)}ms">${palavra}</span>`)
        .join(" "))
      .join("<br>");
  }

  // Blocos abaixo da dobra: entram quando o leitor la chega.
  function frasePorScroll(elemento) {
    if (semMovimento() || !estaDesenhado(elemento)) {
      elemento.classList.add("tmanecas-frase-visivel");
      return;
    }
    revelarAoEntrarNoEcra(elemento, () => elemento.classList.add("tmanecas-frase-visivel"), 0.35);
  }

  // Um titulo que ja esta a vista quando a pagina abre nao pode esperar por
  // um observador: este dispara no mesmo quadro em que e armado, e ve-se o
  // estado escondido a piscar. Entra sozinho.
  //
  // Durante a hidratacao o Framer reconstroi estes titulos mais do que uma
  // vez; sem memoria, a frase recomecava a cada reconstrucao, aos
  // solavancos. A memoria e por rota e esvazia-se quando a rota muda, para
  // que home > music > home > music volte sempre a animar.
  const memoriaEntradas = { rota: null, chaves: new Set() };
  function jaEntrou(chave) {
    if (memoriaEntradas.rota !== route) {
      memoriaEntradas.rota = route;
      memoriaEntradas.chaves.clear();
    }
    if (memoriaEntradas.chaves.has(chave)) return true;
    memoriaEntradas.chaves.add(chave);
    return false;
  }

  function fraseAoChegar(elemento, chave) {
    // Num separador em segundo plano o requestAnimationFrame nao corre. Como
    // este titulo esta acima da dobra, esperar por ele significaria abrir a
    // pagina sem titulo nenhum. Escondido, aparece ja — nao ha animacao a
    // perder porque ninguem esta a ver.
    if (semMovimento() || document.hidden || !estaDesenhado(elemento) || jaEntrou(chave)) {
      elemento.classList.add("tmanecas-frase-visivel");
      return;
    }
    // Dois quadros: o primeiro pinta o estado escondido, o segundo arranca
    // a transicao. Com um so, o navegador junta-os e nao ha animacao.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      elemento.classList.add("tmanecas-frase-visivel");
    }));
  }

  function updateRouteLinks(root) {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";

      // BUSINESS abre o email em vez de uma pagina de contacto, que nunca
      // chegou a existir e caia no 404.
      if (href === "./contact" || href.startsWith("./contact#") ||
          /\/contact\/?$/.test(href)) {
        link.setAttribute("href", "mailto:" + EMAIL_NEGOCIOS);
        link.removeAttribute("target");
        link.setAttribute("aria-label", "Email TMANECAS — " + EMAIL_NEGOCIOS);
        return;
      }

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

  function updateMenuSocialLinks(root) {
    root.querySelectorAll("a[href]").forEach((link) => {
      // Os botoes do player apontam para as redes mas nao sao icones sociais:
      // reescrever-lhes o texto destruia o efeito letra a letra.
      if (link.closest("footer") || link.closest(".tmanecas-player") ||
          link.dataset.tmanecasMenuSocial === "true") return;
      const href = link.getAttribute("href") || "";
      const match = menuSocialByHost.find(([pattern]) => pattern.test(href));
      if (!match) return;
      const [, label, target] = match;
      link.dataset.tmanecasMenuSocial = "true";
      link.setAttribute("href", target);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.setAttribute("aria-label", `TMANECAS on ${label}`);
      // The label is duplicated inside the link to drive the hover slide, so
      // every text node has to be rewritten for both states to match.
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        if (node.nodeValue.trim()) node.nodeValue = label;
      });
    });
  }

  // O wordmark do rodape e composto por duas partes: a grande diz "AK." e a
  // pequena "RECORD". A home ja tratava disto no script embutido, mas as
  // paginas internas usam so este ficheiro e ficavam com o nome do template.
  // No rodape das paginas internas os icones do template apontam para
  // youtube.com e instagram.com em bruto — quem clica sai do site e nao
  // chega ao TMANECAS. O SoundCloud nem sequer devia estar ca.
  const footerSocialByHost = [
    [/soundcloud\.com/i, null, null],
    [/youtube\.com/i, "YouTube", "https://www.youtube.com/@tmanecas"],
    [/instagram\.com/i, "Instagram", "https://www.instagram.com/tmanecas_/"]
  ];

  function fixFooterSocials(root) {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (/@tmanecas|tmanecas_/.test(href)) return;
      const match = footerSocialByHost.find(([pattern]) => pattern.test(href));
      if (!match) return;
      const [, label, destino] = match;
      if (!destino) { link.remove(); return; }
      link.setAttribute("href", destino);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.setAttribute("aria-label", `TMANECAS on ${label}`);
    });

    // A pagina do artista no Spotify ja existe: o icone deixou de ser inerte.
    // O botao do player fica de fora — esse aponta para a SAUDADE, e este
    // laco reescrevia-o para a pagina do artista.
    root.querySelectorAll('a[href*="open.spotify.com"]:not(.tmanecas-player__action)').forEach((link) => {
      link.setAttribute("href", "https://open.spotify.com/artist/6Fnzjt1cFYApY2SIGGcHBG");
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.removeAttribute("aria-disabled");
      link.setAttribute("aria-label", "TMANECAS on Spotify");
      link.classList.remove("tmanecas-streaming-disabled");
    });
  }

  // No telemovel o rodape fica centrado. Aplicado por script porque o Framer
  // define estas caixas em estilo inline e a folha de estilos nao ganha.
  function centrarRodapeNoTelemovel(root) {
    const estreito = window.matchMedia("(max-width: 809.98px)").matches;
    root.querySelectorAll("footer").forEach((rodape) => {
      ["Right", "Page & Infomation", "Top", "Bottom", "Page Listing", "Social List"].forEach((nome) => {
        rodape.querySelectorAll(`[data-framer-name="${nome}"]`).forEach((caixa) => {
          if (estreito) {
            caixa.style.setProperty("align-items", "center", "important");
            // A lista de icones e uma linha: sem isto a caixa fica centrada
            // mas os icones amontoam-se a esquerda dentro dela.
            if (nome === "Social List") caixa.style.setProperty("justify-content", "center", "important");
            if (nome === "Page Listing") caixa.style.setProperty("width", "100%", "important");
          } else {
            caixa.style.removeProperty("align-items");
            if (nome === "Social List") caixa.style.removeProperty("justify-content");
            if (nome === "Page Listing") caixa.style.removeProperty("width");
          }
        });
      });
    });
  }

  function fixFooterWordmark(root) {
    root.querySelectorAll('[data-framer-name="Company Name"]').forEach((wordmark) => {
      const partes = wordmark.querySelectorAll("svg");
      const principal = partes[0];
      const secundaria = partes[1];
      const texto = principal?.querySelector("p");
      if (texto && texto.textContent.trim() !== "TMANECAS") texto.textContent = "TMANECAS";
      if (principal) {
        principal.setAttribute("viewBox", "0 0 700 211");
        principal.style.setProperty("width", "100%", "important");
      }
      if (secundaria) secundaria.style.setProperty("display", "none", "important");
    });
  }

  // O rodape e o unico bloco que todas as rotas partilham, e chegava sempre
  // inteiro, de uma vez. Aqui sobe por partes, com a mesma medida da lista de
  // faixas: 26px, 70ms entre cada uma.
  //
  // As cinco caixas escolhidas nao se contem umas as outras — animar mae e
  // filha empilhava os deslocamentos e o texto saltava o dobro.
  function animarRodape(root) {
    root.querySelectorAll("footer").forEach((rodape) => {
      if (rodape.dataset.tmanecasEntradaLigada === "true") return;
      const partes = [...rodape.querySelectorAll(
        '[data-framer-name="Company Name"],' +
        '[data-framer-name="Left"],' +
        '[data-framer-name="Page Listing"],' +
        '[data-framer-name="Social List"],' +
        '.tmanecas-coming-soon,' +
        '[data-framer-name="Bottom"]'
      )].filter(estaDesenhado);
      if (!partes.length) return;
      rodape.dataset.tmanecasEntradaLigada = "true";
      if (semMovimento()) return;

      partes.forEach((parte, indice) => {
        parte.classList.add("tmanecas-entrada-item");
        parte.style.setProperty("transition-delay", `${indice * 70}ms`);
        parte.dataset.tmanecasEntrada = "por-entrar";
      });

      revelarAoEntrarNoEcra(rodape, () => {
        partes.forEach((parte) => { delete parte.dataset.tmanecasEntrada; });
      }, 0.18);
    });
  }

  // Os dois lancamentos sao a pagina inteira e chegavam de uma vez.
  //
  // Apanham-se pela caixa da imagem e sobe-se ate ao <a>: o customizeReleases
  // arranca o href aos cartoes, por isso um seletor por href deixaria de
  // casar depois da primeira passagem.
  //
  // O filtro do que esta desenhado nao e cosmetico: o template traz quatro
  // cartoes vezes duas variantes de largura, e so dois estao visiveis. Sem
  // ele os indices saiam trocados e os atrasos com eles.
  function animarCartoesReleases(root) {
    if (route !== "releases") return;
    const cartoes = [...root.querySelectorAll('[data-framer-name="Image box"]')]
      .map((caixa) => caixa.closest("a"))
      .filter((cartao, indice, todos) =>
        cartao && todos.indexOf(cartao) === indice && estaDesenhado(cartao));

    cartoes.forEach((cartao, indice) => {
      if (cartao.dataset.tmanecasEntradaLigada === "true") return;
      cartao.dataset.tmanecasEntradaLigada = "true";
      if (semMovimento()) return;
      cartao.classList.add("tmanecas-entrada-item");
      cartao.style.setProperty("transition-delay", `${(indice % 2) * 70}ms`);
      cartao.dataset.tmanecasEntrada = "por-entrar";
      revelarAoEntrarNoEcra(cartao, () => {
        delete cartao.dataset.tmanecasEntrada;
      }, 0.18);
    });
  }

  function updateHomeStatement(root) {
    root.querySelectorAll("p, h1, h2, h3").forEach((element) => {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      if (!text.startsWith("TMANECAS blends Angolan roots") || element.dataset.grandaMambo === "true") return;
      element.dataset.grandaMambo = "true";

      // Esta e a maior frase da pagina e chegava formada, de uma vez, no
      // instante em que o painel branco prende. Passa a escrever-se palavra a
      // palavra, como a do hero: sao as duas declaracoes do site e devem
      // falar no mesmo tom.
      //
      // O GRANDA MAMBO mantem o seu span — tem estilo proprio — e as palavras
      // entram dentro dele.
      let n = 0;
      const emPalavras = (linha) => linha.split(" ")
        .map((palavra) =>
          `<span class="tmanecas-palavra" style="transition-delay:${(n++ * 45)}ms">${palavra}</span>`)
        .join(" ");

      element.innerHTML =
        emPalavras("TMANECAS blends Angolan roots, live energy,") + "<br>" +
        emPalavras("and a timeless Semba spirit.") + "<br>" +
        '<span class="tmanecas-granda-mambo">' + emPalavras("GRANDA MAMBO") + "</span>";

      frasePorScroll(element);
    });
  }

  function customizeMusic(root) {
    if (route !== "music") return;
    const hero = root.querySelector('[data-framer-name="Section: Hero"]');
    hero?.querySelectorAll(':scope > [data-framer-background-image-wrapper="true"]').forEach((image) => image.remove());
    hero?.querySelectorAll("h1").forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      // Este titulo do template entrava letra a letra, por efeito proprio do
      // Framer, e reescrever o innerHTML deitava esse efeito fora — ficava a
      // unica coisa acima da dobra desta pagina a aparecer de repente.
      // Volta a entrar, agora palavra a palavra, como a frase da home.
      partirEmPalavras(heading, ["TMANECAS", "SEMBA LEGACY."]);
      fraseAoChegar(heading, "music:hero");
    });

    const intro = root.querySelector('[data-framer-name="Section: Intro"]');
    intro?.querySelectorAll('[data-framer-name="Row 1"] h1, [data-framer-name="Row 1"] p').forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      partirEmPalavras(heading, ["WHERE ANGOLAN", "RHYTHM BECOMES", "LEGACY."]);
      frasePorScroll(heading);
    });
    intro?.querySelectorAll('[data-framer-name="Row 2"] h1, [data-framer-name="Row 2"] h2').forEach((heading) => {
      if (heading.dataset.tmanecasMusicCopy === "true") return;
      heading.dataset.tmanecasMusicCopy = "true";
      partirEmPalavras(heading, [
        "TMANECAS CARRIES", "ANGOLA IN EVERY NOTE", "SEMBA WITH SOUL,",
        "MADE TO MOVE", "GENERATIONS."
      ]);
      frasePorScroll(heading);
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
      if (newTitle.startsWith("SAUDADE") || newTitle.startsWith("DANGEREUX")) {
        const image = anchor.querySelector("img");
        if (image) {
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
          image.src = siteAsset(newTitle.startsWith("SAUDADE") ? "saudade.jpg" : "dangereux-work-II.jpg");
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

  // O bundle do Framer ainda navega para as rotas do template original
  // (/service, /works), que nao existem como ficheiros. Sem isto o URL fica
  // numa morada 404 e qualquer refresh destroi a pagina — e o som com ela.
  const rotasOriginais = [
    ["service", "music"],
    ["works", "releases"]
  ];

  function siteRoot() {
    const repositoryBase = "/tmanecas-music-site/";
    const at = location.pathname.indexOf(repositoryBase);
    return at >= 0 ? location.pathname.slice(0, at + repositoryBase.length) : "/";
  }

  // Os links do Framer sao relativos, por isso a partir de /music/ um clique em
  // "./releases" produz /music/releases/ — um caminho que nao existe. Aqui o URL
  // e sempre reescrito a partir da raiz, o que tambem desfaz esse aninhamento.
  function normalizeUrl() {
    if (location.protocol === "file:") return;
    const segmentos = location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    let ultimo = segmentos.at(-1) || "";
    if (ultimo === "index.html") ultimo = segmentos.at(-2) || "";
    const mapa = new Map(rotasOriginais);
    const destinoRota = mapa.get(ultimo) || (["music", "releases", "contact"].includes(ultimo) ? ultimo : null);
    if (!destinoRota) return;
    const esperado = siteRoot() + destinoRota + "/";
    if (location.pathname === esperado) return;
    history.replaceState(history.state, "", esperado + location.search + location.hash);
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    normalizeUrl();
    route = getCurrentRoute();
    document.body.classList.toggle("tmanecas-music-route", route === "music");
    document.body.classList.toggle("tmanecas-releases-route", route === "releases");
    updateRouteLinks(document);
    updateText(document);
    updateMenuSocials(document);
    updateMenuSocialLinks(document);
    fixFooterSocials(document);
    centrarRodapeNoTelemovel(document);
    fixFooterWordmark(document);
    updateHomeStatement(document);
    customizeMusic(document);
    customizeReleases(document);
    customizeContact(document);
    // Depois do customizeReleases: e ele que deixa os cartoes no estado final.
    animarCartoesReleases(document);
    animarRodape(document);
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();

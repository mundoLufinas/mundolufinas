/* =========================================================
   MUNDO LUFINAS — INCLUDES GLOBAIS
   Carrega cabeçalho, rodapé e ícones em todas as páginas.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  /* ---------------------------------------------------------
     CARREGA FONT AWESOME
     --------------------------------------------------------- */

  function carregarFontAwesome() {

    if (document.querySelector('link[data-mundo-fontawesome]')) {
      return;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";

    link.setAttribute("data-mundo-fontawesome", "true");

    document.head.appendChild(link);
  }

  carregarFontAwesome();


  /* ---------------------------------------------------------
     ANALYTICS — somente fora do ambiente local
     --------------------------------------------------------- */

  const hostLocal =
    ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

  if (!hostLocal) {

    const ga = document.createElement("script");

    ga.async = true;
    ga.src =
      "https://www.googletagmanager.com/gtag/js?id=G-LYHT31VRSN";

    document.head.appendChild(ga);

    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
      dataLayer.push(arguments);
    };

    gtag("js", new Date());
    gtag("config", "G-LYHT31VRSN");


    (function(c,l,a,r,i,t,y){

      c[a] =
        c[a] ||
        function(){
          (c[a].q = c[a].q || []).push(arguments);
        };

      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;

      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t,y);

    })(
      window,
      document,
      "clarity",
      "script",
      "y6v9kyxcwo"
    );
  }


  /* ---------------------------------------------------------
     CARREGA CABEÇALHO E RODAPÉ
     --------------------------------------------------------- */

  async function carregarInclude(seletor, arquivo) {

    const alvo = document.querySelector(seletor);

    if (!alvo) return;

    try {

      const resposta = await fetch(arquivo, {
        cache: "no-cache"
      });

      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
      }

      alvo.innerHTML = await resposta.text();

    } catch (erro) {

      console.error(
        `Mundo LuFiNas: não foi possível carregar ${arquivo}.`,
        erro
      );
    }
  }


  await Promise.all([

    carregarInclude(
      "#site-header",
      "/includes/header.html"
    ),

    carregarInclude(
      "#site-footer",
      "/includes/footer.html"
    )

  ]);


  /* ---------------------------------------------------------
     MARCA AUTOMATICAMENTE A PÁGINA ATUAL NO MENU
     --------------------------------------------------------- */

  const caminho =
    window.location.pathname.toLowerCase();

  const links =
    document.querySelectorAll(
      "#site-header .portal-nav a"
    );


  links.forEach(link => {

    link.classList.remove("active");

    const href =
      (link.getAttribute("href") || "")
      .toLowerCase();


    const ativo =

      (
        href === "/index.html" &&
        (
          caminho === "/" ||

          (
            caminho.endsWith("/index.html") &&
            !caminho.includes("/casa/") &&
            !caminho.includes("/bem-estar/") &&
            !caminho.includes("/consumo-seguranca/")
          )
        )
      )

      ||

      (
        href === "/casa.html" &&
        (
          caminho.endsWith("/casa.html") ||
          caminho.includes("/casa/")
        )
      )

      ||

      (
        href === "/bem-estar.html" &&
        (
          caminho.endsWith("/bem-estar.html") ||
          caminho.includes("/bem-estar/")
        )
      )

      ||

      (
        href === "/consumo-seguranca.html" &&
        (
          caminho.endsWith(
            "/consumo-seguranca.html"
          ) ||
          caminho.includes("/consumo-seguranca/")
        )
      )

      ||

      (
        href === "/vitrine.html" &&
        caminho.endsWith("/vitrine.html")
      );


    if (ativo) {
      link.classList.add("active");
    }

  });

});


/* =========================================================
   MENU FIXO AO ROLAR
   ========================================================= */

function MundoLufinasPrepararMenuFixo() {

  const menuPortal =
    document.querySelector(
      "#site-header .portal-nav"
    );

  const topoPortal =
    document.querySelector(
      "#site-header .portal-top"
    );


  if (
    !menuPortal ||
    !topoPortal ||
    menuPortal.dataset.stickyReady === "1"
  ) {
    return;
  }


  menuPortal.dataset.stickyReady = "1";


  /* Cria um espaço no lugar do menu quando ele fica fixo,
     evitando que a página dê um "pulo". */

  const spacerMenu =
    document.createElement("div");

  spacerMenu.className =
    "portal-nav-spacer";

  menuPortal.insertAdjacentElement(
    "afterend",
    spacerMenu
  );


  function atualizarMenuFixo() {

    const deveFixar =
      topoPortal
        .getBoundingClientRect()
        .bottom <= 0;


    menuPortal.classList.toggle(
      "is-fixed",
      deveFixar
    );

    spacerMenu.classList.toggle(
      "ativo",
      deveFixar
    );
  }


  atualizarMenuFixo();


  window.addEventListener(
    "scroll",
    atualizarMenuFixo,
    { passive: true }
  );


  window.addEventListener(
    "resize",
    atualizarMenuFixo
  );
}


/* O header é carregado por fetch.
   Por isso aguardamos até o menu realmente existir. */

const MundoLufinasMenuObserver =
  new MutationObserver(() => {

    if (
      document.querySelector(
        "#site-header .portal-nav"
      )
    ) {

      MundoLufinasPrepararMenuFixo();

      MundoLufinasMenuObserver.disconnect();
    }

  });


document.addEventListener(
  "DOMContentLoaded",
  () => {

    const siteHeader =
      document.getElementById(
        "site-header"
      );


    if (siteHeader) {

      MundoLufinasMenuObserver.observe(
        siteHeader,
        {
          childList: true,
          subtree: true
        }
      );


      MundoLufinasPrepararMenuFixo();
    }

  }
);


/* =========================================================
   BUSCA DO PORTAL
   Exibe resultados abaixo da barra e só navega após a escolha.
   ========================================================= */

const MundoLufinasPaginas = [

  {
    titulo:
      "Como organizar uma cozinha pequena sem gastar muito",
    descricao:
      "Organização, cozinha pequena, espaço, prateleiras e soluções práticas.",
    categoria:
      "Casa & Vida Prática",
    url:
      "/casa/cozinha-organizada/"
  },

  {
    titulo:
      "Guarda-roupa pequeno e cheio?",
    descricao:
      "Organização de guarda-roupa, armário, roupas e aproveitamento de espaço.",
    categoria:
      "Casa & Vida Prática",
    url:
      "/casa/guarda-roupa/"
  },

  {
    titulo:
      "Casa organizada sem passar o dia limpando",
    descricao:
      "Rotina simples de organização e limpeza para cuidar da casa.",
    categoria:
      "Casa & Vida Prática",
    url:
      "/casa/rotina-casa-organizada/"
  },

  {
    titulo:
      "Casa pequena: como aproveitar melhor os espaços",
    descricao:
      "Espaços pequenos, móveis, organização e melhor aproveitamento da casa.",
    categoria:
      "Casa & Vida Prática",
    url:
      "/casa/aproveitar-espaco-pequeno/"
  },

  {
    titulo:
      "Alimentação saudável e barata",
    descricao:
      "Alimentação, comida, hábitos e escolhas para comer melhor sem gastar demais.",
    categoria:
      "Bem-estar & Autocuidado",
    url:
      "/bem-estar/alimentacao-saudavel/"
  },

  {
    titulo:
      "Como se movimentar mais no dia a dia",
    descricao:
      "Movimento, atividade física, caminhada e hábitos para uma rotina mais ativa.",
    categoria:
      "Bem-estar & Autocuidado",
    url:
      "/bem-estar/movimente-se/"
  },

  {
    titulo:
      "Sono: pequenas mudanças para organizar melhor a rotina da noite",
    descricao:
      "Sono, dormir melhor, hábitos noturnos e organização da rotina da noite.",
    categoria:
      "Bem-estar & Autocuidado",
    url:
      "/bem-estar/sono/"
  },

  {
    titulo:
      "Golpe do Pix: o que conferir antes de pagar?",
    descricao:
      "Pix, pagamento, golpe, fraude, segurança e cuidados antes de transferir.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/golpe-pix/como-evitar-golpe-do-pix-antes-de-pagar.html"
  },

  {
    titulo:
      "Fiz um Pix e percebi que era golpe: o que fazer?",
    descricao:
      "Pix já realizado, fraude, golpe, MED e providências após o pagamento.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/fiz-pix-errado-o-q-fazer/"
  },

  {
    titulo:
      "Como saber se uma promoção é realmente boa?",
    descricao:
      "Promoção, oferta, desconto, preço, comparação e compra consciente.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/promocao-vale-a-pena/como-saber-se-promocao-vale-a-pena.html"
  },

  {
    titulo:
      "Como saber se um site é confiável antes de comprar",
    descricao:
      "Site confiável, loja online, compra pela internet, segurança e dados.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/site-confiavel/como-saber-se-um-site-e-confiavel.html"
  },

  {
    titulo:
      "Recebi uma mensagem suspeita: como saber se é golpe?",
    descricao:
      "Mensagem suspeita, WhatsApp, SMS, e-mail, link, fraude e golpe.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/mensagem-suspeita/"
  },

  {
    titulo:
      "Ligações desconhecidas e chamadas insistentes",
    descricao:
      "Telefone, ligação desconhecida, chamadas insistentes, spam e segurança.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/ligacoes/"
  },

  {
    titulo:
      "Como gastar menos no supermercado",
    descricao:
      "Supermercado, economia, compras, lista, preço e como gastar menos.",
    categoria:
      "Consumo & Segurança",
    url:
      "/consumo-seguranca/gastar-menos/"
  }

];


function MundoLufinasNormalizar(texto) {

  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function MundoLufinasEscapar(texto) {

  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function MundoLufinasPesquisar(valor) {

  const consulta =
    MundoLufinasNormalizar(valor);


  if (!consulta) {
    return [];
  }


  const termos =
    consulta
      .split(" ")
      .filter(t => t.length > 1);


  return MundoLufinasPaginas

    .map(pagina => {

      const titulo =
        MundoLufinasNormalizar(
          pagina.titulo
        );

      const descricao =
        MundoLufinasNormalizar(
          pagina.descricao
        );

      const categoria =
        MundoLufinasNormalizar(
          pagina.categoria
        );


      const base =
        `${titulo} ${descricao} ${categoria}`;


      let pontos = 0;


      if (titulo.includes(consulta)) {
        pontos += 12;
      }


      if (base.includes(consulta)) {
        pontos += 6;
      }


      termos.forEach(termo => {

        if (titulo.includes(termo)) {
          pontos += 5;
        }

        else if (categoria.includes(termo)) {
          pontos += 3;
        }

        else if (descricao.includes(termo)) {
          pontos += 2;
        }

      });


      return {
        ...pagina,
        pontos
      };

    })

    .filter(
      item => item.pontos > 0
    )

    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        a.titulo.localeCompare(
          b.titulo,
          "pt-BR"
        )
    )

    .slice(0, 6);
}


function MundoLufinasMostrarResultados(valor) {

  const painel =
    document.getElementById(
      "portal-search-results"
    );

  const campo =
    document.getElementById(
      "portal-search-input"
    );


  if (!painel || !campo) {
    return;
  }


  const consulta =
    String(valor || "").trim();


  if (!consulta) {

    painel.hidden = true;
    painel.innerHTML = "";

    campo.setAttribute(
      "aria-expanded",
      "false"
    );

    return;
  }


  const resultados =
    MundoLufinasPesquisar(
      consulta
    );


  if (!resultados.length) {

    painel.innerHTML = `
      <div class="portal-search-empty">

        <strong>
          Nenhum resultado encontrado.
        </strong>

        <span>
          Tente outra palavra, como
          “Pix”, “casa”, “sono” ou “promoção”.
        </span>

      </div>
    `;

  }

  else {

    painel.innerHTML = `

      <div class="portal-search-result-title">
        Resultados para “${MundoLufinasEscapar(consulta)}”
      </div>

      ${resultados.map(item => `

        <a
          class="portal-search-result"
          href="${MundoLufinasEscapar(item.url)}"
        >

          <span class="portal-search-result-category">
            ${MundoLufinasEscapar(item.categoria)}
          </span>

          <strong>
            ${MundoLufinasEscapar(item.titulo)}
          </strong>

          <small>
            ${MundoLufinasEscapar(item.descricao)}
          </small>

        </a>

      `).join("")}

    `;
  }


  painel.hidden = false;

  campo.setAttribute(
    "aria-expanded",
    "true"
  );
}


window.MundoLufinasBusca =
function(event) {

  if (event) {
    event.preventDefault();
  }


  const campo =
    document.getElementById(
      "portal-search-input"
    );


  const consulta =
    campo
      ? campo.value.trim()
      : "";


  if (!consulta) {
    return false;
  }


  MundoLufinasMostrarResultados(
    consulta
  );


  const primeiro =
    document.querySelector(
      "#portal-search-results .portal-search-result"
    );


  if (primeiro) {
    primeiro.focus();
  }


  return false;
};


document.addEventListener(
  "input",
  event => {

    if (
      event.target &&
      event.target.id ===
      "portal-search-input"
    ) {

      MundoLufinasMostrarResultados(
        event.target.value
      );
    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      const painel =
        document.getElementById(
          "portal-search-results"
        );

      const campo =
        document.getElementById(
          "portal-search-input"
        );


      if (painel) {

        painel.hidden = true;
        painel.innerHTML = "";

      }


      if (campo) {

        campo.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }

  }
);


document.addEventListener(
  "click",
  event => {

    const wrap =
      document.querySelector(
        ".portal-search-wrap"
      );

    const painel =
      document.getElementById(
        "portal-search-results"
      );

    const campo =
      document.getElementById(
        "portal-search-input"
      );


    if (
      wrap &&
      painel &&
      !wrap.contains(event.target)
    ) {

      painel.hidden = true;


      if (campo) {

        campo.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }

  }
);
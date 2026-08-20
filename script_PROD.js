// ============================================================
// MUNDO LUFINAS 4.0 - script_PROD.js
// ETAPA 4.0 - Ofertas de hoje + preços inteligentes
// Base: Etapa 1 já testada e aprovada
// ============================================================

let produtosFiltrados = [];
let paginaAtual = 1;
const produtosPorPagina = 24;
let cacheProdutos = null;


// ============================================================
// CARREGA OS PRODUTOS
// ============================================================

async function obterProdutos() {

    if (cacheProdutos !== null) {
        return cacheProdutos;
    }

    const resposta =
        await fetch("produtos.json");

    if (!resposta.ok) {

        throw new Error(
            `Erro ao carregar produtos.json: ${resposta.status}`
        );
    }

    const todosProdutos =
        await resposta.json();

    cacheProdutos =
        todosProdutos.filter(
            produto =>
                produto.ativo !== false
        );

    return cacheProdutos;
}


// ============================================================
// PROMOÇÃO RELÂMPAGO
// ============================================================

function promocaoRelampagoAtiva(produto) {

    if (
        produto.promocaoRelampago !== true
    ) {
        return false;
    }

    if (!produto.promocaoAte) {
        return false;
    }

    const dataFim =
        new Date(
            produto.promocaoAte
        );

    if (
        isNaN(
            dataFim.getTime()
        )
    ) {
        return false;
    }

    return (
        new Date() <
        dataFim
    );
}


// ============================================================
// TEXTO DE FIM DA PROMOÇÃO
// ============================================================

function textoFimPromocao(produto) {

    if (
        !promocaoRelampagoAtiva(
            produto
        )
    ) {
        return "";
    }

    const dataFim =
        new Date(
            produto.promocaoAte
        );

    const agora =
        new Date();

    const hoje =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate()
        );

    const amanha =
        new Date(hoje);

    amanha.setDate(
        hoje.getDate() + 1
    );

    const diaFim =
        new Date(
            dataFim.getFullYear(),
            dataFim.getMonth(),
            dataFim.getDate()
        );

    const hora =
        dataFim.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    if (
        diaFim.getTime() ===
        hoje.getTime()
    ) {

        return (
            `Termina hoje às ${hora}`
        );
    }

    if (
        diaFim.getTime() ===
        amanha.getTime()
    ) {

        return (
            `Termina amanhã às ${hora}`
        );
    }

    const data =
        dataFim.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit"
            }
        );

    return (
        `Até ${data} às ${hora}`
    );
}


// ============================================================
// EMBARALHA OS PRIMEIROS PRODUTOS
// ============================================================

function embaralharPrimeirosProdutos(
    produtos,
    quantidade = 10
) {

    const primeiros =
        produtos.slice(
            0,
            quantidade
        );

    const restante =
        produtos.slice(
            quantidade
        );

    for (
        let i =
            primeiros.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            primeiros[i],
            primeiros[j]
        ] =
        [
            primeiros[j],
            primeiros[i]
        ];
    }

    return [
        ...primeiros,
        ...restante
    ];
}


// ============================================================
// PREÇOS - FUNÇÕES GERAIS
// ============================================================

function converterPreco(preco) {

    if (
        typeof preco ===
        "number"
    ) {

        return Number.isFinite(
            preco
        )
            ? preco
            : 0;
    }

    if (
        typeof preco ===
        "string"
    ) {

        const numero =
            parseFloat(

                preco
                    .replace(
                        "R$",
                        ""
                    )
                    .replace(
                        /\s/g,
                        ""
                    )
                    .replace(
                        /\./g,
                        ""
                    )
                    .replace(
                        ",",
                        "."
                    )
            );

        return Number.isFinite(
            numero
        )
            ? numero
            : 0;
    }

    return 0;
}


// ============================================================
// PREÇO MAIS BAIXO DISPONÍVEL
// Usado para ordenação
// ============================================================

function obterPrecoEfetivo(produto) {

    const promocional =
        converterPreco(
            produto.precoPromocional
        );

    if (
        promocional > 0
    ) {

        return promocional;
    }

    return converterPreco(
        produto.preco
    );
}


// ============================================================
// IDENTIFICA SE O PRODUTO TEM UMA OFERTA REAL
// ============================================================

function produtoTemOferta(produto) {

    if (
        !produto ||
        produto.ativo === false
    ) {

        return false;
    }

    if (
        promocaoRelampagoAtiva(
            produto
        )
    ) {

        return true;
    }

    const precoPromocional =
        converterPreco(
            produto.precoPromocional
        );

    const precoOriginal =
        converterPreco(
            produto.precoOriginal
        );

    const precoAtual =
        converterPreco(
            produto.preco
        );

    const desconto =
        Number(
            produto.desconto || 0
        );

    if (
        precoPromocional > 0
    ) {

        return true;
    }

    if (
        precoOriginal >
        precoAtual &&
        desconto > 0
    ) {

        return true;
    }

    return false;
}


// ============================================================
// EMBARALHA UMA LISTA
// ============================================================

function embaralharLista(lista) {

    const copia =
        [...lista];

    for (
        let i =
            copia.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            copia[i],
            copia[j]
        ] =
        [
            copia[j],
            copia[i]
        ];
    }

    return copia;
}


// ============================================================
// OFERTAS DE HOJE
// ============================================================

async function carregarOfertasHoje() {

    const container =
        document.getElementById(
            "ofertasHoje"
        );

    const secao =
        document.getElementById(
            "secaoOfertasHoje"
        );

    if (
        !container ||
        !secao
    ) {

        return;
    }

    try {

        const produtos =
            await obterProdutos();


        // ================================================
        // 1º - OFERTAS RELÂMPAGO
        // ================================================

        const relampago =
            embaralharLista(

                produtos.filter(
                    produto =>
                        promocaoRelampagoAtiva(
                            produto
                        )
                )
            );


        const idsRelampago =
            new Set(

                relampago.map(
                    produto =>
                        String(
                            produto.id
                        )
                )
            );


        // ================================================
        // 2º - DEMAIS OFERTAS
        // ================================================

        const demaisOfertas =
            embaralharLista(

                produtos.filter(
                    produto =>

                        produtoTemOferta(
                            produto
                        )

                        &&

                        !idsRelampago.has(
                            String(
                                produto.id
                            )
                        )
                )
            );


        // ================================================
        // NO MÁXIMO 4 PRODUTOS
        // ================================================

        const ofertas = [

            ...relampago,
            ...demaisOfertas

        ].slice(
            0,
            4
        );


        // ================================================
        // NENHUMA OFERTA
        // ================================================

        if (
            ofertas.length === 0
        ) {

            secao.style.display =
                "none";

            container.innerHTML =
                "";

            return;
        }


        secao.style.display =
            "";


        container.innerHTML =
            ofertas
                .map(
                    produto =>
                        montarCardOferta(
                            produto
                        )
                )
                .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar Ofertas de hoje:",
            erro
        );

        secao.style.display =
            "none";
    }
}


// ============================================================
// MONTA O CARD DA OFERTA
// ============================================================

function montarCardOferta(produto) {

    const precoNormal =
        produto.preco || "";

    const precoPromocional =
        produto.precoPromocional || "";

    const precoOriginal =
        produto.precoOriginal || "";

    const desconto =
        produto.desconto || "";


    const condicao =
        (
            produto.condicaoPreco ||
            ""
        )
            .toString()
            .trim()
            .toUpperCase();


    const ehPix =

        precoPromocional &&

        (
            condicao.includes(
                "PIX"
            ) ||

            condicao.includes(
                "MERCADO PAGO"
            )
        );


    const precoExibir =
        ehPix
            ? precoPromocional
            : precoNormal;


    // ========================================================
    // SELO
    // ========================================================

    let selo =
        "OFERTA";


    if (
        promocaoRelampagoAtiva(
            produto
        )
    ) {

        selo =
            "⚡ RELÂMPAGO";

    } else if (
        desconto
    ) {

        selo =
            `${desconto}% OFF`;
    }


    // ========================================================
    // PREÇO ORIGINAL
    // ========================================================

    const linhaOriginal =
        precoOriginal
            ? `

                <div>

                    <span
                        class="card-oferta-original"
                    >
                        R$ ${precoOriginal}
                    </span>

                    ${
                        desconto
                            ? `

                                <span
                                    class="card-oferta-desconto"
                                >
                                    ${desconto}% OFF
                                </span>

                            `
                            : ""
                    }

                </div>

            `
            : "";


    // ========================================================
    // PIX
    // ========================================================

    const infoPix =
        ehPix
            ? `

                <span
                    class="card-oferta-pix"
                >
                    no PIX
                </span>

            `
            : "";


    // ========================================================
    // PRAZO DA OFERTA RELÂMPAGO
    // ========================================================

    const prazoRelampago =
        promocaoRelampagoAtiva(
            produto
        )
            ? `

                <div
                    style="
                        margin-top:4px;
                        font-size:9px;
                        color:#8a5269;
                        font-weight:600;
                    "
                >
                    ${textoFimPromocao(produto)}
                </div>

            `
            : "";


    // ========================================================
    // CARD COMPLETO
    // ========================================================

    return `

        <a
            href="produto.html?id=${produto.id}"
            class="card-oferta"
        >

            <span
                class="card-oferta-selo"
            >
                ${selo}
            </span>


            <img
                src="${produto.imagem}"
                alt="${produto.alt || produto.nome}"
            >


            <div
                class="card-oferta-categoria"
            >
                ${produto.categoria || ""}
            </div>


            <div
                class="card-oferta-nome"
            >
                ${produto.nome}
            </div>


            ${linhaOriginal}


            <div
                class="card-oferta-preco"
            >

                R$ ${precoExibir}

                ${infoPix}

            </div>


            ${
                ehPix &&
                precoNormal

                    ? `

                        <div
                            style="
                                margin-top:2px;
                                font-size:11px;
                                color:#8f8289;
                            "
                        >
                            R$ ${precoNormal}
                            em outras formas
                        </div>

                    `
                    : ""
            }


            ${prazoRelampago}


            <span
                class="card-oferta-botao"
            >
                Ver oferta
            </span>

        </a>

    `;
}
// ============================================================
// CARREGA OS PRODUTOS DO CATÁLOGO
// ============================================================

async function carregarProdutos(
    categoria,
    destino
) {

    try {

        let produtos =
            [
                ...await obterProdutos()
            ];

        produtos.reverse();

        let produtosCategoria;


        if (
            categoria ===
            "Todos"
        ) {


            // =========================================
            // OFERTAS RELÂMPAGO ATIVAS
            // =========================================

            const promocoes =
                produtos.filter(

                    produto =>
                        promocaoRelampagoAtiva(
                            produto
                        )
                );


            promocoes.sort(
                () =>
                    Math.random() -
                    0.5
            );


            // =========================================
            // DESTAQUES
            // =========================================

            const destaques =
                produtos.filter(

                    produto =>

                        produto.destaque ===
                        true

                        &&

                        !promocaoRelampagoAtiva(
                            produto
                        )
                );


            destaques.sort(
                () =>
                    Math.random() -
                    0.5
            );


            const destaquesExibir =
                destaques.slice(
                    0,
                    6
                );


            // =========================================
            // IDs QUE JÁ FORAM PRIORIZADOS
            // =========================================

            const idsPrioritarios =
                new Set([

                    ...promocoes.map(
                        produto =>
                            String(
                                produto.id
                            )
                    ),

                    ...destaquesExibir.map(
                        produto =>
                            String(
                                produto.id
                            )
                    )

                ]);


            // =========================================
            // RESTANTE DO CATÁLOGO
            // =========================================

            const restantes =
                produtos.filter(

                    produto =>

                        !idsPrioritarios.has(
                            String(
                                produto.id
                            )
                        )
                );


            // =========================================
            // EMBARALHA OS MAIS RECENTES
            // =========================================

            const recentesEmbaralhados =
                embaralharPrimeirosProdutos(
                    restantes,
                    10
                );


            // =========================================
            // ORDEM FINAL
            // =========================================

            produtosCategoria = [

                ...promocoes,
                ...destaquesExibir,
                ...recentesEmbaralhados

            ];


        } else {


            produtosCategoria =
                produtos.filter(

                    produto =>
                        produto.categoria ===
                        categoria
                );
        }


        // =============================================
        // TÍTULO E QUANTIDADE
        // =============================================

        if (
            destino ===
            "catalogo"
        ) {

            const titulo =
                document.getElementById(
                    "tituloCategoria"
                );

            const quantidade =
                document.getElementById(
                    "quantidadeProdutos"
                );


            if (titulo) {

                titulo.innerText =
                    categoria === "Todos"
                        ? "Todos os produtos"
                        : categoria;
            }


            if (quantidade) {

                quantidade.innerText =
                    produtosCategoria.length +
                    " produtos encontrados";
            }
        }


        const catalogo =
            document.getElementById(
                destino
            );


        if (!catalogo) {
            return;
        }


        produtosFiltrados =
            produtosCategoria;

        paginaAtual =
            1;


        renderizarPagina();


    } catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );
    }
}


// ============================================================
// RENDERIZA O CATÁLOGO
// ============================================================

function renderizarPagina() {

    const catalogo =
        document.getElementById(
            "catalogo"
        );

    if (!catalogo) {
        return;
    }


    catalogo.innerHTML =
        "";


    const inicio =
        (
            paginaAtual -
            1
        ) *
        produtosPorPagina;


    const fim =
        inicio +
        produtosPorPagina;


    const produtosPagina =
        produtosFiltrados.slice(
            inicio,
            fim
        );


    // =====================================================
    // MONTA A ÁREA DE PREÇOS DO CARD
    // =====================================================

    function montarPrecoCard(produto) {

        const preco =
            produto.preco ||
            "";

        const precoPromocional =
            produto.precoPromocional ||
            "";

        const precoOriginal =
            produto.precoOriginal ||
            "";

        const desconto =
            produto.desconto ||
            "";

        const condicao =
            (
                produto.condicaoPreco ||
                ""
            )
                .toString()
                .trim()
                .toUpperCase();


        // =================================================
        // PREÇO ESPECIAL NO PIX
        // =================================================

        if (

            precoPromocional &&

            (
                condicao.includes(
                    "PIX"
                ) ||

                condicao.includes(
                    "MERCADO PAGO"
                )
            )
        ) {

            return `

                <div
                    style="
                        min-height: 76px;
                        margin-bottom: 4px;
                    "
                >

                    ${
                        precoOriginal
                            ? `

                                <div
                                    style="
                                        font-size: 12px;
                                        color: #888;
                                        line-height: 1.2;
                                        margin-bottom: 2px;
                                    "
                                >

                                    <span
                                        style="
                                            text-decoration: line-through;
                                        "
                                    >
                                        R$ ${precoOriginal}
                                    </span>

                                    ${
                                        desconto
                                            ? `

                                                <span
                                                    style="
                                                        margin-left: 6px;
                                                        color: #198754;
                                                        font-weight: 800;
                                                    "
                                                >
                                                    ${desconto}% OFF
                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            `
                            : ""
                    }


                    <div
                        style="
                            font-size: 25px;
                            color: #814e0a;
                            font-weight: 900;
                            line-height: 1.05;
                        "
                    >
                        R$ ${precoPromocional}
                    </div>


                    <div
                        style="
                            font-size: 11px;
                            color: #198754;
                            font-weight: 800;
                            margin-top: 2px;
                            line-height: 1.2;
                        "
                    >
                        no PIX
                    </div>


                    ${
                        preco
                            ? `

                                <div
                                    style="
                                        font-size: 11px;
                                        color: #777;
                                        margin-top: 3px;
                                        line-height: 1.2;
                                    "
                                >
                                    R$ ${preco}
                                    em outras formas
                                </div>

                            `
                            : ""
                    }

                </div>

            `;
        }


        // =================================================
        // OFERTA COMUM
        // =================================================

        if (
            precoOriginal &&
            desconto
        ) {

            return `

                <div
                    style="
                        min-height: 76px;
                        margin-bottom: 4px;
                    "
                >

                    <div
                        style="
                            font-size: 12px;
                            color: #888;
                            line-height: 1.2;
                            margin-bottom: 3px;
                        "
                    >

                        <span
                            style="
                                text-decoration: line-through;
                            "
                        >
                            R$ ${precoOriginal}
                        </span>


                        <span
                            style="
                                margin-left: 6px;
                                color: #198754;
                                font-weight: 800;
                            "
                        >
                            ${desconto}% OFF
                        </span>

                    </div>


                    <div
                        style="
                            font-size: 25px;
                            color: #814e0a;
                            font-weight: 900;
                            line-height: 1.05;
                        "
                    >
                        R$ ${preco}
                    </div>

                </div>

            `;
        }


        // =================================================
        // PREÇO NORMAL
        // =================================================

        return `

            <div
                style="
                    min-height: 76px;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: flex-start;
                "
            >

                <div
                    style="
                        font-size: 25px;
                        color: #814e0a;
                        font-weight: 900;
                        line-height: 1.05;
                    "
                >
                    R$ ${preco}
                </div>

            </div>

        `;
    }


    // =====================================================
    // RENDERIZA OS PRODUTOS
    // =====================================================

    produtosPagina.forEach(
        produto => {

            catalogo.innerHTML += `

<div class="col-6 col-md-6 col-lg-4 col-xl-3 px-1">

    <a
        href="produto.html?id=${produto.id}"
        style="
            display: block;
            text-decoration: none;
            color: inherit;
            height: 100%;
        "
    >

        <div
            class="rounded position-relative fruite-item"
            style="
                height: 100%;
                cursor: pointer;
                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            "
            onmouseover="
                this.style.transform='translateY(-3px)';
                this.style.boxShadow=
                    '0 5px 15px rgba(0,0,0,0.10)';
            "
            onmouseout="
                this.style.transform='translateY(0)';
                this.style.boxShadow='none';
            "
        >

            <div
                class="fruite-img position-relative"
            >


                ${
                    promocaoRelampagoAtiva(
                        produto
                    )
                        ? `

                    <span
                        style="
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            z-index: 5;
                            background: #fff3cd;
                            color: #8a5200;
                            border: 1px solid #ffc107;
                            border-radius: 12px;
                            padding: 5px 10px;
                            font-size: 11px;
                            font-weight: 800;
                            line-height: 1.2;
                            box-shadow:
                                0 2px 6px
                                rgba(0,0,0,0.12);
                        "
                    >

                        <div>
                            ⚡ OFERTA RELÂMPAGO
                        </div>

                        <div
                            style="
                                margin-top: 2px;
                                font-size: 9px;
                                font-weight: 600;
                            "
                        >
                            ${textoFimPromocao(produto)}
                        </div>

                    </span>

                `
                        : produto.destaque === true
                            ? `

                    <span
                        style="
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            z-index: 5;
                            background: #ffffff;
                            color: #814e0a;
                            border: 1px solid #e5c89b;
                            border-radius: 20px;
                            padding: 5px 10px;
                            font-size: 11px;
                            font-weight: 800;
                            box-shadow:
                                0 2px 6px
                                rgba(0,0,0,0.12);
                        "
                    >
                        ⭐ DESTAQUE
                    </span>

                `
                            : ""
                }


                <img
                    src="${produto.imagem}"
                    class="img-fluid w-100 rounded-top"
                    alt="${produto.nome}"
                    style="
                        display: block;
                        transition:
                            opacity 0.2s ease;
                    "
                    onmouseover="
                        this.style.opacity='0.92'
                    "
                    onmouseout="
                        this.style.opacity='1'
                    "
                >

            </div>


            <div
                class="
                    p-4
                    border
                    border-secondary
                    border-top-0
                    rounded-bottom
                "
            >

                <p
                    class="mb-1"
                    style="
                        font-size: 18px;
                        color: #444444;
                        font-weight: 800;
                        line-height: 1.2;
                    "
                >
                    <strong>
                        ${produto.nome}
                    </strong>
                </p>


                <div
                    class="mb-2"
                    style="
                        font-size: 12px;
                        color: #999;
                        line-height: 1.2;
                        min-height: 15px;
                    "
                >
                    ${produto.categoria}
                </div>


                ${montarPrecoCard(produto)}


                <div
                    class="mt-2 text-left"
                >

                    <span
                        class="
                            btn
                            border
                            border-secondary
                            rounded-2
                            px-4
                            text-rosa-escuro
                            text-nowrap
                        "
                        style="
                            font-size: 13px;
                            background-color: #fff8fc;
                            box-shadow:
                                0 2px 5px
                                rgba(0,0,0,0.10);
                        "
                    >
                        Mais detalhes
                    </span>

                </div>

            </div>

        </div>

    </a>

</div>

`;

        }
    );


    criarPaginacao();
}


// ============================================================
// FIM DA PARTE 1
// PARTE 2 COMEÇA EM:
// function criarPaginacao()
// ============================================================
// ============================================================
// PARTE 3
// PAGINAÇÃO
// ============================================================

function criarPaginacao() {

    const paginacao =
        document.querySelector(
            ".pagination"
        );

    if (!paginacao) {
        return;
    }


    paginacao.innerHTML =
        "";


    const totalPaginas =
        Math.ceil(
            produtosFiltrados.length /
            produtosPorPagina
        );


    if (
        totalPaginas <= 1
    ) {
        return;
    }


    // ========================================================
    // BOTÃO ANTERIOR
    // ========================================================

    if (
        paginaAtual > 1
    ) {

        const anterior =
            document.createElement(
                "a"
            );

        anterior.href =
            "#todosProdutos";

        anterior.innerHTML =
            "‹";

        anterior.title =
            "Página anterior";


        anterior.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                paginaAtual--;

                renderizarPagina();

                rolarParaCatalogo();
            }
        );


        paginacao.appendChild(
            anterior
        );
    }


    // ========================================================
    // NÚMEROS DAS PÁGINAS
    // ========================================================

    let inicio =
        Math.max(
            1,
            paginaAtual - 2
        );

    let fim =
        Math.min(
            totalPaginas,
            paginaAtual + 2
        );


    // Tenta manter até 5 números visíveis

    if (
        fim - inicio < 4
    ) {

        if (
            inicio === 1
        ) {

            fim =
                Math.min(
                    totalPaginas,
                    inicio + 4
                );

        } else if (
            fim === totalPaginas
        ) {

            inicio =
                Math.max(
                    1,
                    fim - 4
                );
        }
    }


    // Primeira página quando estiver longe

    if (
        inicio > 1
    ) {

        criarBotaoPagina(
            paginacao,
            1
        );


        if (
            inicio > 2
        ) {

            const pontos =
                document.createElement(
                    "span"
                );

            pontos.innerText =
                "…";

            pontos.style.cssText =
                `
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    min-width:30px;
                    color:#8c7a83;
                `;

            paginacao.appendChild(
                pontos
            );
        }
    }


    // Páginas centrais

    for (
        let pagina = inicio;
        pagina <= fim;
        pagina++
    ) {

        criarBotaoPagina(
            paginacao,
            pagina
        );
    }


    // Última página quando estiver longe

    if (
        fim < totalPaginas
    ) {

        if (
            fim <
            totalPaginas - 1
        ) {

            const pontos =
                document.createElement(
                    "span"
                );

            pontos.innerText =
                "…";

            pontos.style.cssText =
                `
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    min-width:30px;
                    color:#8c7a83;
                `;

            paginacao.appendChild(
                pontos
            );
        }


        criarBotaoPagina(
            paginacao,
            totalPaginas
        );
    }


    // ========================================================
    // BOTÃO PRÓXIMO
    // ========================================================

    if (
        paginaAtual <
        totalPaginas
    ) {

        const proximo =
            document.createElement(
                "a"
            );

        proximo.href =
            "#todosProdutos";

        proximo.innerHTML =
            "›";

        proximo.title =
            "Próxima página";


        proximo.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                paginaAtual++;

                renderizarPagina();

                rolarParaCatalogo();
            }
        );


        paginacao.appendChild(
            proximo
        );
    }
}


// ============================================================
// CRIA BOTÃO DE UMA PÁGINA
// ============================================================

function criarBotaoPagina(
    paginacao,
    numero
) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        "#todosProdutos";

    link.innerText =
        numero;


    if (
        numero ===
        paginaAtual
    ) {

        link.classList.add(
            "active"
        );
    }


    link.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (
                paginaAtual ===
                numero
            ) {

                return;
            }


            paginaAtual =
                numero;

            renderizarPagina();

            rolarParaCatalogo();
        }
    );


    paginacao.appendChild(
        link
    );
}


// ============================================================
// ROLA PARA O INÍCIO DO CATÁLOGO
// ============================================================

function rolarParaCatalogo() {

    const area =
        document.getElementById(
            "todosProdutos"
        );


    if (!area) {
        return;
    }


    const topo =
        area.getBoundingClientRect().top +
        window.pageYOffset -
        125;


    window.scrollTo({
        top: topo,
        behavior: "smooth"
    });
}


// ============================================================
// BUSCA
// ============================================================

const campoPesquisa =
    document.getElementById(
        "campoPesquisa"
    );


if (campoPesquisa) {

    campoPesquisa.addEventListener(
        "input",
        async function () {

            const termo =
                this.value
                    .trim()
                    .toLowerCase();


            // =================================================
            // BUSCA VAZIA
            // =================================================

            if (
                termo === ""
            ) {

                const categoriaAtiva =
                    document.querySelector(
                        ".categoria-tab.ativa"
                    );


                const categoria =
                    categoriaAtiva
                        ? categoriaAtiva.dataset.categoria
                        : "Todos";


                const subcategoriaAtiva =
                    document.querySelector(
                        ".subcategoria-tab.ativa"
                    );


                if (
                    subcategoriaAtiva &&
                    subcategoriaAtiva.dataset.subcategoria !==
                    "Todos"
                ) {

                    await filtrarSubcategoria(
                        categoria,
                        subcategoriaAtiva.dataset.subcategoria
                    );

                } else {

                    await carregarProdutos(
                        categoria,
                        "catalogo"
                    );
                }


                return;
            }


            try {

                const produtos =
                    await obterProdutos();


                const resultados =
                    produtos.filter(
                        produto => {

                            const nome =
                                (
                                    produto.nome ||
                                    ""
                                )
                                    .toString()
                                    .toLowerCase();


                            const categoria =
                                (
                                    produto.categoria ||
                                    ""
                                )
                                    .toString()
                                    .toLowerCase();


                            const subcategoria =
                                (
                                    produto.subcategoria ||
                                    ""
                                )
                                    .toString()
                                    .toLowerCase();


                            const descricao =
                                (
                                    produto.descricao ||
                                    ""
                                )
                                    .toString()
                                    .toLowerCase();


                            return (

                                nome.includes(
                                    termo
                                )

                                ||

                                categoria.includes(
                                    termo
                                )

                                ||

                                subcategoria.includes(
                                    termo
                                )

                                ||

                                descricao.includes(
                                    termo
                                )
                            );
                        }
                    );


                produtosFiltrados =
                    resultados;


                paginaAtual =
                    1;


                const titulo =
                    document.getElementById(
                        "tituloCategoria"
                    );


                const quantidade =
                    document.getElementById(
                        "quantidadeProdutos"
                    );


                if (titulo) {

                    titulo.innerText =
                        "Resultados da busca";
                }


                if (quantidade) {

                    quantidade.innerText =
                        resultados.length +
                        (
                            resultados.length === 1
                                ? " produto encontrado"
                                : " produtos encontrados"
                        );
                }


                renderizarPagina();


            } catch (erro) {

                console.error(
                    "Erro na pesquisa:",
                    erro
                );
            }
        }
    );
}


// ============================================================
// ORDENAÇÃO
// ============================================================

const ordenacao =
    document.getElementById(
        "ordenacao"
    );


if (ordenacao) {

    ordenacao.addEventListener(
        "change",
        function () {

            const tipo =
                this.value;


            if (
                tipo ===
                "menor-preco"
            ) {

                produtosFiltrados.sort(
                    (a, b) =>
                        obterPrecoEfetivo(a) -
                        obterPrecoEfetivo(b)
                );


            } else if (
                tipo ===
                "maior-preco"
            ) {

                produtosFiltrados.sort(
                    (a, b) =>
                        obterPrecoEfetivo(b) -
                        obterPrecoEfetivo(a)
                );


            } else if (
                tipo ===
                "az"
            ) {

                produtosFiltrados.sort(
                    (a, b) =>

                        (
                            a.nome ||
                            ""
                        )
                            .localeCompare(
                                b.nome ||
                                "",
                                "pt-BR"
                            )
                );


            } else if (
                tipo ===
                "za"
            ) {

                produtosFiltrados.sort(
                    (a, b) =>

                        (
                            b.nome ||
                            ""
                        )
                            .localeCompare(
                                a.nome ||
                                "",
                                "pt-BR"
                            )
                );


            } else {

                // =============================================
                // RELEVÂNCIA
                // Recarrega a categoria/subcategoria atual
                // para recuperar a ordem natural do catálogo.
                // =============================================

                restaurarRelevancia();

                return;
            }


            paginaAtual =
                1;


            renderizarPagina();
        }
    );
}


// ============================================================
// RESTAURA A ORDENAÇÃO POR RELEVÂNCIA
// ============================================================

async function restaurarRelevancia() {

    const categoriaAtiva =
        document.querySelector(
            ".categoria-tab.ativa"
        );


    const categoria =
        categoriaAtiva
            ? categoriaAtiva.dataset.categoria
            : "Todos";


    const subcategoriaAtiva =
        document.querySelector(
            ".subcategoria-tab.ativa"
        );


    if (
        subcategoriaAtiva &&
        subcategoriaAtiva.dataset.subcategoria !==
        "Todos"
    ) {

        await filtrarSubcategoria(
            categoria,
            subcategoriaAtiva.dataset.subcategoria
        );

    } else {

        await carregarProdutos(
            categoria,
            "catalogo"
        );
    }
}


// ============================================================
// MOSTRA / ESCONDE OFERTAS DE HOJE
// ============================================================

function alternarOfertasHoje(mostrar) {

    const secao =
        document.getElementById(
            "secaoOfertasHoje"
        );

    if (!secao) {
        return;
    }

    secao.style.display =
        mostrar
            ? ""
            : "none";
}
// ============================================================
// PARTE 4 FINAL
// CARREGA AS CATEGORIAS
// ============================================================

async function carregarCategorias() {

    const container =
        document.getElementById(
            "categoriasScroll"
        );


    if (!container) {
        return;
    }


    try {

        const produtos =
            await obterProdutos();


        const categorias =
            [
                ...new Set(

                    produtos
                        .map(
                            produto =>
                                produto.categoria
                        )
                        .filter(
                            categoria =>
                                categoria &&
                                categoria
                                    .toString()
                                    .trim() !==
                                ""
                        )
                )
            ];


        categorias.sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );


        container.innerHTML =
            "";


        // =====================================================
        // TODOS
        // =====================================================

        const botaoTodos =
            document.createElement(
                "button"
            );


        botaoTodos.className =
            "categoria-tab ativa";


        botaoTodos.dataset.categoria =
            "Todos";


        botaoTodos.innerText =
            "Todos";


        botaoTodos.addEventListener(
            "click",
            async function () {

                ativarCategoria(
                    this
                );


                // =============================================
                // EM "TODOS", OFERTAS DE HOJE VOLTA A APARECER
                // =============================================

                alternarOfertasHoje(
                    true
                );


                esconderSubcategorias();


                limparPesquisa();


                resetarOrdenacao();


                await carregarProdutos(
                    "Todos",
                    "catalogo"
                );
            }
        );


        container.appendChild(
            botaoTodos
        );


        // =====================================================
        // DEMAIS CATEGORIAS
        // =====================================================

        categorias.forEach(
            categoria => {

                const botao =
                    document.createElement(
                        "button"
                    );


                botao.className =
                    "categoria-tab";


                botao.dataset.categoria =
                    categoria;


                botao.innerText =
                    categoria;


                botao.addEventListener(
                    "click",
                    async function () {

                        ativarCategoria(
                            this
                        );


                        // =====================================
                        // CATEGORIA ESPECÍFICA
                        // ESCONDE OFERTAS DE HOJE
                        // =====================================

                        alternarOfertasHoje(
                            false
                        );


                        limparPesquisa();


                        resetarOrdenacao();


                        await carregarSubcategorias(
                            categoria
                        );


                        await carregarProdutos(
                            categoria,
                            "catalogo"
                        );
                    }
                );


                container.appendChild(
                    botao
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar categorias:",
            erro
        );
    }
}


// ============================================================
// ATIVA CATEGORIA
// ============================================================

function ativarCategoria(botao) {

    document
        .querySelectorAll(
            ".categoria-tab"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "ativa"
                )
        );


    botao.classList.add(
        "ativa"
    );


    // =====================================================
    // FAZ O MENU ANDAR SOZINHO ATÉ O BOTÃO CLICADO
    // =====================================================

    botao.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    });
}


// ============================================================
// CARREGA SUBCATEGORIAS
// ============================================================

async function carregarSubcategorias(
    categoria
) {

    const container =
        document.getElementById(
            "subcategoriasScroll"
        );


    if (!container) {
        return;
    }


    try {

        const produtos =
            await obterProdutos();


        const produtosCategoria =
            produtos.filter(
                produto =>
                    produto.categoria ===
                    categoria
            );


        const subcategorias =
            [
                ...new Set(

                    produtosCategoria
                        .map(
                            produto =>
                                produto.subcategoria
                        )
                        .filter(
                            subcategoria =>
                                subcategoria &&
                                subcategoria
                                    .toString()
                                    .trim() !==
                                ""
                        )
                )
            ];


        subcategorias.sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );


        container.innerHTML =
            "";


        // =====================================================
        // SE NÃO EXISTEM SUBCATEGORIAS
        // =====================================================

        if (
            subcategorias.length ===
            0
        ) {

            esconderSubcategorias();

            return;
        }


        container.style.display =
            "flex";


        // =====================================================
        // BOTÃO TODOS DA CATEGORIA
        // =====================================================

        const botaoTodos =
            document.createElement(
                "button"
            );


        botaoTodos.className =
            "subcategoria-tab ativa";


        botaoTodos.dataset.subcategoria =
            "Todos";


        botaoTodos.innerText =
            "Todos";


        botaoTodos.addEventListener(
            "click",
            async function () {

                ativarSubcategoria(
                    this
                );


                // Continua dentro de uma categoria específica:
                // ofertas permanecem escondidas.

                alternarOfertasHoje(
                    false
                );


                limparPesquisa();


                resetarOrdenacao();


                await carregarProdutos(
                    categoria,
                    "catalogo"
                );
            }
        );


        container.appendChild(
            botaoTodos
        );


        // =====================================================
        // DEMAIS SUBCATEGORIAS
        // =====================================================

        subcategorias.forEach(
            subcategoria => {

                const botao =
                    document.createElement(
                        "button"
                    );


                botao.className =
                    "subcategoria-tab";


                botao.dataset.subcategoria =
                    subcategoria;


                botao.innerText =
                    subcategoria;


                botao.addEventListener(
                    "click",
                    async function () {

                        ativarSubcategoria(
                            this
                        );


                        // Subcategoria específica:
                        // ofertas continuam escondidas.

                        alternarOfertasHoje(
                            false
                        );


                        limparPesquisa();


                        resetarOrdenacao();


                        await filtrarSubcategoria(
                            categoria,
                            subcategoria
                        );
                    }
                );


                container.appendChild(
                    botao
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar subcategorias:",
            erro
        );
    }
}


// ============================================================
// ATIVA SUBCATEGORIA
// ============================================================

function ativarSubcategoria(
    botao
) {

    document
        .querySelectorAll(
            ".subcategoria-tab"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "ativa"
                )
        );


    botao.classList.add(
        "ativa"
    );
}


// ============================================================
// ESCONDE SUBCATEGORIAS
// ============================================================

function esconderSubcategorias() {

    const container =
        document.getElementById(
            "subcategoriasScroll"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    container.style.display =
        "none";
}


// ============================================================
// FILTRA POR SUBCATEGORIA
// ============================================================

async function filtrarSubcategoria(
    categoria,
    subcategoria
) {

    try {

        const produtos =
            await obterProdutos();


        const resultados =
            produtos.filter(
                produto =>

                    produto.categoria ===
                    categoria

                    &&

                    produto.subcategoria ===
                    subcategoria
            );


        produtosFiltrados =
            resultados;


        paginaAtual =
            1;


        const titulo =
            document.getElementById(
                "tituloCategoria"
            );


        const quantidade =
            document.getElementById(
                "quantidadeProdutos"
            );


        if (titulo) {

            titulo.innerText =
                subcategoria;
        }


        if (quantidade) {

            quantidade.innerText =
                resultados.length +
                (
                    resultados.length === 1
                        ? " produto encontrado"
                        : " produtos encontrados"
                );
        }


        renderizarPagina();


    } catch (erro) {

        console.error(
            "Erro ao filtrar subcategoria:",
            erro
        );
    }
}


// ============================================================
// LIMPA PESQUISA
// ============================================================

function limparPesquisa() {

    const campo =
        document.getElementById(
            "campoPesquisa"
        );


    if (campo) {

        campo.value =
            "";
    }
}


// ============================================================
// RESETA ORDENAÇÃO
// ============================================================

function resetarOrdenacao() {

    const select =
        document.getElementById(
            "ordenacao"
        );


    if (select) {

        select.value =
            "relevancia";
    }
}


// ============================================================
// CLIQUE NO BOTÃO DA LUPA
// ============================================================

const botaoPesquisa =
    document.querySelector(
        ".botao-pesquisa-lufinas"
    );


if (
    botaoPesquisa &&
    campoPesquisa
) {

    botaoPesquisa.addEventListener(
        "click",
        function () {

            campoPesquisa.focus();


            campoPesquisa.dispatchEvent(
                new Event(
                    "input"
                )
            );
        }
    );
}


// ============================================================
// VER TODAS AS OFERTAS
// ============================================================

const linkTodasOfertas =
    document.querySelector(
        ".ver-todas-ofertas"
    );


if (linkTodasOfertas) {

    linkTodasOfertas.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            try {

                const produtos =
                    await obterProdutos();


                const ofertas =
                    produtos.filter(
                        produto =>
                            produtoTemOferta(
                                produto
                            )
                    );


                produtosFiltrados =
                    ofertas;


                paginaAtual =
                    1;


                // Remove seleção visual das categorias

                document
                    .querySelectorAll(
                        ".categoria-tab"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "ativa"
                            )
                    );


                esconderSubcategorias();


                limparPesquisa();


                resetarOrdenacao();


                const titulo =
                    document.getElementById(
                        "tituloCategoria"
                    );


                const quantidade =
                    document.getElementById(
                        "quantidadeProdutos"
                    );


                if (titulo) {

                    titulo.innerText =
                        "Todas as ofertas";
                }


                if (quantidade) {

                    quantidade.innerText =
                        ofertas.length +
                        (
                            ofertas.length === 1
                                ? " oferta encontrada"
                                : " ofertas encontradas"
                        );
                }


                renderizarPagina();


                rolarParaCatalogo();


            } catch (erro) {

                console.error(
                    "Erro ao exibir todas as ofertas:",
                    erro
                );
            }
        }
    );
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            // Carrega os produtos uma única vez
            await obterProdutos();


            // Monta as categorias
            await carregarCategorias();


            // Monta as Ofertas de hoje
            await carregarOfertasHoje();


            // Carrega o catálogo completo
            await carregarProdutos(
                "Todos",
                "catalogo"
            );


        } catch (erro) {

            console.error(
                "Erro ao iniciar Mundo LuFiNas:",
                erro
            );
        }
    }
);


// ============================================================
// FIM - MUNDO LUFINAS 4.0
// ============================================================

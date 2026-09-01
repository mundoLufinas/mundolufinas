// =====================================================
// MUNDO LUFINAS 4.0 - PÁGINA DE PRODUTO
// PREÇOS COMPLETOS + GALERIA AUTOMÁTICA
// =====================================================

let cacheProdutos = null;


// =====================================================
// CARREGAR produtos.json UMA ÚNICA VEZ
// =====================================================

async function obterProdutos() {

    if (cacheProdutos !== null) {
        return cacheProdutos;
    }

    const resposta =
        await fetch(
            "produtos.json"
        );

    if (!resposta.ok) {

        throw new Error(
            "Não foi possível carregar o produtos.json"
        );
    }

    cacheProdutos =
        await resposta.json();

    return cacheProdutos;
}


// =====================================================
// CONVERTER PREÇO PARA NÚMERO
// =====================================================

function converterPreco(valor) {

    if (
        valor === "" ||
        valor === null ||
        valor === undefined
    ) {

        return 0;
    }


    if (
        typeof valor ===
        "number"
    ) {

        return valor;
    }


    let texto =
        valor
            .toString()
            .trim()
            .replace(
                "R$",
                ""
            )
            .replace(
                /\s/g,
                ""
            );


    // Ex.: 1.299,90

    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

    }


    const numero =
        Number(
            texto
        );


    return isNaN(numero)
        ? 0
        : numero;
}


// =====================================================
// FORMATAR PREÇO
// =====================================================

function formatarPreco(valor) {

    const numero =
        converterPreco(
            valor
        );


    if (!numero) {

        return "";
    }


    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );
}


// =====================================================
// MONTA O PREÇO COMPLETO DO PRODUTO
// =====================================================

function montarPrecoProduto(produto) {

    const preco =
        formatarPreco(
            produto.preco
        );


    const precoPromocional =
        formatarPreco(
            produto.precoPromocional
        );


    const precoOriginal =
        formatarPreco(
            produto.precoOriginal
        );


    const desconto =
        Number(
            produto.desconto || 0
        );


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


    // =================================================
    // PREÇO ESPECIAL NO PIX
    // =================================================

    if (ehPix) {

        return `

            <div class="produto-preco-completo">


                ${
                    precoOriginal
                        ? `

                            <div class="produto-preco-linha-original">

                                <span class="produto-preco-original">
                                    R$ ${precoOriginal}
                                </span>

                                ${
                                    desconto
                                        ? `

                                            <span class="produto-desconto">
                                                ${desconto}% OFF
                                            </span>

                                        `
                                        : ""
                                }

                            </div>

                        `
                        : ""
                }


                <div class="produto-preco-principal">

                    R$ ${precoPromocional}

                    <span class="produto-pix">
                        no PIX
                    </span>

                </div>


                ${
                    preco
                        ? `

                            <div class="produto-outras-formas">
                                R$ ${preco} em outras formas de pagamento
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

            <div class="produto-preco-completo">


                <div class="produto-preco-linha-original">

                    <span class="produto-preco-original">
                        R$ ${precoOriginal}
                    </span>

                    <span class="produto-desconto">
                        ${desconto}% OFF
                    </span>

                </div>


                <div class="produto-preco-principal">
                    R$ ${preco}
                </div>


            </div>

        `;
    }


    // =================================================
    // PREÇO NORMAL
    // =================================================

    return `

        <div class="produto-preco-completo">

            <div class="produto-preco-principal">
                R$ ${preco}
            </div>

        </div>

    `;
}


// =====================================================
// GALERIA
// VERIFICA SE UMA FOTO REALMENTE EXISTE
// =====================================================

function verificarImagemExiste(url) {

    return new Promise(
        resolve => {

            const imagem =
                new Image();


            imagem.onload =
                function () {

                    resolve(
                        true
                    );
                };


            imagem.onerror =
                function () {

                    resolve(
                        false
                    );
                };


            imagem.src =
                url;

        }
    );
}


// =====================================================
// GERA OS POSSÍVEIS NOMES DAS FOTOS
//
// foto.jpg
// foto-2.jpg
// foto-3.jpg
// foto-4.jpg
// =====================================================

function gerarPossiveisFotos(
    imagemPrincipal
) {

    const imagem =
        String(
            imagemPrincipal || ""
        ).trim();


    if (!imagem) {

        return [];
    }


    const ponto =
        imagem.lastIndexOf(
            "."
        );


    // Se por algum motivo não houver extensão,
    // usa somente a imagem principal.

    if (
        ponto === -1
    ) {

        return [
            imagem
        ];
    }


    const base =
        imagem.substring(
            0,
            ponto
        );


    const extensao =
        imagem.substring(
            ponto
        );


    return [

        imagem,

        base +
            "-2" +
            extensao,

        base +
            "-3" +
            extensao,

        base +
            "-4" +
            extensao

    ];
}


// =====================================================
// CARREGA SOMENTE AS FOTOS QUE REALMENTE EXISTEM
// =====================================================

async function obterFotosExistentes(
    imagemPrincipal
) {

    const candidatas =
        gerarPossiveisFotos(
            imagemPrincipal
        );


    if (
        candidatas.length === 0
    ) {

        return [];
    }


    const verificacoes =
        await Promise.all(

            candidatas.map(
                async url => {

                    const existe =
                        await verificarImagemExiste(
                            url
                        );


                    return existe
                        ? url
                        : null;

                }
            )
        );


    return verificacoes.filter(
        url =>
            url !== null
    );
}


// =====================================================
// MONTA A GALERIA DO PRODUTO
// =====================================================

async function montarGaleriaProduto(
    produto
) {

    const imagemPrincipal =
        document.getElementById(
            "produtoImagem"
        );


    const miniaturas =
        document.getElementById(
            "produtoMiniaturas"
        );


    if (
        !imagemPrincipal
    ) {

        return;
    }


    const fotoPrincipal =
        String(
            produto.imagem || ""
        ).trim();


    // =================================================
    // NÃO TEM FOTO
    // =================================================

    if (!fotoPrincipal) {

        imagemPrincipal.removeAttribute(
            "src"
        );


        if (miniaturas) {

            miniaturas.innerHTML =
                "";

            miniaturas.style.display =
                "none";
        }


        return;
    }


    // =================================================
    // MOSTRA IMEDIATAMENTE A FOTO PRINCIPAL
    // =================================================

    imagemPrincipal.src =
        fotoPrincipal;


    imagemPrincipal.alt =
        produto.alt ||
        produto.nome ||
        "Produto Mundo LuFiNas";


    // =================================================
    // PROCURA FOTO 2, 3 E 4
    // =================================================

    const fotos =
        await obterFotosExistentes(
            fotoPrincipal
        );


    // Segurança:
    // se por alguma razão a verificação da principal
    // falhar, ainda mantemos a imagem informada no JSON.

    if (
        fotos.length === 0
    ) {

        fotos.push(
            fotoPrincipal
        );
    }


    // =================================================
    // UMA FOTO SOMENTE
    //
    // NÃO MOSTRA MINIATURAS
    // =================================================

    if (
        fotos.length <= 1
    ) {

        if (miniaturas) {

            miniaturas.innerHTML =
                "";

            miniaturas.style.display =
                "none";
        }


        return;
    }


    // =================================================
    // DUAS OU MAIS FOTOS
    //
    // MOSTRA AS MINIATURAS
    // =================================================

    if (!miniaturas) {

        return;
    }


    miniaturas.innerHTML =
        "";


    miniaturas.style.display =
        "flex";


    fotos.forEach(
        (
            foto,
            indice
        ) => {

            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "produto-miniatura";


            if (
                indice === 0
            ) {

                botao.classList.add(
                    "ativa"
                );
            }


            botao.setAttribute(
                "aria-label",
                "Ver foto " +
                    (indice + 1) +
                    " do produto"
            );


            const imagem =
                document.createElement(
                    "img"
                );


            imagem.src =
                foto;


            imagem.alt =
                (
                    produto.alt ||
                    produto.nome ||
                    "Produto"
                ) +
                " - foto " +
                (indice + 1);


            botao.appendChild(
                imagem
            );


            botao.addEventListener(
                "click",
                function () {

                    // Troca a imagem grande.

                    imagemPrincipal.src =
                        foto;


                    imagemPrincipal.alt =
                        (
                            produto.alt ||
                            produto.nome ||
                            "Produto"
                        ) +
                        " - foto " +
                        (indice + 1);


                    // Retira seleção das outras.

                    miniaturas
                        .querySelectorAll(
                            ".produto-miniatura"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "ativa"
                                )
                        );


                    // Marca a clicada.

                    this.classList.add(
                        "ativa"
                    );

                }
            );


            miniaturas.appendChild(
                botao
            );

        }
    );
}


// =====================================================
// CARREGAMENTO DA PÁGINA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const idProduto =
            params.get(
                "id"
            );


        // ---------------------------------------------
        // SEM ID NA URL
        // ---------------------------------------------

        if (!idProduto) {

            mostrarErro(
                "Produto não identificado."
            );


            return;
        }


        try {

            const produtos =
                await obterProdutos();


            // -----------------------------------------
            // PRODUTO ATIVO
            // -----------------------------------------

            const produto =
                produtos.find(
                    item =>

                        String(
                            item.id
                        ) ===
                        String(
                            idProduto
                        )

                        &&

                        item.ativo !==
                        false
                );


            // -----------------------------------------
            // NÃO EXISTE / INATIVO
            // -----------------------------------------

            if (!produto) {

                mostrarErro(
                    "Este produto não está mais disponível."
                );


                return;
            }


            // =================================================
            // ELEMENTOS
            // =================================================

            const categoria =
                document.getElementById(
                    "produtoCategoria"
                );


            const titulo =
                document.getElementById(
                    "produtoTitulo"
                );


            const preco =
                document.getElementById(
                    "produtoPreco"
                );


            const descricao =
                document.getElementById(
                    "produtoDescricao"
                );


            const botaoLoja =
                document.getElementById(
                    "botaoLoja"
                );

            const textoBotaoLoja =
                document.getElementById(
                    "textoBotaoLoja"
                );

            const tituloAvisoCompra =
                document.getElementById(
                    "tituloAvisoCompra"
                );

            const textoAvisoCompra =
                document.getElementById(
                    "textoAvisoCompra"
                );


            // =================================================
            // GALERIA DE FOTOS
            // =================================================

            await montarGaleriaProduto(
                produto
            );


            // =================================================
            // CATEGORIA
            // =================================================

            if (categoria) {

                categoria.textContent =
                    produto.categoria ||
                    "";
            }


            // =================================================
            // TÍTULO
            // =================================================

            if (titulo) {

                titulo.textContent =
                    produto.nome ||
                    "";
            }


            // =================================================
            // PREÇO COMPLETO
            // =================================================

            if (preco) {

                preco.innerHTML =
                    montarPrecoProduto(
                        produto
                    );
            }


            // =================================================
            // DESCRIÇÃO
            // =================================================

            if (descricao) {

                descricao.textContent =
                    produto.descricao ||
                    "Descrição não disponível.";
            }


            // =================================================
            // BOTÃO MERCADO LIVRE
            // =================================================

            // =================================================
            // BOTÃO DA LOJA
            // AMAZON OU MERCADO LIVRE
            // =================================================

            if (botaoLoja) {

                botaoLoja.href =
                    produto.link ||
                    "#";

                botaoLoja.target =
                    "_blank";

                botaoLoja.rel =
                    "noopener noreferrer";

                    // =================================================
                    // MEDIR CLIQUE NO BOTÃO DA LOJA
                    // GOOGLE ANALYTICS + MICROSOFT CLARITY
                    // =================================================

                    botaoLoja.addEventListener(
                        "click",
                        function () {

                            const lojaClique =
                                String(
                                    produto.loja || ""
                                ).trim();

                            const nomeProdutoClique =
                                String(
                                    produto.nome || ""
                                ).trim();

                            const idProdutoClique =
                                String(
                                    produto.id || ""
                                ).trim();


                            // =========================================
                            // GOOGLE ANALYTICS
                            // =========================================

                            if (
                                typeof gtag ===
                                "function"
                            ) {

                                gtag(
                                    "event",
                                    "clique_oferta",
                                    {
                                        loja:
                                            lojaClique,

                                        produto_id:
                                            idProdutoClique,

                                        produto_nome:
                                            nomeProdutoClique
                                    }
                                );

                            }


                            // =========================================
                            // MICROSOFT CLARITY
                            // =========================================

                            if (
                                typeof clarity ===
                                "function"
                            ) {

                                clarity(
                                    "set",
                                    "loja",
                                    lojaClique
                                );

                                clarity(
                                    "set",
                                    "produto_id",
                                    idProdutoClique
                                );

                                clarity(
                                    "set",
                                    "produto_nome",
                                    nomeProdutoClique
                                );

                                clarity(
                                    "event",
                                    "clique_oferta"
                                );

                            }

                        }
                    );                    

                const loja =
                    String(
                        produto.loja || ""
                    )
                    .trim()
                    .toLowerCase();


                // =============================================
                // AMAZON
                // =============================================

                if (loja === "amazon") {

                    botaoLoja.classList.add(
                        "btn-amazon"
                    );

                    const avisoCompra =
                        document.getElementById(
                            "avisoCompra"
                        );

                    if (avisoCompra) {
                        avisoCompra.classList.add(
                            "aviso-amazon"
                        );
                    }

                    if (textoBotaoLoja) {
                        textoBotaoLoja.textContent =
                            "Ver oferta na Amazon";
                    }

                    if (tituloAvisoCompra) {
                        tituloAvisoCompra.textContent =
                            "Compra segura na Amazon";
                    }

                    if (textoAvisoCompra) {
                        textoAvisoCompra.textContent =
                            "Ao clicar no botão acima, você será direcionado à Amazon para finalizar sua compra.";
                    }

                }


                // =============================================
                // SHOPEE
                // =============================================

                else if (loja === "shopee") {

                    botaoLoja.classList.remove(
                        "btn-amazon"
                    );

                    const avisoCompra =
                        document.getElementById(
                            "avisoCompra"
                        );

                    if (avisoCompra) {
                        avisoCompra.classList.remove(
                            "aviso-amazon"
                        );
                    }

                    if (textoBotaoLoja) {
                        textoBotaoLoja.textContent =
                            "Ver oferta na Shopee";
                    }

                    if (tituloAvisoCompra) {
                        tituloAvisoCompra.textContent =
                            "Compra segura na Shopee";
                    }

                    if (textoAvisoCompra) {
                        textoAvisoCompra.textContent =
                            "Ao clicar no botão acima, você será direcionado à Shopee para finalizar sua compra.";
                    }

                }


                // =============================================
                // MERCADO LIVRE
                // =============================================

                else {

                    botaoLoja.classList.remove(
                        "btn-amazon"
                    );

                    const avisoCompra =
                        document.getElementById(
                            "avisoCompra"
                        );

                    if (avisoCompra) {
                        avisoCompra.classList.remove(
                            "aviso-amazon"
                        );
                    }

                    if (textoBotaoLoja) {
                        textoBotaoLoja.textContent =
                            "Ver oferta no Mercado Livre";
                    }

                    if (tituloAvisoCompra) {
                        tituloAvisoCompra.textContent =
                            "Compra segura no Mercado Livre";
                    }

                    if (textoAvisoCompra) {
                        textoAvisoCompra.textContent =
                            "Ao clicar no botão acima, você será direcionado ao Mercado Livre para finalizar sua compra.";
                    }

                }

            }


            // =================================================
            // PRODUTOS RELACIONADOS
            // =================================================

            carregarProdutosRelacionados(
                produto,
                produtos
            );


            ativarCompartilhamento(
                produto
            );


            // =================================================
            // TÍTULO DA ABA
            // =================================================

            document.title =
                `${produto.nome} | Mundo LuFiNas`;

                // ========================================
                // SEO DINÂMICO DO PRODUTO
                // DESCRIPTION + CANONICAL
                // ========================================

                // META DESCRIPTION
                let metaDescription =
                    document.querySelector('meta[name="description"]');

                if (metaDescription) {

                    const descricaoSEO =
                        String(produto.descricao || produto.nome || "")
                            .replace(/\s+/g, " ")
                            .trim()
                            .substring(0, 160);

                    metaDescription.setAttribute(
                        "content",
                        descricaoSEO
                    );
                }


                // URL CANÔNICA
                const slugSEO =
                    String(produto.nome || "")
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");

                const urlCanonica =
                    `https://mundolufinas.com.br/produto.html?id=${encodeURIComponent(produto.id)}&produto=${encodeURIComponent(slugSEO)}`;

                let canonical =
                    document.querySelector('link[rel="canonical"]');

                if (!canonical) {

                    canonical =
                        document.createElement("link");

                    canonical.rel = "canonical";

                    document.head.appendChild(canonical);
                }

                canonical.href = urlCanonica;                
                    // ========================================
                    // OPEN GRAPH DINÂMICO
                    // COMPARTILHAMENTO DO PRODUTO
                    // ========================================

                    function definirOpenGraph(propriedade, conteudo) {

                        let meta =
                            document.querySelector(
                                `meta[property="${propriedade}"]`
                            );

                        if (!meta) {

                            meta =
                                document.createElement("meta");

                            meta.setAttribute(
                                "property",
                                propriedade
                            );

                            document.head.appendChild(meta);
                        }

                        meta.setAttribute(
                            "content",
                            conteudo
                        );
                    }


                    const tituloOG =
                        `${produto.nome} | Mundo LuFiNas`;

                    const descricaoOG =
                        String(
                            produto.descricao ||
                            produto.nome ||
                            ""
                        )
                            .replace(/\s+/g, " ")
                            .trim()
                            .substring(0, 200);


                    // TÍTULO
                    definirOpenGraph(
                        "og:title",
                        tituloOG
                    );


                    // DESCRIÇÃO
                    definirOpenGraph(
                        "og:description",
                        descricaoOG
                    );


                    // URL
                    definirOpenGraph(
                        "og:url",
                        urlCanonica
                    );


                    // TIPO
                    definirOpenGraph(
                        "og:type",
                        "product"
                    );


                    // NOME DO SITE
                    definirOpenGraph(
                        "og:site_name",
                        "Mundo LuFiNas"
                    );


                    // IMAGEM PRINCIPAL
                    const imagemOG =
                        produto.imagem
                            ? new URL(
                                produto.imagem,
                                "https://mundolufinas.com.br/"
                            ).href
                            : "";

                    if (imagemOG) {

                        definirOpenGraph(
                            "og:image",
                            imagemOG
                        );

                    }
        } catch (erro) {

            console.error(
                "Erro ao carregar produto:",
                erro
            );


            mostrarErro(
                "Não foi possível carregar os dados do produto."
            );
        }

    }
);


// =====================================================
// MENSAGEM DE ERRO
// =====================================================

function mostrarErro(mensagem) {

    const container =
        document.querySelector(
            ".produto-detalhe-card"
        );


    if (!container) {

        return;
    }


    container.innerHTML = `

        <div class="text-center py-5">

            <h2>
                Ops! 😕
            </h2>

            <p class="mt-3">
                ${mensagem}
            </p>

            <a
                href="index.html"
                class="produto-voltar"
            >
                ← Voltar ao catálogo
            </a>

        </div>

    `;
}


// =====================================================
// VOCÊ TAMBÉM PODE GOSTAR
// =====================================================

function carregarProdutosRelacionados(
    produtoAtual,
    produtos
) {

    const container =
        document.getElementById(
            "produtosRelacionados"
        );


    if (!container) {

        return;
    }


    // =================================================
    // MESMA CATEGORIA
    // NÃO MOSTRA O PRÓPRIO
    // SOMENTE ATIVOS
    // =================================================

    const relacionados =
        produtos.filter(
            produto =>

                produto.categoria ===
                produtoAtual.categoria

                &&

                String(
                    produto.id
                ) !==
                String(
                    produtoAtual.id
                )

                &&

                produto.ativo !==
                false
        );


    // =================================================
    // EMBARALHAR
    // =================================================

    relacionados.sort(
        () =>
            Math.random() -
            0.5
    );


    // =================================================
    // MÁXIMO 4
    // =================================================

    const produtosExibir =
        relacionados.slice(
            0,
            4
        );


    if (
        produtosExibir.length ===
        0
    ) {

        container.innerHTML =
            "";


        return;
    }


    // =================================================
    // CARDS
    // =================================================

    container.innerHTML =
        produtosExibir
            .map(
                produto => {

                    const precoExibir =
                        produto.precoPromocional
                            ? produto.precoPromocional
                            : produto.preco;


                    return `

                        <div
                            class="col-6 col-md-4 col-lg-3"
                        >

                            <a
                                href="produto.html?id=${produto.id}"
                                class="card-relacionado"
                            >

                                <img
                                    src="${produto.imagem}"
                                    alt="${produto.alt || produto.nome}"
                                    class="card-relacionado-img"
                                >


                                <div
                                    class="card-relacionado-info"
                                >

                                    <div
                                        class="card-relacionado-categoria"
                                    >
                                        ${produto.categoria || ""}
                                    </div>


                                    <div
                                        class="card-relacionado-nome"
                                    >
                                        ${produto.nome}
                                    </div>


                                    ${
                                        produto.desconto
                                            ? `

                                                <div class="card-relacionado-desconto">
                                                    ${produto.desconto}% OFF
                                                </div>

                                            `
                                            : ""
                                    }


                                    <p
                                        class="card-relacionado-preco"
                                    >
                                        R$ ${precoExibir}
                                    </p>

                                </div>

                            </a>

                        </div>

                    `;
                }
            )
            .join("");
}


// =====================================================
// COMPARTILHAR PRODUTO DO MUNDO LUFINAS
// =====================================================

function ativarCompartilhamento(produto) {

    const botao =
        document.getElementById(
            "botaoCompartilhar"
        );


    const texto =
        document.getElementById(
            "textoCompartilhar"
        );


    if (!botao) {

        return;
    }


    botao.addEventListener(
        "click",
        async () => {

            const titulo =
                produto.nome
                    ? `${produto.nome} | Mundo LuFiNas`
                    : "Achadinho do Mundo LuFiNas";


            const mensagem =
                produto.nome
                    ? `Olha este achadinho que encontrei no Mundo LuFiNas 💕\n${produto.nome}`
                    : "Olha este achadinho que encontrei no Mundo LuFiNas 💕";


            // URL DA PÁGINA DO MUNDO LUFINAS
            // NÃO compartilha o link afiliado do Mercado Livre.

            const url =
                window.location.href;


            try {

                // =============================================
                // CELULAR / NAVEGADOR COM COMPARTILHAMENTO NATIVO
                // =============================================

                if (
                    navigator.share
                ) {

                    await navigator.share({

                        title:
                            titulo,

                        text:
                            mensagem,

                        url:
                            url

                    });


                    return;
                }


                // =============================================
                // PC / FALLBACK: COPIA O LINK
                // =============================================

                await navigator.clipboard.writeText(
                    url
                );


                if (texto) {

                    texto.textContent =
                        "Link copiado!";


                    setTimeout(
                        () => {

                            texto.textContent =
                                "Compartilhar";

                        },
                        2200
                    );

                }


            } catch (erro) {

                // Se o usuário simplesmente fechar
                // a janela de compartilhamento,
                // não precisamos mostrar erro.

                if (
                    erro.name !==
                    "AbortError"
                ) {

                    console.error(
                        "Erro ao compartilhar:",
                        erro
                    );

                }

            }

        }
    );
}
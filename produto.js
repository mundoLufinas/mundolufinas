// =====================================================
// MUNDO LUFINAS 4.0 - PÁGINA DE PRODUTO
// PREÇOS COMPLETOS + PRODUTOS ATIVOS / INATIVOS
// =====================================================

let cacheProdutos = null;


// =====================================================
// CARREGAR produtos.json UMA ÚNICA VEZ
// =====================================================

async function obterProdutos() {

    if (cacheProdutos !== null) {
        return cacheProdutos;
    }

    const resposta = await fetch("produtos.json");

    if (!resposta.ok) {
        throw new Error(
            "Não foi possível carregar o produtos.json"
        );
    }

    cacheProdutos = await resposta.json();

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

    if (typeof valor === "number") {
        return valor;
    }

    let texto =
        valor
            .toString()
            .trim()
            .replace("R$", "")
            .replace(/\s/g, "");


    // Ex.: 1.299,90
    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }


    const numero =
        Number(texto);

    return isNaN(numero)
        ? 0
        : numero;
}


// =====================================================
// FORMATAR PREÇO
// =====================================================

function formatarPreco(valor) {

    const numero =
        converterPreco(valor);

    if (!numero) {
        return "";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
            condicao.includes("PIX") ||
            condicao.includes("MERCADO PAGO")
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
            params.get("id");


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

                        String(item.id) ===
                        String(idProduto)

                        &&

                        item.ativo !== false
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

            const imagem =
                document.getElementById(
                    "produtoImagem"
                );

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

            const botaoML =
                document.getElementById(
                    "botaoML"
                );


            // =================================================
            // IMAGEM
            // =================================================

            if (imagem) {

                imagem.src =
                    produto.imagem;

                imagem.alt =
                    produto.alt ||
                    produto.nome;
            }


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

            if (botaoML) {

                botaoML.href =
                    produto.link ||
                    "#";

                botaoML.target =
                    "_blank";

                botaoML.rel =
                    "noopener noreferrer";
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

                String(produto.id) !==
                String(produtoAtual.id)

                &&

                produto.ativo !== false
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
            // NÃO compartilha o link afiliado do Mercado Livre

            const url =
                window.location.href;


            try {

                // =============================================
                // CELULAR / NAVEGADOR COM COMPARTILHAMENTO NATIVO
                // =============================================

                if (navigator.share) {

                    await navigator.share({
                        title: titulo,
                        text: mensagem,
                        url: url
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

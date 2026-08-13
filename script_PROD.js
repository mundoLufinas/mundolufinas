let produtosFiltrados = [];
let paginaAtual = 1;
const produtosPorPagina = 20;

// =============================
// CARREGAR PRODUTOS
// =============================
async function carregarProdutos(categoria, destino) {

    try {

        const resposta = await fetch("produtos.json");
        const produtos = await resposta.json();

        produtos.reverse();

        const produtosCategoria = categoria === "Todos"
            ? produtos
            : produtos.filter(produto => produto.categoria === categoria);

        if (destino === "catalogo") {

            const titulo = document.getElementById("tituloCategoria");
            const quantidade = document.getElementById("quantidadeProdutos");

            if (titulo) {
                titulo.innerText = categoria;
            }

            if (quantidade) {
                quantidade.innerText =
                    produtosCategoria.length + " produtos encontrados";
            }
        }

        const catalogo = document.getElementById(destino);

        if (!catalogo) return;

        produtosFiltrados = produtosCategoria;
        paginaAtual = 1;

        renderizarPagina();

    } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

    }
}


// =============================
// RENDERIZAR PÁGINA
// =============================
function renderizarPagina() {

    const catalogo = document.getElementById("catalogo");

    if (!catalogo) return;

    catalogo.innerHTML = "";

    const inicio = (paginaAtual - 1) * produtosPorPagina;
    const fim = inicio + produtosPorPagina;

    const produtosPagina = produtosFiltrados.slice(inicio, fim);

    produtosPagina.forEach(produto => {






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
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            "
            onmouseover="
                this.style.transform='translateY(-3px)';
                this.style.boxShadow='0 5px 15px rgba(0,0,0,0.10)';
            "
            onmouseout="
                this.style.transform='translateY(0)';
                this.style.boxShadow='none';
            "
        >

            <div class="fruite-img">

                <img
                    src="${produto.imagem}"
                    class="img-fluid w-100 rounded-top"
                    alt="${produto.nome}"
                    style="
                        display: block;
                        transition: opacity 0.2s ease;
                    "
                    onmouseover="this.style.opacity='0.92'"
                    onmouseout="this.style.opacity='1'"
                >

            </div>


            <div class="p-4 border border-secondary border-top-0 rounded-bottom">


                <h5
                    class="mb-1"
                    style="
                        font-size: 18px;
                        line-height: 1.2;
                        min-height: 43px;
                    "
                >
                    ${produto.nome}
                </h5>


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


                <p
                    class="text-dark fs-5 fw-bold mb-0 text-nowrap"
                >
                    R$ ${produto.preco}
                </p>

                <div
                    class="mt-2 text-left"
                >
                    <span
                        class="btn border border-secondary rounded-2 px-3 text-rosa-escuro text-nowrap"
                        style="
                            font-size: 12px;
                            background-color: #fff8fc;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.10);
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





});

    criarPaginacao();
}


// =============================
// PAGINAÇÃO
// =============================
function criarPaginacao() {

    const paginacao = document.querySelector(".pagination");

    if (!paginacao) return;

    const totalPaginas = Math.ceil(
        produtosFiltrados.length / produtosPorPagina
    );

    paginacao.innerHTML = "";

    if (totalPaginas <= 1) return;

    const ehCelular = window.innerWidth < 768;

    // =============================
    // BOTÃO ANTERIOR
    // =============================

    if (paginaAtual > 1) {

        paginacao.innerHTML += `
            <a
                href="#"
                class="rounded"
                onclick="irParaPagina(${paginaAtual - 1}); return false;"
            >
                &laquo;
            </a>
        `;

    }


    // =============================
    // NÚMEROS DAS PÁGINAS
    // =============================

    let inicio = 1;
    let fim = totalPaginas;

    if (ehCelular) {

        inicio = Math.max(1, paginaAtual - 1);
        fim = Math.min(totalPaginas, paginaAtual + 1);

        if (paginaAtual === 1) {
            fim = Math.min(3, totalPaginas);
        }

        if (paginaAtual === totalPaginas) {
            inicio = Math.max(1, totalPaginas - 2);
        }

    }


    for (let i = inicio; i <= fim; i++) {

        paginacao.innerHTML += `

            <a
                href="#"
                class="rounded ${i === paginaAtual ? "active" : ""}"
                onclick="irParaPagina(${i}); return false;"
            >
                ${i}
            </a>

        `;

    }


    // =============================
    // BOTÃO PRÓXIMA
    // =============================

    if (paginaAtual < totalPaginas) {

        paginacao.innerHTML += `

            <a
                href="#"
                class="rounded"
                onclick="irParaPagina(${paginaAtual + 1}); return false;"
            >
                &raquo;
            </a>

        `;

    }

}


// =============================
// IR PARA PÁGINA
// =============================
function irParaPagina(numero) {

    paginaAtual = numero;

    renderizarPagina();

    const catalogo = document.getElementById("catalogo");

    if (catalogo) {

        window.scrollTo({

            top: catalogo.offsetTop - 120,
            behavior: "smooth"

        });

    }

}


// =============================
// ORDENAR PRODUTOS
// =============================
function ordenarProdutos(tipo) {

    function converterPreco(preco) {

        if (typeof preco === "number") {
            return preco;
        }

        if (typeof preco === "string") {

            return parseFloat(

                preco
                    .replace("R$", "")
                    .replace(/\s/g, "")
                    .replace(/\./g, "")
                    .replace(",", ".")

            );

        }

        return 0;

    }


    // =============================
    // MENOR PREÇO
    // =============================

    if (tipo === "menor-preco") {

        produtosFiltrados.sort((a, b) =>
            converterPreco(a.preco) -
            converterPreco(b.preco)
        );

    }


    // =============================
    // MAIOR PREÇO
    // =============================

    if (tipo === "maior-preco") {

        produtosFiltrados.sort((a, b) =>
            converterPreco(b.preco) -
            converterPreco(a.preco)
        );

    }


    // =============================
    // A-Z
    // =============================

    if (tipo === "az") {

        produtosFiltrados.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
        );

    }


    // =============================
    // Z-A
    // =============================

    if (tipo === "za") {

        produtosFiltrados.sort((a, b) =>
            b.nome.localeCompare(a.nome, "pt-BR")
        );

    }


    paginaAtual = 1;

    renderizarPagina();

}


// =============================
// PESQUISA
// =============================
async function pesquisarProdutos(texto) {

    try {

        const resposta = await fetch("produtos.json");
        const produtos = await resposta.json();

        texto = texto.toLowerCase();

        produtosFiltrados = produtos.filter(produto =>

            produto.nome.toLowerCase().includes(texto) ||

            produto.descricao.toLowerCase().includes(texto) ||

            produto.categoria.toLowerCase().includes(texto)

        );


        const titulo = document.getElementById("tituloCategoria");
        const quantidade = document.getElementById("quantidadeProdutos");


        if (titulo) {

            titulo.innerText =
                texto === "" ? "Todos" : "Pesquisa";

        }


        if (quantidade) {

            quantidade.innerText =
                produtosFiltrados.length +
                " produtos encontrados";

        }


        paginaAtual = 1;

        renderizarPagina();

    } catch (erro) {

        console.error("Erro na pesquisa:", erro);

    }

}


// =============================
// EVENTO DA PESQUISA
// =============================
const campoPesquisa =
    document.getElementById("campoPesquisa");


if (campoPesquisa) {

    campoPesquisa.addEventListener("input", function () {

        const texto = this.value.trim();

        if (texto === "") {

            const params =
                new URLSearchParams(window.location.search);

            const categoria =
                params.get("cat") || "Todos";

            carregarProdutos(
                categoria,
                "catalogo"
            );

        } else {

            pesquisarProdutos(texto);

        }

    });

}


// =============================
// CARREGAMENTO INICIAL
// =============================
const params =
    new URLSearchParams(window.location.search);

const categoriaInicial =
    params.get("cat") || "Todos";


if (document.getElementById("catalogo")) {

    carregarProdutos(
        categoriaInicial,
        "catalogo"
    );

}


// =============================
// ORDENAÇÃO
// =============================
const selectOrdenacao =
    document.getElementById("ordenacao");


if (selectOrdenacao) {

    selectOrdenacao.addEventListener(
        "change",
        function () {

            ordenarProdutos(this.value);

        }
    );

}


// ==================================================
// CARREGAR CATEGORIAS HORIZONTAIS
// ==================================================
async function carregarCategorias() {

    const container =
        document.getElementById("categoriasScroll");

    if (!container) return;


    try {

        const resposta =
            await fetch("produtos.json");

        const produtos =
            await resposta.json();


        // =============================
        // PEGAR CATEGORIAS ÚNICAS
        // =============================

        const categorias =
            [...new Set(

                produtos
                    .map(produto => produto.categoria)
                    .filter(categoria => categoria)

            )].sort((a, b) =>
                a.localeCompare(b, "pt-BR")
            );


        // =============================
        // ADICIONAR "TODOS"
        // =============================

        categorias.unshift("Todos");


        criarCategorias(categorias);


        // =============================
        // CATEGORIA ATUAL
        // =============================

        const params =
            new URLSearchParams(
                window.location.search
            );

        const categoriaAtual =
            params.get("cat") || "Todos";


        selecionarCategoria(
            categoriaAtual,
            false
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar categorias:",
            erro
        );

    }

}


// ==================================================
// CRIAR CATEGORIAS
// ==================================================
function criarCategorias(categorias) {

    const container =
        document.getElementById("categoriasScroll");

    if (!container) return;


    container.innerHTML = "";


    categorias.forEach(categoria => {

        const botao =
            document.createElement("a");


        botao.href = "#";


        botao.className =
            "categoria-tab";


        botao.dataset.categoria =
            categoria;


        botao.innerText =
            categoria;


        botao.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                selecionarCategoria(
                    categoria,
                    true
                );

            }
        );


        container.appendChild(botao);

    });

}


// ==================================================
// SELECIONAR CATEGORIA
// ==================================================
function selecionarCategoria(
    categoria,
    atualizarProdutos = true
) {

    // =============================
    // MARCAR CATEGORIA ATIVA
    // =============================

    document
        .querySelectorAll(".categoria-tab")
        .forEach(tab => {

            tab.classList.remove("ativa");

        });


    const ativa =
        document.querySelector(
            `.categoria-tab[data-categoria="${CSS.escape(categoria)}"]`
        );


    if (ativa) {

        ativa.classList.add("ativa");


        ativa.scrollIntoView({

            behavior: "smooth",
            inline: "center",
            block: "nearest"

        });

    }


    // =============================
    // ATUALIZAR URL
    // =============================

    const url =
        new URL(window.location);


    if (categoria === "Todos") {

        url.searchParams.delete("cat");

    } else {

        url.searchParams.set(
            "cat",
            categoria
        );

    }


    history.replaceState(
        {},
        "",
        url
    );


    // =============================
    // CARREGAR PRODUTOS
    // =============================

    if (atualizarProdutos) {

        carregarProdutos(
            categoria,
            "catalogo"
        );

    }

}


// =============================
// INICIAR CATEGORIAS
// =============================
carregarCategorias();
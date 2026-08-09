let produtosFiltrados = [];
let paginaAtual = 1;
const produtosPorPagina = 8;

// =============================
// CARREGAR PRODUTOS
// =============================
async function carregarProdutos(categoria, destino){

    const resposta = await fetch("produtos.json");
    const produtos = await resposta.json();

    const produtosCategoria = categoria === "Todos"
        ? produtos
        : produtos.filter(produto => produto.categoria === categoria);

    if (destino === "catalogo") {
        document.getElementById("tituloCategoria").innerText = categoria;
        document.getElementById("quantidadeProdutos").innerText =
            produtosCategoria.length + " produtos encontrados";
    }

    const catalogo = document.getElementById(destino);
    if (!catalogo) return;

    produtosFiltrados = produtosCategoria;
    paginaAtual = 1;

    renderizarPagina();
}

// =============================
// RENDERIZAR PÁGINA
// =============================
function renderizarPagina(){

    const catalogo = document.getElementById("catalogo");
    if (!catalogo) return;

    catalogo.innerHTML = "";

    const inicio = (paginaAtual - 1) * produtosPorPagina;
    const fim = inicio + produtosPorPagina;

    const produtosPagina = produtosFiltrados.slice(inicio, fim);

    produtosPagina.forEach(produto => {

        catalogo.innerHTML += `

            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="rounded position-relative fruite-item">

                    <div class="fruite-img">
                        <img src="${produto.imagem}"
                             class="img-fluid w-100 rounded-top">
                    </div>

                    <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
                         style="top:10px;left:10px;">
                        ${produto.categoria}
                    </div>

                    <div class="p-4 border border-secondary border-top-0 rounded-bottom">

                        <h4>${produto.nome}</h4>
                        <p>${produto.descricao}</p>

                        <div class="d-flex justify-content-between flex-lg-wrap">

                            <p class="text-dark fs-5 fw-bold mb-0">
                                R$ ${produto.preco}
                            </p>

                            <a href="${produto.link}"
                               target="_blank"
                               class="btn border border-secondary rounded-pill px-3 text-rosa-escuro">
                                Ver ${produto.loja}
                            </a>

                        </div>

                    </div>

                </div>

            </div>

        `;

    });

    criarPaginacao();
}

// =============================
// PAGINAÇÃO
// =============================
function criarPaginacao(){

    const paginacao = document.querySelector(".pagination");
    if (!paginacao) return;

    const totalPaginas = Math.ceil(
        produtosFiltrados.length / produtosPorPagina
    );

    paginacao.innerHTML = "";

    if(totalPaginas <= 1) return;

    // Botão anterior
    if(paginaAtual > 1){

        paginacao.innerHTML += `
            <a href="#"
               class="rounded"
               onclick="irParaPagina(${paginaAtual - 1}); return false;">
                &laquo;
            </a>
        `;

    }

    // Números das páginas
    for(let i = 1; i <= totalPaginas; i++){

        paginacao.innerHTML += `
            <a href="#"
               class="rounded ${i === paginaAtual ? "active" : ""}"
               onclick="irParaPagina(${i}); return false;">
                ${i}
            </a>
        `;

    }

    // Botão próxima
    if(paginaAtual < totalPaginas){

        paginacao.innerHTML += `
            <a href="#"
               class="rounded"
               onclick="irParaPagina(${paginaAtual + 1}); return false;">
                &raquo;
            </a>
        `;

    }

}

// =============================
// IR PARA PÁGINA
// =============================
function irParaPagina(numero){

    paginaAtual = numero;

    renderizarPagina();

    window.scrollTo({
        top: document.getElementById("catalogo").offsetTop - 120,
        behavior: "smooth"
    });

}


function ordenarProdutos(tipo){

    // Converte o preço para número corretamente
    function converterPreco(preco){

        if(typeof preco === "number"){
            return preco;
        }

        if(typeof preco === "string"){

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


    if(tipo === "menor-preco"){

        produtosFiltrados.sort((a, b) =>
            converterPreco(a.preco) - converterPreco(b.preco)
        );

    }


    if(tipo === "maior-preco"){

        produtosFiltrados.sort((a, b) =>
            converterPreco(b.preco) - converterPreco(a.preco)
        );

    }


    if(tipo === "az"){

        produtosFiltrados.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
        );

    }


    if(tipo === "za"){

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
async function pesquisarProdutos(texto){

    const resposta = await fetch("produtos.json");
    const produtos = await resposta.json();

    texto = texto.toLowerCase();

    produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(texto) ||
        produto.descricao.toLowerCase().includes(texto) ||
        produto.categoria.toLowerCase().includes(texto)
    );

    document.getElementById("tituloCategoria").innerText =
        texto === "" ? "Todos" : "Pesquisa";

    document.getElementById("quantidadeProdutos").innerText =
        produtosFiltrados.length + " produtos encontrados";

    paginaAtual = 1;

    renderizarPagina();

}

// =============================
// EVENTO DA PESQUISA
// =============================
const campoPesquisa = document.getElementById("campoPesquisa");

if(campoPesquisa){

    campoPesquisa.addEventListener("input", function(){

        const texto = this.value.trim();

        if(texto === ""){

            const params = new URLSearchParams(window.location.search);
            const categoria = params.get("cat") || "Todos";

            carregarProdutos(categoria, "catalogo");

        }else{

            pesquisarProdutos(texto);

        }

    });

}

// =============================
// CARREGAMENTO INICIAL
// =============================
const params = new URLSearchParams(window.location.search);
const categoria = params.get("cat") || "Todos";

if(document.getElementById("catalogo")){
    carregarProdutos(categoria, "catalogo");
}



const selectOrdenacao = document.getElementById("ordenacao");

if(selectOrdenacao){

    selectOrdenacao.addEventListener("change", function(){

        ordenarProdutos(this.value);

    });

}


// =============================
// CARREGAR MENU DE CATEGORIAS
// =============================
async function carregarMenuCategorias(){

    const menu = document.getElementById("menuCategorias");
    const botao = document.getElementById("botaoCategorias");

    if (!menu || !botao) return;

    const resposta = await fetch("produtos.json");
    const produtos = await resposta.json();

    // Conta produtos por categoria
    const contagem = {};

    produtos.forEach(produto => {
        contagem[produto.categoria] = (contagem[produto.categoria] || 0) + 1;
    });

    const categorias = Object.keys(contagem).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
    );

    // Categoria atual da URL
    const params = new URLSearchParams(window.location.search);
    const categoriaAtual = params.get("cat") || "Todos";

    // Define texto do botão
    if(categoriaAtual === "Todos"){

        botao.innerText = `Todos os produtos (${produtos.length})`;

    }else{

        const quantidade = contagem[categoriaAtual] || 0;

        botao.innerText = `${categoriaAtual} (${quantidade})`;

    }

    // Monta o menu
    menu.innerHTML = "";

    menu.innerHTML += `
        <li>
            <a class="dropdown-item" href="index.html?cat=Todos">
                Todos os produtos (${produtos.length})
            </a>
        </li>
    `;

    categorias.forEach(categoria => {

        menu.innerHTML += `
            <li>
                <a class="dropdown-item"
                   href="index.html?cat=${encodeURIComponent(categoria)}">
                    ${categoria} (${contagem[categoria]})
                </a>
            </li>
        `;

    });

}

// Executa ao abrir a página
carregarMenuCategorias();


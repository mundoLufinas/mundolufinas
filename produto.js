// =====================================================
// MUNDO LUFINAS - PÁGINA DE PRODUTO
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // Pega o ID que veio na URL
    const params = new URLSearchParams(window.location.search);
    const idProduto = params.get("id");

    // Se não tiver ID
    if (!idProduto) {
        mostrarErro("Produto não identificado.");
        return;
    }

    try {

        // Carrega o arquivo de produtos
        const resposta = await fetch("produtos.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o produtos.json");
        }

        const produtos = await resposta.json();

        // Procura o produto pelo ID
        const produto = produtos.find(
            item => String(item.id) === String(idProduto)
        );

        // Se não encontrou
        if (!produto) {
            mostrarErro("Produto não encontrado.");
            return;
        }

        // =================================================
        // PREENCHENDO A PÁGINA
        // =================================================

        const imagem = document.getElementById("produtoImagem");
        const categoria = document.getElementById("produtoCategoria");
        const titulo = document.getElementById("produtoTitulo");
        const preco = document.getElementById("produtoPreco");
        const descricao = document.getElementById("produtoDescricao");
        const botaoML = document.getElementById("botaoML");


        // IMAGEM
        if (imagem) {
            imagem.src = produto.imagem;
            imagem.alt = produto.nome;
        }


        // CATEGORIA
        if (categoria) {
            categoria.textContent = produto.categoria || "";
        }


        // TÍTULO
        if (titulo) {
            titulo.textContent = produto.nome || "";
        }


        // PREÇO
        if (preco) {

            let valor = produto.preco;

            // Converte "99,90" para número
            if (typeof valor === "string") {

                valor = valor
                    .replace("R$", "")
                    .replace(/\s/g, "")
                    .replace(/\./g, "")
                    .replace(",", ".");

            }

            valor = Number(valor);

            if (!isNaN(valor)) {

                preco.textContent = valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });

            } else {

                preco.textContent = produto.preco || "";

            }
        }


        // DESCRIÇÃO
        if (descricao) {
            descricao.textContent =
                produto.descricao || "Descrição não disponível.";
        }


        // BOTÃO MERCADO LIVRE
        if (botaoML) {

            botaoML.href = produto.link || "#";

            botaoML.target = "_blank";
            botaoML.rel = "noopener noreferrer";
            
        }




// PRODUTOS RELACIONADOS
carregarProdutosRelacionados(produto);        




        // TÍTULO DA ABA
        document.title =
            `${produto.nome} | Mundo Lufinas`;


    } catch (erro) {

        console.error("Erro ao carregar produto:", erro);

        mostrarErro("Não foi possível carregar os dados do produto.");

    }


    // =====================================================
    // FUNÇÃO DE ERRO
    // =====================================================

    function mostrarErro(mensagem) {

        document.querySelector(".produto-container").innerHTML = `

            <a href="index.html" class="btn-voltar">
                ← Voltar ao catálogo
            </a>

            <div class="text-center py-5">

                <h2>Ops! 😕</h2>

                <p class="mt-3">
                    ${mensagem}
                </p>

            </div>

        `;

    }

});

// =====================================================
// VOCÊ TAMBÉM PODE GOSTAR
// =====================================================

async function carregarProdutosRelacionados(produtoAtual) {

    const container =
        document.getElementById("produtosRelacionados");

    if (!container) return;


    try {

        const resposta = await fetch("produtos.json");

        const produtos = await resposta.json();


        // Procura produtos da mesma categoria
        const relacionados = produtos.filter(produto =>

            produto.categoria === produtoAtual.categoria &&

            produto.id !== produtoAtual.id &&

            produto.ativo !== false

        );


        // Embaralha os produtos
        relacionados.sort(() => Math.random() - 0.5);


        // Mostra no máximo 4
        const produtosExibir =
            relacionados.slice(0, 4);


        // Se não houver relacionados
        if (produtosExibir.length === 0) {

            container.innerHTML = "";

            return;
        }


        container.innerHTML = produtosExibir.map(produto => `

            <div class="col-6 col-md-4 col-lg-3">

                <a
                    href="produto.html?id=${produto.id}"
                    class="card-relacionado"
                >

                    <img
                        src="${produto.imagem}"
                        alt="${produto.nome}"
                        class="card-relacionado-img"
                    >


                    <div class="card-relacionado-info">


                        <div class="card-relacionado-categoria">

                            ${produto.categoria}

                        </div>


                        <div class="card-relacionado-nome">

                            ${produto.nome}

                        </div>


                        <p class="card-relacionado-preco">

                            R$ ${produto.preco}

                        </p>


                    </div>

                </a>

            </div>

        `).join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar produtos relacionados:",
            erro
        );

    }

}
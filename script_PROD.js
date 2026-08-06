async function carregarProdutos(categoria, destino){

    const resposta = await fetch("produtos.json");
    const produtos = await resposta.json();

    const produtosCategoria = produtos.filter(produto => produto.categoria === categoria);

if (destino === "catalogo") {

    document.getElementById("tituloCategoria").innerText = categoria;

    document.getElementById("quantidadeProdutos").innerText =
        produtosCategoria.length + " produtos encontrados";

}    

    const catalogo = document.getElementById(destino);

    catalogo.innerHTML = "";

    produtos
        produtosCategoria
        .slice(0, destino === "catalogo" ? 9999 : 4)
        .forEach(produto=>{

            catalogo.innerHTML += `

                        <div class="tm-recommended-place-wrap">
                            <div class="tm-recommended-place">
                                <a href="${produto.link}" target="_blank"> <img src="${produto.imagem}" alt="Image" class="img-fluid tm-recommended-img"> </a> 
                                <div class="tm-recommended-description-box">
                                    <h3 class="tm-recommended-title">${produto.nome}</h3>
                                    <p class="tm-text-highlight">${produto.loja}</p>
                                    <p class="tm-text-gray">${produto.descricao}</p>   
                                </div>
                                <a href="${produto.link}" target="_blank" class="tm-recommended-price-box">
                                    <p class="tm-recommended-price">$ ${produto.preco}</p>
                                    <p class="tm-recommended-price-link">Veja...</p>
                                </a>                        
                            </div>
                        </div> 


            </div>

            `;

        });

}

if(document.getElementById("catalogo-beleza")){
    carregarProdutos("Beleza","catalogo-beleza");
    carregarProdutos("Casa e Organização","catalogo-casa");
    carregarProdutos("Cozinha","catalogo-cozinha");
    carregarProdutos("Fitness e Saúde","catalogo-fitness");
    carregarProdutos("Moda e Acessórios","catalogo-moda");
    carregarProdutos("Pets","catalogo-pets");
    carregarProdutos("Tecnologia","catalogo-tecnologia");
    carregarProdutos("Utilidades","catalogo-utilidades");
    carregarProdutos("Eletroeletronicos e Eletrodomésticos","catalogo-eletro");
}


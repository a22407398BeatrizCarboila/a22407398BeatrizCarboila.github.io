const API_URL = "https://deisishop.pythonanywhere.com/api";
if (!localStorage.getItem("produtos-selecionados")) {
      localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", () => {
      buscarEcarregarProdutos();
      carregarFiltroCategorias();
      atualizaCesto();
});

@param {string|null} filtroCategoria
async function buscarEcarregarProdutos(filtroCategoria = null) {
    const secaoProdutos = document.getElementById("produtos");
      secaoProdutos.innerHTML = "<p>A carregar produtos...</p>";
     
      let url = `${API_URL}/products`;
     if (filtroCategoria) {
        url = `${url}?category=${filtroCategoria}`;
    }

    try {
           const response = await fetch(url);
        if (!response.ok) {
           throw new Error(`Erro HTTP: ${response.status}`);
        }
     const produtosDaAPI = await response.json();

            secaoProdutos.innerHTML = "";
        if (produtosDaAPI.length === 0) {
            secaoProdutos.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
        } else {
            carregarProdutos(produtosDaAPI);
        }

    } catch (error) {
           console.error("Erro ao obter produtos:", error);
           secaoProdutos.innerHTML = `<p>Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>`;
    }
}


async function carregarFiltroCategorias() {
    const select = document.getElementById("filtro-categorias");
    
    if (!select) {
        console.error("Elemento <select id='filtro-categorias'> não encontrado.");
        return;
    }

    const optTodas = document.createElement("option");
    optTodas.value = "";
    optTodas.textContent = "Todas as Categorias";
    select.appendChild(optTodas);

    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) {
            throw new Error("Erro ao carregar categorias.");
        }
        const categorias = await response.json();

        
        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.name; 
            option.textContent = categoria.name;
            select.appendChild(option);
        });

        select.addEventListener("change", (e) => {
            const categoriaSelecionada = e.target.value;
            buscarEcarregarProdutos(categoriaSelecionada);
        });
        
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}


function carregarProdutos(lista) {
    const secaoProdutos = document.getElementById("produtos"); 

    lista.forEach(produto => {
        const artigo = criarProduto(produto);
        secaoProdutos.appendChild(artigo); 
    });
}

function criarProduto(produto) {
    const artigo = document.createElement("article");
    artigo.classList.add("produto-card");

    
    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

    
    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

   
    const preco = document.createElement("p");
    preco.textContent = `€${produto.price.toFixed(2)}`;

    
    const botao = document.createElement("button");
    botao.textContent = "Adicionar ao Cesto";
    botao.addEventListener("click", () => {
        adicionarAoCesto(produto);
    });

    artigo.append(imagem, titulo, preco, botao);
    return artigo;
}


function criaProdutoCesto(produto) {
    const artigo = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

    const preco = document.createElement("p");
    preco.textContent = `€${produto.price.toFixed(2)}`;

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.addEventListener("click", () => {
        removerDoCesto(produto.id);
    });
    
   
    artigo.append(imagem, titulo, preco, botaoRemover); 
    return artigo; 
} 


function adicionarAoCesto(produto){
    const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
    selecionados.push(produto); 
    localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
    atualizaCesto();
}


function removerDoCesto(idProduto) {
    let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
    const index = selecionados.findIndex(p => p.id === idProduto);
    if (index > -1) {
        selecionados.splice(index, 1);
    }
    
    localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
    atualizaCesto();
}

function atualizaCesto() {
    const secaoCesto = document.getElementById("produtos-selecionados");
    const totalElemento = document.getElementById("total");
    
    secaoCesto.innerHTML = ""; 
    const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));

    let total = 0;

    if (selecionados.length === 0) {
        secaoCesto.innerHTML = "<p>O seu cesto está vazio.</p>";
    }

    selecionados.forEach(produto => {
        const artigo = criaProdutoCesto(produto);
        secaoCesto.appendChild(artigo);
        
        total += parseFloat(produto.price) || 0; 
    });

    totalElemento.textContent = `Total: €${total.toFixed(2)}`;
}
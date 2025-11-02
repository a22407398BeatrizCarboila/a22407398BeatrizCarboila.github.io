if (!localStorage.getItem("produtos-selecionados")) {
     localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}


document.addEventListener("DOMContentLoaded", () => {
     carregarProdutos(produtos);
     atualizaCesto();

document.getElementById("esvaziar-cesto").addEventListener("click", () => {
     localStorage.setItem("produtos-selecionados", JSON.stringify([]));
     atualizaCesto();
    });

    const botaoCesto = document.getElementById("botao-cesto");
    const cesto = document.getElementById("cesto");
    botaoCesto.addEventListener("click", (e) => {
    e.preventDefault(); // evita que a página salte para o topo
    cesto.classList.toggle("mostrar");
  });

  document.addEventListener("click", (e) => {
    if (!cesto.contains(e.target) && e.target !== botaoCesto) {
      cesto.classList.remove("mostrar");
    }
  });

});



function carregarProdutos(lista) {
     const secaoProdutos = document.getElementById("produtos");
    lista.forEach(produto => {
     const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}



function criarProduto(produto) {
     const artigo = document.createElement("article");

 
     const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

 
     const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

  
     const descricao = document.createElement("p");
    descricao.textContent = produto.description;

  
     const preco = document.createElement("p");
    preco.textContent = `Preço: €${produto.price.toFixed(2)}`;


     const botao = document.createElement("button");
    botao.textContent = "+ Adicionar ao cesto";
    botao.addEventListener("click", () => {
    adicionarAoCesto(produto);
  });

  
    artigo.append(titulo, imagem, descricao, preco, botao);
     return artigo;
}



function adicionarAoCesto(produto) {
     const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
    selecionados.push(produto);
    localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
    atualizaCesto();
}


function atualizaCesto() {
     const secaoCesto = document.getElementById("produtos-selecionados");
    secaoCesto.innerHTML = ""; 
     
     const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
    let total = 0;
     selecionados.forEach(produto => {
     const artigo = criaProdutoCesto(produto);
     secaoCesto.appendChild(artigo);
     total += produto.price;
  });

    document.getElementById("total").textContent = `Total: €${total.toFixed(2)}`;
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

    artigo.append(titulo, imagem, preco, botaoRemover);
     return artigo;
}



function removerDoCesto(idProduto) {
     let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  selecionados = selecionados.filter(p => p.id !== idProduto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

document.getElementById("esvaziar-cesto").addEventListener("click", () => {
     localStorage.setItem("produtos-selecionados", JSON.stringify([]));
  atualizaCesto();
});
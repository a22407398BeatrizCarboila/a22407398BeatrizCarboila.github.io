// CONFIGURAÇÃO DA API //
// API_URL contém a rota base da API //
const API_URL = "https://deisishop.pythonanywhere.com";

// VARIÁVEIS GLOBAIS//
// produtosAtuais → todos os produtos vindos da API //
// produtosFiltrados → produtos após aplicar filtros (categoria, preço) //
let produtosAtuais = [];  
let produtosFiltrados = [];

// LOCAL STORAGE – CESTO //
// localStorage guarda dados no browser //
// JSON.stringify → converte objeto JS em string JSON //
// JSON.parse → converte string JSON em objeto JS //
if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// EVENTOS PRINCIPAIS //
// DOMContentLoaded → evento disparado quando o HTML está carregado //
document.addEventListener("DOMContentLoaded", () => {  

 // Filtro de preço //
 // querySelector → seleciona elementos usando seletores CSS //
  const filtroPreco = document.getElementById("filtro-preco");

 // addEventListener → regista um evento //
 // "change" → evento disparado quando o valor do <select> muda // 
 // ordenarPorPreco → event handler (função que trata o evento) //
  filtroPreco.addEventListener("change", ordenarPorPreco); 

 // Filtro de categorias //
  const filtroCategorias = document.getElementById("filtro-categorias"); 
  filtroCategorias.addEventListener("change", filtrarPorCategoria); 

 // Carregar produtos e categorias ao iniciar //
  buscarEcarregarProdutos();
  carregarFiltroCategorias();
  atualizaCesto();
});

// BUSCAR PRODUTOS DA API (GET)//
// async/await → permite código assíncrono mais legível //
// fetch → faz pedidos HTTP //
// resposta.json() → converte resposta em JSON // 
async function buscarEcarregarProdutos() {
  const secaoProdutos = document.getElementById("produtos");
  const url = `${API_URL}/products`;

  try {
    const resposta = await fetch(url); // HTTP GET 
    if (!resposta.ok) throw new Error("Erro ao buscar produtos");

    const produtos = await resposta.json(); // JSON → objeto JS 
    produtosAtuais = produtos;
    produtosFiltrados = [...produtosAtuais]; // cópia do array

    carregarProdutos(produtosFiltrados);

  } catch (erro) {
    console.error("Erro:", erro);
    secaoProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>"; 
  }
}

// CARREGAR CATEGORIAS (GET)//
async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");

  // innerHTML → substitui conteúdo HTML //
  select.innerHTML = "<option value=''>Todas as Categorias</option>";

  try {
    const resposta = await fetch(`${API_URL}/categories`);
    if (!resposta.ok) throw new Error("Erro ao buscar categorias");

    const categorias = await resposta.json();

    // forEach → percorre arrays //
    categorias.forEach(cat => {
      const option = document.createElement("option");

     // Algumas APIs devolvem {name: "..."} outras devolvem só "..." //
      const valor = cat.name || cat;

      option.value = valor;
      option.textContent = valor;

      select.appendChild(option); // append → adiciona elemento ao DOM //
    });

  } catch (erro) {
    console.error("Erro categorias:", erro);
  }
}

// FILTRAR POR CATEGORIA //
// event.target → elemento que disparou o evento // 
function filtrarPorCategoria(event) {
  const categoria = event.target.value;

  if (!categoria) {
    produtosFiltrados = [...produtosAtuais];
  } else {
    // filter → devolve elementos que cumprem a condição // 
    produtosFiltrados = produtosAtuais.filter( 
      p => p.category === categoria
    );
  }

  // Se houver ordenação ativa, aplica-a novamente //
  const selectPreco = document.getElementById("filtro-preco");

  if (selectPreco.value) {
    ordenarPorPreco({ target: selectPreco });
  } else {
    carregarProdutos(produtosFiltrados);
  }
}

// ORDENAR POR PREÇO // 
// sort → ordena arrays.
function ordenarPorPreco(event) { 
  const ordem = event.target.value;

  let listaOrdenada = [...produtosFiltrados];

  if (ordem === "asc") {
    listaOrdenada.sort((a, b) => Number(a.price) - Number(b.price)); 
  }

  if (ordem === "desc") {
    listaOrdenada.sort((a, b) => Number(b.price) - Number(a.price));
  }

  carregarProdutos(listaOrdenada);
}

// MOSTRAR PRODUTOS NO DOM // 
// Manipulação do DOM: createElement, append, textContent, innerHTML // 
function carregarProdutos(lista) {
  const secaoProdutos = document.getElementById("produtos"); 
  secaoProdutos.innerHTML = "";

  if (!lista.length) {
    secaoProdutos.innerHTML = "<p>Não há produtos nessa categoria.</p>";
    return;
  }

  lista.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}


// Cria o HTML de um produto individual // 
function criarProduto(produto) {
  const artigo = document.createElement("article");

  // data-attribute → guardar dados no HTML // 
  artigo.dataset.id = produto.id; 

  const imagem = document.createElement("img");
  imagem.src = produto.image.startsWith("http")
    ? produto.image
    : `${API_URL}${produto.image}`;
  imagem.alt = produto.title;

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title; 

  const preco = document.createElement("p");
  preco.textContent = `€${Number(produto.price).toFixed(2)}`;

  const botao = document.createElement("button");
  botao.textContent = "Adicionar ao Cesto";

  // Event Listener → reage ao clique // 
  botao.addEventListener("click", () => adicionarAoCesto(produto)); 
  artigo.append(imagem, titulo, preco, botao);
  return artigo;
}

// CESTO DE COMPRAS // 
// JSON.parse → string JSON → objeto JS // 
// JSON.stringify → objeto JS → string JSON /7
function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados")); 

  selecionados.push(produto);

  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados)); 

  atualizaCesto();
}


// Remove produto do cesto pelo ID // 
function removerDoCesto(idProduto) {
  let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));

 // filter → remove o produto cujo id corresponde ao idProduto //
  selecionados = selecionados.filter(p => p.id !== idProduto);

  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));

  atualizaCesto();
}

// Atualiza o cesto visualmente e calcula o total // 
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

    total += Number(produto.price);
  });

  totalElemento.textContent = `Total: €${total.toFixed(2)}`;
}

// Cria o HTML de um produto dentro do cesto // 
function criaProdutoCesto(produto) {
  const artigo = document.createElement("article");

  const imagem = document.createElement("img");
  imagem.src = produto.image.startsWith("http")
    ? produto.image
    : `${API_URL}${produto.image}`;
  imagem.alt = produto.title;

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title;

  const preco = document.createElement("p");
  preco.textContent = `€${Number(produto.price).toFixed(2)}`;

  const botaoRemover = document.createElement("button");
  botaoRemover.textContent = "Remover";

 // Event Listener → remove produto do cesto // 
  botaoRemover.addEventListener("click", () => removerDoCesto(produto.id));

  artigo.append(imagem, titulo, preco, botaoRemover);
  return artigo;
}

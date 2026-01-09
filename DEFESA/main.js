// CONFIGURAÇÃO DA API

const API_BASES = [
  "https://deisishop.pythonanywhere.com",
  "https://deisishop.pythonanywhere.com/api"
];
let API_URL = API_BASES[0];

// LOCAL STORAGE (CESTO)
//Caso não exista um cesto no localStorage
//cria um array vazio para guardar os produtos selecionados

if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// VARIÁVEIS GLOBAIS

//Array guarda os produtos atualmente carregados da API
//Aplica filtros e ordenações
let produtosAtuais = [];


// Evento principal
//Quando o DOM está totalmente carregado
//Inicializa a aplicação

document.addEventListener("DOMContentLoaded", async () => {
// Deteta qual a API disponível
  await detectarAPI();

// Carrega as categorias para o filtro
  await carregarFiltroCategorias();

//Verifica se existem produtos previamente ordenados guardados no cesto
  const dadosGuardados = localStorage.getItem("produtos-ordenados");

// Converte JSON para array de objetos
  if (dadosGuardados) {
    produtosAtuais = JSON.parse(dadosGuardados);

// Mostra os produtos no DOM
    carregarProdutos(produtosAtuais);
  } else {
// Caso contrário, busca os produtos à API
    await buscarEcarregarProdutos();
  }

// Atualiza o 
  atualizaCesto();
});


// EVENT LISTENER – FILTRO DE PREÇO


//Elemento: select de ordenação por preço
//Evento: change
// Ação: ordenar produtos pelo preço
document
  .getElementById("filtro-preco")
  .addEventListener("change", ordenarPorPreco);


//FUNÇÃO: BUSCAR E CARREGAR PRODUTOS (HTTP GET)
//Vai buscar os produtos à API

//Recebe uma categoria como parâmetro para filtrar
async function buscarEcarregarProdutos(categoria = "") {
  const secaoProdutos = document.getElementById("produtos");

// URL base da rota de produtos
  let url = `${API_URL}/products`;

// Se existir categoria, adiciona query string
  if (categoria) {
    url += `?category=${encodeURIComponent(categoria)}`;
  }

  try {
// Pedido HTTP GET à API
    const resposta = await fetch(url);

    if (!resposta.ok) throw new Error("Erro ao buscar produtos");

// Conversão da resposta para JSON
    const produtos = await resposta.json();

// Guarda os produtos no array global
    produtosAtuais = produtos;

// Mostra os produtos no DOM
    carregarProdutos(produtosAtuais);
  } catch (erro) {
    console.error("Erro:", erro);
    secaoProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

// FUNÇÃO: CARREGAR FILTRO DE CATEGORIAS
//Busca as categorias à API e preenche o select de categorias.
async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");

// Opção padrão
  select.innerHTML = "<option value=''>Todas as Categorias</option>";

  try {
    const resposta = await fetch(`${API_URL}/categories`);
    if (!resposta.ok) throw new Error("Erro ao buscar categorias");

// Converte resposta para JSON
    const categorias = await resposta.json();

// Cria as opções do select
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name || cat;
      option.textContent = cat.name || cat;
      select.appendChild(option);
    });

//Elemento: select de categorias
//Evento: change
//Ação: buscar produtos da categoria escolhida
    select.addEventListener("change", event => {
      buscarEcarregarProdutos(event.target.value);
    });
  } catch (erro) {
    console.error("Erro categorias:", erro);
  }
}

// EVENT HANDLER: ORDENAR PRODUTOS POR PREÇO
//Ordena os produtos pelo preço (crescente ou decrescente)

function ordenarPorPreco(event) {
// Valor selecionado no select
  const ordem = event.target.value;

// Cria uma cópia do array original
  let listaOrdenada = [...produtosAtuais];

// Ordenação do mais barato para o mais caro
  if (ordem === "asc") {
    listaOrdenada.sort((a, b) => a.price - b.price);
  }

//Mais caro para o mais barato
  if (ordem === "desc") {
    listaOrdenada.sort((a, b) => b.price - a.price);
  }

// Guarda o estado no localStorage
  localStorage.setItem(
    "produtos-ordenados",
    JSON.stringify(listaOrdenada)
  );

// Atualiza o DOM
  carregarProdutos(listaOrdenada);
}

// ==================================================
// FUNÇÕES DE MANIPULAÇÃO DO DOM – PRODUTOS
//Mostra uma lista de produtos na secção de produtos
function carregarProdutos(lista) {
  const secaoProdutos = document.getElementById("produtos");
  secaoProdutos.innerHTML = "";

  lista.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}

//Cria o elemento HTML de um produto individual

function criarProduto(produto) {
  const artigo = document.createElement("article");
  artigo.dataset.id = produto.id;

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

// FUNÇÕES DO CESTO DE COMPRAS
//Cria o elemento HTML de um produto no cesto
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

//Adiciona um produto ao cesto e guarda no localStorage
function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  selecionados.push(produto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

//Remove um produto do cesto pelo seu ID
function removerDoCesto(idProduto) {
  let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  selecionados = selecionados.filter(p => p.id !== idProduto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

//Atualiza visualmente o cesto e calcula o total
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
    total += produto.price;
  });

  totalElemento.textContent = `Total: €${total.toFixed(2)}`;
}

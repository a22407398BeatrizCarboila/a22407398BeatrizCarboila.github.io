//CONFIGURAÇÃO DA API
const API_BASES = [
  "https://deisishop.pythonanywhere.com",
  "https://deisishop.pythonanywhere.com/api"
];
let API_URL = API_BASES[0];  //17. HTTP: protocolo de comunicação.Rota: endpoint da API (/products, /categories).GET: buscar dados.POST: enviar dados.

//LOCAL STORAGE (CESTO)
//Caso não exista um cesto no localStorage
//cria um array vazio para guardar os produtos selecionados   

if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

//VARIÁVEIS GLOBAIS
//Array guarda os produtos atualmente carregados da API
//Aplica filtros e ordenações
let produtosAtuais = []; //9. Arrays em JS- listas de elemento


//EVENTO PRINCIPAL  2.Organização do código, com comentários- estruturar o código com comentários e facilita leitura manutenção
// //Quando o DOM está totalmente carregado
//Inicializa a aplicação
//1.Programação orientada a eventos-paradigma definido por eventos e permite que a aplicação reaja a ações
document.addEventListener("DOMContentLoaded", async () => {
//Carrega as categorias para o filtro
  await carregarFiltroCategorias();

//Verifica se existem produtos previamente ordenados guardados no cesto
  const dadosGuardados = localStorage.getItem("produtos-ordenados");

//Converte JSON para array de objetos
  if (dadosGuardados) {
    produtosAtuais = JSON.parse(dadosGuardados); 

//Mostra os produtos no DOM
    carregarProdutos(produtosAtuais);
  } else {
//Caso contrário, busca os produtos à API
    await buscarEcarregarProdutos();
  }

//Atualiza o cesto 
  atualizaCesto();
});


//EVENT LISTENER – FILTRO DE PREÇO


//3.Elemento: select de ordenação por preço
//Evento: change
// Ação: ordenar produtos pelo preço
document
  .getElementById("filtro-preco")
  .addEventListener("change", ordenarPorPreco); //5. Event Listener- função que “escuta” um evento num elemento.

//FUNÇÃO: BUSCAR E CARREGAR PRODUTOS (HTTP GET)  //14. this- referência ao contexto atual do objeto.
//Vai buscar os produtos à API

//Recebe uma categoria como parâmetro para filtrar
async function buscarEcarregarProdutos(categoria = "") {  //19.API: interface que fornece dados.fetch: faz requisição HTTP.res.json(): converte resposta em JSON.async/await: permite trabalhar com código assíncrono.
  //const secaoProdutos = document.getElementById("produtos");

//URL base da rota de produtos //16. Form- elemento HTML <form> para submissão de dados não tenho <form> explícito no teu código
  //let url = `${API_URL}/products`;

// Se existir categoria, adiciona query string //15. data-attribute- atributo personalizado em HTML.
  //if (categoria) {
    //url += `?category=${encodeURIComponent(categoria)}`;
  //}

  try {
//Pedido HTTP GET à API
    //const resposta = await fetch(url);

    //if (!resposta.ok) throw new Error("Erro ao buscar produtos");

//Conversão da resposta para JSON
    //const produtos = await resposta.json();

//Guarda os produtos no array global
    produtosAtuais = produtos;

//Mostra os produtos no DOM
    carregarProdutos(produtosAtuais);
  } catch (erro) {
    console.error("Erro:", erro);
    secaoProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

//FUNÇÃO: CARREGAR FILTRO DE CATEGORIAS
//Busca as categorias à API e preenche o select de categorias.
async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");

//Opção padrão
  select.innerHTML = "<option value=''>Todas as Categorias</option>";

  try {
    const resposta = await fetch(`${API_URL}/categories`);
    if (!resposta.ok) throw new Error("Erro ao buscar categorias");

//Converte resposta para JSON
    const categorias = await resposta.json();

//Cria as opções do select
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

//EVENT HANDLER: ORDENAR PRODUTOS POR PREÇO
//Ordena os produtos pelo preço (crescente ou decrescente)

function ordenarPorPreco(event) {  //6. Event Handler-função que trata o evento quando ocorre
//Valor selecionado no select
  const ordem = event.target.value;

//Cria uma cópia do array original
  let listaOrdenada = [...produtosAtuais];

// Ordenação do mais barato para o mais caro
  if (ordem === "asc") {
    listaOrdenada.sort((a, b) => a.price - b.price); //10. Métodos dos array- forEach → iterar,lista.forEach(produto => { ... });filter → filtrar, sort
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

// FUNÇÕES DE MANIPULAÇÃO DO DOM(PRODUTOS)
//Mostra uma lista de produtos na secção de produtos
function carregarProdutos(lista) {
  const secaoProdutos = document.getElementById("produtos"); //7.querySelector não usei mas seria const secaoProdutos = document.querySelector("#produtos"); que seleciona elementos do DOM com os seletores CSS
  secaoProdutos.innerHTML = "";

  lista.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}

//Cria o elemento HTML de um produto individual
function criarProduto(produto) {
  const artigo = document.createElement("article"); //8.Manipulação do DOM (createElement, append)criar e inserir elementos HTML via JS.
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
  botao.addEventListener("click", () => {  //4.Atributos de evento HTML e eventos JavaScript;HTML: onclick, onchange, oninput;JavaScript: addEventListener("click"
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
  botaoRemover.addEventListener("click", () => { //1.Programação orientada a eventos-paradigma definido por eventos e permite que a aplicação reaja a ações
    removerDoCesto(produto.id);
  });

  artigo.append(imagem, titulo, preco, botaoRemover);
  return artigo;
}

//Adiciona um produto ao cesto e guarda no localStorage
function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados")); //13.JSON: formato de dados.JSON.parse: converte string JSON em objeto JS.JSON.stringify: converte objeto JS em string JSON.
  selecionados.push(produto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados)); //11. localStorage- armazenamento no browser que persiste mesmo após fechar a página.
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

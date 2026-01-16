// CONFIGURAÇÃO DA API //
// API_URL contém a rota base da API //
const API_URL = "https://deisishop.pythonanywhere.com"; //URL.JSON//

// VARIÁVEIS GLOBAIS//
// produtosAtuais → guarda todos os produtos vindos da API //
// produtosFiltrados → guarda produtos após aplicar filtros (categoria, preço) //
let produtosAtuais = [];  //Mudar nome//
let produtosFiltrados = [];

// LOCAL STORAGE – CESTO //
// localStorage guarda dados no browser //
// JSON.stringify → converte objeto JS em string JSON //
// JSON.parse → converte string JSON em objeto JS //
//Verifica se já existe a chave "produtos-selecionados" no localStorage.
//Se não existir, cria-a com um array vazio.
//Garante que o cesto existe sempre antes de ser usado.
if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// EVENTOS PRINCIPAIS //
// DOMContentLoaded → evento disparado quando o HTML está carregado //
document.addEventListener("DOMContentLoaded", () => {  

// Filtro de preço //
// querySelector → seleciona elementos usando seletores CSS //
  const filtroPreco = document.getElementById("filtro-preco"); //mudar nome e criar um if e adicionar uma funcao ar

// addEventListener → regista um evento //
// "change" → evento disparado quando o valor do <select> muda // 
// ordenarPorPreco → event handler (função que trata o evento) //
  filtroPreco.addEventListener("change", ordenarPorPreco);  //input inves de change, documement.getelementid antes

//Obtém o <select> do filtro de preço. 
//Quando o utilizador muda o valor, chama ordenarPorPreco.

// Filtro de categorias //
  const filtroCategorias = document.getElementById("filtro-categorias");  ////input inves de change, documement.getelementid antes
  filtroCategorias.addEventListener("change", filtrarPorCategoria); 
//Obtém o <select> das categorias.
//Quando muda, chama filtrarPorCategoria.

// Carregar produtos e categorias ao iniciar //
//Vai buscar produtos à API.
//Vai buscar categorias à API.
//Atualiza o cesto visualmente.
  buscarEcarregarProdutos();
  carregarFiltroCategorias();
  atualizaCesto();
});

// BUSCAR PRODUTOS DA API (GET)//
// async/await → permite código assíncrono mais legível //
// fetch → faz pedidos HTTP //
// resposta.json() → converte resposta em JSON // 
async function buscarEcarregarProdutos() {   //Função assíncrona para permitir await //Mudar nome//
  const secaoProdutos = document.getElementById("produtos");
  const url = `${API_URL}/products`;
//Seleciona a secção onde os produtos serão exibidos.
//Monta o endpoint da API.

  try {
    const resposta = await fetch(url); // HTTP GET Faz um pedido GET. //url_json//
    if (!resposta.ok) throw new Error("Erro ao buscar produtos"); //Se o servidor responder com erro, lança exceção.

    const produtos = await resposta.json(); // JSON → objeto JS //mudar nome//
    produtosAtuais = produtos; //Guarda os produtos globalmente. //trocar para funcoes pedidas//
    produtosFiltrados = [...produtosAtuais]; //Copia o array para permitir filtragens sem perder os originais.
    carregarProdutos(produtosFiltrados); //Mostra os produtos no ecrã.

  } catch (erro) {
    console.error("Erro:", erro);
    secaoProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>"; //Alterar//
  }
}

// CARREGAR CATEGORIAS (GET)//
async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");

  // innerHTML → substitui conteúdo HTML //
  select.innerHTML = "<option value=''>Todas as Categorias</option>";
//Obtém o <select> e coloca a opção padrão.

  try {
    const resposta = await fetch(`${API_URL}/categories`); //Vai buscar a lista de categorias.
    if (!resposta.ok) throw new Error("Erro ao buscar categorias");

    const categorias = await resposta.json();

    // forEach → percorre arrays //
    categorias.forEach(cat => { //Percorre cada categoria devolvida pela API.
      const option = document.createElement("option");

     // Algumas APIs devolvem {name: "..."} outras devolvem só "...", para compatibilidade//
      const valor = cat.name || cat; 

      option.value = valor;
      option.textContent = valor;

      select.appendChild(option); // append → adiciona elemento ao DOM //Adiciona cada categoria ao <select>.
    });

  } catch (erro) {
    console.error("Erro categorias:", erro);
  }
}

// FILTRAR POR CATEGORIA //
// event.target → elemento que disparou o evento // 
function filtrarPorCategoria(event) {
  const categoria = event.target.value;//Obtém a categoria escolhida.

  if (!categoria) {
    produtosFiltrados = [...produtosAtuais]; //Se o utilizador escolheu "todas", remove o filtro.
  } else {
    // filter → devolve elementos que cumprem a condição // 
    produtosFiltrados = produtosAtuais.filter(  //Filtra produtos que pertencem à categoria selecionada.
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
function ordenarPorPreco(event) { //alterar
  const ordem = event.target.value;//Obtém se é "asc" ou "desc". //document.getelementid
//= [...new Set(todasvar.map(p => p.nome))];
  let listaOrdenada = [...produtosFiltrados]; //Copia o array filtrado.

  if (ordem === "asc") {
    listaOrdenada.sort((a, b) => Number(a.price) - Number(b.price)); 
  }

  if (ordem === "desc") {
    listaOrdenada.sort((a, b) => Number(b.price) - Number(a.price));
  }

  carregarProdutos(listaOrdenada);//Atualiza o DOM.

  //innerHTML = '<option value="nome">nome</option>'
  // nome.forEach(nome => { const opt = document.createElement("opcao"); opc.value = nome; opc.textContent = nome; seletor.appendChild(opc);
}

// MOSTRAR PRODUTOS NO DOM // 
// Manipulação do DOM: createElement, append, textContent, innerHTML // 
function carregarProdutos(lista) {
  const secaoProdutos = document.getElementById("produtos"); 
  secaoProdutos.innerHTML = ""; //Limpa a secção antes de colocar novos produtos.

  if (!lista.length) {
    secaoProdutos.innerHTML = "<p>Não há produtos nessa categoria.</p>";//Se não houver produtos, mostra mensagem.
    return;
  }

  lista.forEach(produto => { //Cria e adiciona cada produto ao DOM.
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}


// Cria o HTML de um produto individual // 
function criarProduto(produto) {      //alterar
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
  botao.addEventListener("click", () => adicionarAoCesto(produto)); //Quando clicado, adiciona o produto ao cesto.
  artigo.append(imagem, titulo, preco, botao);
  return artigo;
}

// CESTO DE COMPRAS // 
// JSON.parse → string JSON → objeto JS // 
// JSON.stringify → objeto JS → string JSON /7
function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));//Lê o array atual do cesto.

  selecionados.push(produto);//Adiciona o novo produto.

  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados)); //Guarda novamente no localStorage.

  atualizaCesto();
}


// Remove produto do cesto pelo ID // 
function removerDoCesto(idProduto) {
  let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));

 // filter → remove o produto cujo id corresponde ao clicado //
  selecionados = selecionados.filter(p => p.id !== idProduto);

  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));

  atualizaCesto();
}

// Atualiza o cesto visualmente e calcula o total // 
function atualizaCesto() { //mudar nome
  const secaoCesto = document.getElementById("produtos-selecionados"); //mudar nome e .value
  const totalElemento = document.getElementById("total");//mudar nome e value.toLowerCase();
//const nome = nome.filter(p => {
  //p.nome.some(variavel => variavel.toLowerCase().includes(nome))
  secaoCesto.innerHTML = "";//Limpa o cesto visual.

  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  let total = 0;

  if (selecionados.length === 0) {
    secaoCesto.innerHTML = "<p>O seu cesto está vazio.</p>";//Mostra mensagem se estiver vazio.
  }

  selecionados.forEach(produto => { //alterar
    const artigo = criaProdutoCesto(produto);//alterar create element 
    secaoCesto.appendChild(artigo); // alterar
    //adiconar innerhtml <p><strong${p.nome e ${p.nome.join(", ")
    total += Number(produto.price);//Soma o preço de cada produto.
  });

  totalElemento.textContent = `Total: €${total.toFixed(2)}`;//Atualiza o total no ecrã.
  //filtradas.length
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
  botaoRemover.addEventListener("click", () => removerDoCesto(produto.id));////Remove o produto quando clicado.

  artigo.append(imagem, titulo, preco, botaoRemover);//Insere a imagem, o título, o preço e o botão dentro do artigo, pela ordem indicada.
  return artigo;
}

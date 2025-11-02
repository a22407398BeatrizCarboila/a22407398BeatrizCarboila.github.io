const API_URL = "https://deisishop.pythonanywhere.com/api"; // conforme tens
if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", () => {
  carregarFiltroCategorias();
  buscarEcarregarProdutos(); 
  atualizaCesto();
});

async function buscarEcarregarProdutos(filtroCategoria = "") {
  const secaoProdutos = document.getElementById("produtos");
  secaoProdutos.innerHTML = "<p>A carregar produtos...</p>";
  let url = `${API_URL}/products`;
  if (filtroCategoria) {
    url += `?category=${encodeURIComponent(filtroCategoria)}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const produtosDaAPI = await response.json();

    secaoProdutos.innerHTML = "";
    if (!Array.isArray(produtosDaAPI) || produtosDaAPI.length === 0) {
      secaoProdutos.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
      return;
    }
    carregarProdutos(produtosDaAPI);
  } catch (err) {
    console.error("Erro ao obter produtos:", err);
    secaoProdutos.innerHTML = `<p>Erro ao carregar produtos. Ver consola para mais detalhes.</p>`;
  }
}
async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");
  if (!select) return;

  select.innerHTML = ""; 

  const optTodas = document.createElement("option");
  optTodas.value = ""; 
  optTodas.textContent = "Todas as Categorias";
  select.appendChild(optTodas);

  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error("Erro ao carregar categorias");
    const categorias = await response.json();
    categorias.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id ?? c.name ?? c.description ?? "";
      option.textContent = c.name ?? c.description ?? option.value;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const cat = e.target.value;
      buscarEcarregarProdutos(cat);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

function carregarProdutos(lista) {
  const secaoProdutos = document.getElementById("produtos");
  secaoProdutos.innerHTML = ""; 
  lista.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}

function criarProduto(produto) {
  const artigo = document.createElement("article");
  artigo.classList.add("produto-card");

  const imagem = document.createElement("img");
  imagem.src = produto.image ?? "";
  imagem.alt = produto.title ?? "Produto";

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title ?? "Sem título";

  const preco = document.createElement("p");
  const precoNum = parseFloat(produto.price) || 0;
  preco.textContent = `€${precoNum.toFixed(2)}`;

  const botao = document.createElement("button");
  botao.textContent = "Adicionar ao Cesto";
  botao.addEventListener("click", () => adicionarAoCesto(produto));

  artigo.append(imagem, titulo, preco, botao);
  return artigo;
}

function criaProdutoCesto(produto) {
  const artigo = document.createElement("article");

  const imagem = document.createElement("img");
  imagem.src = produto.image ?? "";
  imagem.alt = produto.title ?? "Produto";

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title ?? "Sem título";

  const preco = document.createElement("p");
  const precoNum = parseFloat(produto.price) || 0;
  preco.textContent = `€${precoNum.toFixed(2)}`;

  const botaoRemover = document.createElement("button");
  botaoRemover.textContent = "Remover";
  botaoRemover.addEventListener("click", () => removerDoCesto(produto.id));

  artigo.append(imagem, titulo, preco, botaoRemover);
  return artigo;
}


function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
  const existe = selecionados.some(p => p.id === produto.id);
  if (existe) {
    alert("Produto já está no cesto.");
    return;
  }
  const item = {
    id: produto.id,
    title: produto.title,
    price: produto.price,
    image: produto.image
  };

  selecionados.push(item);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

function removerDoCesto(idProduto) {
  let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
  selecionados = selecionados.filter(p => p.id !== idProduto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

function atualizaCesto() {
  const secaoCesto = document.getElementById("produtos-selecionados");
  const totalElemento = document.getElementById("total");

  secaoCesto.innerHTML = "";
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

  if (selecionados.length === 0) {
    secaoCesto.innerHTML = "<p>O seu cesto está vazio.</p>";
  } else {
    selecionados.forEach(produto => {
      const artigo = criaProdutoCesto(produto);
      secaoCesto.appendChild(artigo);
    });
  }

  const total = selecionados.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
  totalElemento.textContent = `Total: €${total.toFixed(2)}`;
}
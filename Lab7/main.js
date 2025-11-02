const API_BASES = [
  "https://deisishop.pythonanywhere.com",
  "https://deisishop.pythonanywhere.com/api"
];
let API_URL = API_BASES[0];

async function detectarAPI() {
  for (const base of API_BASES) {
    try {
      const resp = await fetch(`${base}/products`);
      if (resp.ok) {
        API_URL = base;
        console.log("✅ API ativa em:", base);
        return;
      }
    } catch (e) {
      console.warn("❌ Falhou:", base);
    }
  }
  console.error("⚠️ Nenhum endpoint da API está acessível!");
}

if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", async () => {
  await detectarAPI();
  await carregarFiltroCategorias();
  await buscarEcarregarProdutos();
  atualizaCesto();
});

async function buscarEcarregarProdutos(categoria = "") {
  const secaoProdutos = document.getElementById("produtos");
  secaoProdutos.innerHTML = "<p>A carregar produtos...</p>";

  let url = `${API_URL}/products`;
  if (categoria) url += `?category=${encodeURIComponent(categoria)}`;

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Erro ao buscar produtos");

    const produtos = await resposta.json();
    console.log("📦 Produtos recebidos:", produtos);

    secaoProdutos.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      secaoProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    carregarProdutos(produtos);
  } catch (erro) {
    console.error("❌ Erro a carregar produtos:", erro);
    secaoProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

async function carregarFiltroCategorias() {
  const select = document.getElementById("filtro-categorias");
  select.innerHTML = "<option value=''>Todas as Categorias</option>";

  try {
    const resposta = await fetch(`${API_URL}/categories`);
    if (!resposta.ok) throw new Error("Erro ao buscar categorias");
    const categorias = await resposta.json();

    console.log("🏷️ Categorias:", categorias);

    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name || cat;
      option.textContent = cat.name || cat;
      select.appendChild(option);
    });

    select.addEventListener("change", e => {
      buscarEcarregarProdutos(e.target.value);
    });
  } catch (erro) {
    console.error("❌ Erro ao carregar categorias:", erro);
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

function adicionarAoCesto(produto) {
  const selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  selecionados.push(produto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(selecionados));
  atualizaCesto();
}

function removerDoCesto(idProduto) {
  let selecionados = JSON.parse(localStorage.getItem("produtos-selecionados"));
  selecionados = selecionados.filter(p => p.id !== idProduto);
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
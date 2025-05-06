const getLivrosUrl = 'http://localhost:8080/site/livros';

async function postLivros(event) {
  if (event) event.preventDefault();

  const filtros = {
    autor: document.getElementById('autor').value.trim(),
    categoria: document.getElementById('categoria').value.trim(),
    ano: document.getElementById('ano').value.trim(),
    titulo: document.getElementById('titulo').value.trim(),
    editora: document.getElementById('editora').value.trim(),
    isbn: document.getElementById('isbn').value.trim(),
    paginas: document.getElementById('paginas').value.trim(),
    codigoBarras: document.getElementById('codigoBarras').value.trim()
  };

  const queryParams = Object.entries(filtros)
    .filter(([_, valor]) => valor !== '')
    .map(([chave, valor]) => `${chave}=${encodeURIComponent(valor)}`)
    .join('&');

  const searchUrl = queryParams ? `${getLivrosUrl}?${queryParams}` : getLivrosUrl;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error('Erro ao buscar livros');

    const livros = await response.json();
    preencherTabela(livros);
  } catch (erro) {
    console.error(erro);
    alert('Erro ao buscar livros.');
  }
}

function preencherTabela(livros) {
  const corpoTabela = document.querySelector('#dataTable tbody');
  corpoTabela.innerHTML = '';

  livros.forEach(livro => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${livro.LIV_AUTOR || ''}</td>
      <td>${livro.livCategoria || ''}</td>
      <td>${livro.livAno || ''}</td>
      <td>${livro.livTitulo || ''}</td>
      <td>${livro.LIV_EDITORA || ''}</td>
      <td>${livro.LIV_ISBN || ''}</td>
      <td>${livro.LIV_QTD_PAGINAS || ''}</td>
      <td>${livro.liv_cod_barras || ''}</td>
      <td id="qtd-${livro.livId}">Carregando...</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm">Editar</button>
        </div>
      </td>
    `;
    corpoTabela.appendChild(linha);

    fetch(`http://localhost:8080/site/estoque/get`)
      .then(resp => resp.json())
      .then(estoques => {
        const estoqueLivro = estoques.filter(e => e.idLivro === livro.livId);
        const quantidadeTotal = estoqueLivro.reduce((total, e) => total + e.quantidade, 0);
        document.getElementById(`qtd-${livro.livId}`).innerText = quantidadeTotal;
      });
  });
}

// Função para abrir o modal de entrada de estoque
function abrirEntradaEstoque(idLivro) {
  document.getElementById('idLivroEstoque').value = idLivro;
  const modal = new bootstrap.Modal(document.getElementById('modalEntradaEstoque'));
  modal.show();
}

// Lógica para envio de dados no modal
document.getElementById('formEstoque').addEventListener('submit', async (e) => {
  e.preventDefault();

  const estoque = {
    idLivro: parseInt(document.getElementById('idLivroEstoque').value),
    dataEntrada: document.getElementById('dataEntrada').value,
    fornecedor: document.getElementById('fornecedor').value,
    quantidade: parseInt(document.getElementById('quantidade').value),
    valorDeCusto: parseFloat(document.getElementById('valorDeCusto').value)
  };

  try {
    const resp = await fetch("http://localhost:8080/site/estoque/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estoque)
    });

    if (!resp.ok) throw new Error("Erro ao cadastrar estoque");

    alert("Estoque cadastrado com sucesso!");
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEntradaEstoque'));
    modal.hide();
    postLivros(); // Recarrega a lista de livros após cadastro do estoque
  } catch (err) {
    console.error(err);
    alert("Erro ao cadastrar estoque.");
  }
});

document.getElementById('form-cliente').addEventListener('submit', postLivros);

document.addEventListener('DOMContentLoaded', () => postLivros());

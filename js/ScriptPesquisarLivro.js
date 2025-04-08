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
    qtdpaginas: document.getElementById('paginas').value.trim(),
    codbarras: document.getElementById('codigoBarras').value.trim()
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
    console.log('Dados recebidos do backend:', livros);

    if (livros.length === 0) {
      alert('Nenhum livro encontrado.');
      return;
    }

    preencherTabela(livros);
  } catch (erro) {
    console.error(erro);
    alert('Erro ao buscar livros. Verifique a conexão com o servidor.');
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
  <td>
    <div class="d-flex flex-column align-items-center">
      <button class="btn btn-outline-dark btn-sm btn-qtd" data-action="aumentar" style="width: 60px;">
        <i class="bi bi-plus-lg"></i>
      </button>
      <input type="number" class="form quantidade" value="1" min="1" style="width: 60px; height: 35px; font-size: 16px; text-align: center;">
      <button class="btn btn-outline-dark btn-sm btn-qtd" data-action="diminuir" style="width: 60px;">
        <i class="bi bi-dash-lg"></i>
      </button>
    </div>
  </td>
  <td>
    <button class="btn btn-success btn-sm" onclick="editarLivro(${livro.livId})">Editar</button>
  </td>
`;

    
      corpoTabela.appendChild(linha);
    });
  }
  
function editarLivro(id) {
  window.location.href = `AlterarLivro.html?id=${id}`;
}

// ✅ Corrigido ID do formulário
document.getElementById('form-cliente').addEventListener('submit', postLivros);
document.addEventListener('DOMContentLoaded', () => postLivros());

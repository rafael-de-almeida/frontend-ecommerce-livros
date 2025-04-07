let livrosOriginais = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get('id'); // <- pega o id uma vez aqui

document.addEventListener('DOMContentLoaded', function () {
    fetchLivros(); // não muda aqui
    atualizarBadgeCarrinho();

    const form = document.querySelector('form[role="search"]');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
    });

    const inputPesquisa = document.getElementById('barraPesquisa');
    inputPesquisa.addEventListener('input', function () {
        const termo = inputPesquisa.value.toLowerCase();
        const filtrados = livrosOriginais.filter(livro =>
            livro.livTitulo.toLowerCase().includes(termo)
        );
        renderLivros(filtrados, id); // <- passa o id corretamente aqui
    });
});

function fetchLivros() {
    fetch('http://localhost:8080/site/livros')
        .then(response => response.json())
        .then(livros => {
            livrosOriginais = livros;
            renderLivros(livros, id); // <- importante
        })
        .catch(error => {
            console.error('Erro ao buscar livros:', error);
        });
}

function renderLivros(livros, id) {
    const container = document.querySelector('.row');
    container.innerHTML = '';

    livros.forEach(livro => {
        const valorVenda = parseFloat(livro.LIV_VENDA);
        const preco = !isNaN(valorVenda) ? `R$ ${valorVenda.toFixed(2)}` : 'Preço indisponível';

        const card = document.createElement('div');
        card.classList.add('col-md-3', 'mb-4');
        card.innerHTML = `
            <div class="card book-card h-100">
                <a href="detalhesLivros.html?liv_id=${livro.livId}&id=${id}">
                    <img src="${livro.livImagem}" class="card-img-top" alt="${livro.livTitulo}">
                </a>
                <div class="card-body text-center">
                    <h5 class="card-title">${livro.livTitulo}</h5>
                    <p class="card-text">${preco}</p>
                    <div class="row">
                        <div class="col">
                            <button class="btn btn-success btn-comprar-agora">Compre Agora</button>
                        </div>
                        <div class="col">
                            <button class="btn btn-outline-primary btn-adicionar-carrinho">Adicione no Carrinho</button>
                        </div>
                    </div>
                </div>
            </div>
        `;


        const btnComprar = card.querySelector('.btn-comprar-agora');
        btnComprar.addEventListener('click', () => comprarAgora(livro));

        const btnAdicionar = card.querySelector('.btn-adicionar-carrinho');
        btnAdicionar.addEventListener('click', () => adicionarAoCarrinho(livro));

        container.appendChild(card);
    });
}

function adicionarAoCarrinho(livro) {
    const livroExistente = carrinho.find(item => item.livId === livro.livId);
    if (livroExistente) {
        livroExistente.quantidade += 1;
    } else {
        carrinho.push({ ...livro, quantidade: 1 });
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
}

function comprarAgora(livro) {
    const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];

    const livroExistente = carrinhoAtual.find(item => item.livId === livro.livId);
    if (livroExistente) {
        livroExistente.quantidade += 1;
    } else {
        carrinhoAtual.push({ ...livro, quantidade: 1 });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
    window.location.href = 'Carrinho.html';
}

function atualizarBadgeCarrinho() {
    const badge = document.querySelector('.navbar .badge');
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    badge.textContent = totalItens;
}

function passarIdCartao () {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `cartoes.html?id=${id}`;
}

function passarIdEndereco () {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `enderecos.html?id=${id}`;
}
function passarIdCarrinho() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `Carrinho.html?id=${id}`;
}

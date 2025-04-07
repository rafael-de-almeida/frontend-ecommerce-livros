let livrosOriginais = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchLivros();

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
        renderLivros(filtrados);
    });
});

function fetchLivros() {
    fetch('http://localhost:8080/site/livros')
        .then(response => response.json())
        .then(livros => {
            livrosOriginais = livros;
            renderLivros(livros);
        })
        .catch(error => {
            console.error('Erro ao buscar livros:', error);
        });
}

function renderLivros(livros) {
    const container = document.querySelector('.row');
    container.innerHTML = '';

    livros.forEach(livro => {
        const preco = livro.livPreco ? `R$ ${livro.livPreco.toFixed(2)}` : 'Preço indisponível';
        const card = `
            <div class="col-md-3 mb-4">
                <div class="card book-card h-100">
                    <img src="${livro.livImagem}" class="card-img-top" alt="${livro.livTitulo}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${livro.livTitulo}</h5>
                        <p class="card-text">${preco}</p>
                        <div class="row">
                            <div class="col"><a href="#" class="btn btn-success">Compre Agora</a></div>
                            <div class="col"><a href="#" class="btn btn-outline-primary">Adicione no Carrinho</a></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
function passarIdCartao (){
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `cartoes.html?id=${id}`
}
function passarIdEndereco (){
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `enderecos.html?id=${id}`
}
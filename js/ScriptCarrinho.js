
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho();
});

function renderizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const lista = document.querySelector('.list-group');
    const totalSpan = document.getElementById('total');

    lista.innerHTML = '';

    if (carrinho.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-center">Seu carrinho está vazio.</li>';
        totalSpan.textContent = 'R$ 0,00';
        return;
    }

    let total = 0;

    carrinho.forEach((item, index) => {
        const preco = parseFloat(item.LIV_VENDA);
        const subtotal = preco * item.quantidade;
        total += subtotal;

        const li = document.createElement('li');
        li.className = 'list-group-item py-3';
        li.innerHTML = `
            <div class="row g-3">
                <div class="col-4 col-md-3 col-lg-2">
                    <a href="#"><img src="${item.livImagem}" class="img-thumbnail"></a>
                </div>
                <div class="col-8 col-md-6 col-lg-6 align-self-center">
                    <h4><b><a href="#" class="text-decoration-none text-dark">${item.livTitulo}</a></b></h4>
                    <p class="mb-1">${item.LIV_SINOPSE || 'Descrição não disponível.'}</p>
                    <h5 class="text-success">R$ ${preco.toFixed(2)}</h5>
                </div>
                <div class="col-12 col-md-3 col-lg-4 align-self-center">
                    <div class="input-group">
                        <button class="btn btn-outline-dark btn-sm" onclick="alterarQuantidade(${index}, -1)">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <input type="text" class="form-control text-center border-dark" value="${item.quantidade}" readonly>
                        <button class="btn btn-outline-dark btn-sm" onclick="alterarQuantidade(${index}, 1)">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                    <button class="btn btn-danger mt-2 w-100" onclick="removerItem(${index})">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(li);
    });

    totalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

function alterarQuantidade(index, delta) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho[index].quantidade += delta;

    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
}

function removerItem(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
}


document.querySelector('.btn-success').addEventListener('click', () => {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    
    window.location.href = 'finalizarCompra.html';
});

function passarIdFinalizarCompra(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `finalizarCompra.html?id=${id}`;

    if (!id) {
        console.log("Nenhum ID capturado na URL.");
        return;
    }
}




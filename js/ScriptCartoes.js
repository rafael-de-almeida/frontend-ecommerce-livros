document.addEventListener("DOMContentLoaded", carregarCartoes);

async function carregarCartoes() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    console.log("ID do cliente:", id); 

    if (!id) {
        console.error("ID do cliente não encontrado na URL.");
        return;
    }

    const apiUrl = `http://localhost:8080/site/cartoes?id=${id}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Erro ao buscar cartões");
        }

        const cartoes = await response.json();
        console.log("Resposta da API:", cartoes); 

        exibirCartoes(cartoes);
    } catch (error) {
        console.error("Erro ao carregar cartões:", error);
    }
}

function exibirCartoes(cartoes) {
    const container = document.querySelector("#cartoes-container");
    container.innerHTML = ''; 

    if (!cartoes || cartoes.length === 0) {
        container.innerHTML = '<p>Nenhum cartão cadastrado.</p>';
        return;
    }

    cartoes.forEach(cartao => {
        const cartaoHTML = `
            <div class="card mb-3">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title">Terminado em ${cartao.CAR_NUMERO?.slice(-4) || "XXXX"}</h5>
                        <p class="card-text">${cartao.CAR_BANDEIRA || "Bandeira desconhecida"}</p>
                        ${cartao.CAR_STATUS === 'principal' ? '<span class="badge bg-primary">Cartão principal</span>' : ''}
                    </div>
                    <div>
                        ${cartao.CAR_STATUS !== 'principal' ? `<button class="btn btn-outline-primary btn-sm" onclick="definirComoPrincipal(${cartao.CAR_ID})">Definir como principal</button>` : ''}
                        <button class="btn btn-outline-secondary btn-sm" onclick="editarCartao(${cartao.CAR_ID})">Editar</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cartaoHTML;
    });
}

document.querySelector("#cartoes-container").insertAdjacentHTML('beforeend', 
    '<button class="btn btn-success w-100 mt-3" onclick="passarIdCartao()">Adicionar novo Cartão</button>');


function definirComoPrincipal(cartaoId) {
    console.log("Definir cartão como principal:", cartaoId);
  
}

function editarCartao(cartaoId) {
    console.log("Editar cartão:", cartaoId);
    window.location.href = `editarCartao.html?id=${cartaoId}`;
}

function passarIdCartao() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `inserirCartao.html?id=${id}`;
}

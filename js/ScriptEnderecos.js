document.addEventListener("DOMContentLoaded", carregarEnderecos);

async function carregarEnderecos() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    console.log("ID do cliente:", id); 

    if (!id) {
        console.error("ID do cliente não encontrado na URL.");
        return;
    }

    const apiUrl = `http://localhost:8080/site/enderecos?id=${id}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Erro ao buscar enderecos");
        }

        const enderecos = await response.json();
        console.log("Resposta da API:", enderecos); 

        exibirEnderecos(enderecos);
    } catch (error) {
        console.error("Erro ao carregar enderecos:", error);
    }
}

function exibirEnderecos(enderecos) {
    const container = document.querySelector("#enderecos-container");
    container.innerHTML = ''; 

    if (!enderecos || enderecos.length === 0) {
        container.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
        return;
    }

    enderecos.forEach(endereco => {
        const enderecoHTML = `
            <div class="card mb-3">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title">${endereco.END_RUA}</h5>
                        <p class="card-text">${endereco.END_BAIRRO || "Bairro desconhecido"}</p>
                        ${endereco.END_STATUS === 'principal' ? '<span class="badge bg-primary">Endereço principal</span>' : ''}
                    </div>
                    <div>
                        ${endereco.END_STATUS !== 'principal' ? `<button class="btn btn-outline-primary btn-sm" onclick="definirComoPrincipal(${endereco.END_ID})">Definir como principal</button>` : ''}
                        <button class="btn btn-outline-secondary btn-sm" onclick="editarEndereco(${endereco.END_ID})">Editar</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += enderecoHTML;
    });
}

document.querySelector("#endereco-container").insertAdjacentHTML('beforeend', 
    '<button class="btn btn-success w-100 mt-3" onclick="passarIdEndereco()">Adicionar novo Endereço</button>');


function definirComoPrincipal(enderecoId) {
    console.log("Definir endereço como principal:", enderecoId);
  
}

function editarEndereco(enderecoId) {
    console.log("Editar endereco:", enderecoId);
    window.location.href = `editarEndereco.html?id=${enderecoId}`;
}

function passarIdEndereco() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `inserirEndereco.html?id=${id}`;
}

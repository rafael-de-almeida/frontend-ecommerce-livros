let cartoesDisponiveis = []; // Armazena os cartões do cliente
let selectsCartoes = []; // Armazena todos os <select> dos cartões

window.onload = function () {
    receberId();

    const adicionarCartaoButton = document.getElementById('adicionar-cartao');
    const cartoesContainer = document.getElementById('cartoes-container');

    adicionarCartaoButton.addEventListener('click', () => {
        const novoSelectGroup = criarSelectCartao();
        if (novoSelectGroup) {
            cartoesContainer.appendChild(novoSelectGroup);
            atualizarOpcoesCartoes();
        } else {
            alert("Não há mais cartões para adicionar.");
        }
    });
};

// Cria um novo select de cartão (com botão cancelar)
function criarSelectCartao() {
    const cartoesSelecionados = new Set(
        selectsCartoes.map(sel => sel.value).filter(v => v !== "")
    );

    const cartoesRestantes = cartoesDisponiveis.filter(cartao => !cartoesSelecionados.has(String(cartao.carId)));

    if (cartoesRestantes.length === 0) return null;

    const cartaoGroup = document.createElement("div");
    cartaoGroup.className = "d-flex align-items-center mb-2 gap-2";

    const novoSelect = document.createElement("select");
    novoSelect.className = "form-select";
    novoSelect.ariaLabel = "Cartão Adicional";

    selectsCartoes.push(novoSelect);

    novoSelect.addEventListener("change", () => {
        atualizarOpcoesCartoes();
    });

    const btnCancelar = document.createElement("button");
    btnCancelar.textContent = "Cancelar";
    btnCancelar.className = "btn btn-outline-danger btn-sm";
    btnCancelar.addEventListener("click", () => {
        selectsCartoes = selectsCartoes.filter(s => s !== novoSelect);
        cartaoGroup.remove();
        atualizarOpcoesCartoes();
    });

    cartaoGroup.appendChild(novoSelect);
    cartaoGroup.appendChild(btnCancelar);
    return cartaoGroup;
}

function atualizarOpcoesCartoes() {
    const valoresSelecionados = new Set(
        selectsCartoes.map(s => s.value).filter(v => v !== "")
    );

    selectsCartoes.forEach(select => {
        const valorAtual = select.value;
        select.innerHTML = "";

        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Selecione um cartão";
        select.appendChild(optionDefault);

        cartoesDisponiveis.forEach(cartao => {
            const idCartao = String(cartao.carId);
            const ultimos = cartao.CAR_NUMERO.slice(-4);
            const texto = `Cartão de Crédito - ${cartao.CAR_BANDEIRA} - **** ${ultimos}`;

            if (!valoresSelecionados.has(idCartao) || idCartao === valorAtual) {
                const option = document.createElement("option");
                option.value = idCartao;
                option.textContent = texto;
                if (idCartao === valorAtual) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
        });
    });
}

// ============================
//     BUSCA E ATUALIZAÇÃO
// ============================

function receberId() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    fetchDados(id);
}

async function fetchDados(id) {
    try {
        const response = await fetch(`http://localhost:8080/site/clientes/get/${id}`);
        if (!response.ok) throw new Error(`Erro na busca: ${response.statusText}`);

        const data = await response.json();
        if (!data || Object.keys(data).length === 0) {
            alert("Nenhum cliente encontrado.");
            return;
        }

        atualizarEnderecos(data);
        atualizarCartoes(data);
    } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
        alert("Erro ao buscar os dados do cliente.");
    }
}

function atualizarEnderecos(data) {
    const select = document.getElementById("endereco-selecionado");
    select.innerHTML = '<option value="" selected>Selecione um endereço</option>';

    data.enderecos.forEach(endereco => {
        const option = document.createElement("option");
        option.value = endereco.endId;
        option.textContent = `${endereco.END_RUA}, ${endereco.END_NUMERO} - ${endereco.END_BAIRRO}, ${endereco.END_CIDADE} - ${endereco.END_ESTADO}`;
        select.appendChild(option);
    });
}

function atualizarCartoes(data) {
    cartoesDisponiveis = data.cartoes;

    const selectPrincipal = document.getElementById("cartao1");
    selectsCartoes = [selectPrincipal];

    selectPrincipal.innerHTML = '<option value="">Selecione um cartão</option>';
    data.cartoes.forEach(cartao => {
        const option = document.createElement("option");
        const ultimos = cartao.CAR_NUMERO.slice(-4);
        option.value = cartao.carId;
        option.textContent = `Cartão de Crédito - ${cartao.CAR_BANDEIRA} - **** ${ultimos}`;
        selectPrincipal.appendChild(option);
    });

    selectPrincipal.addEventListener("change", () => {
        atualizarOpcoesCartoes();
    });
}

// Navegação
function passarIdCartao() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `cartoes.html?id=${id}`;
}

function passarIdEndereco() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    window.location.href = `enderecos.html?id=${id}`;
}

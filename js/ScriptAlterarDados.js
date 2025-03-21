const getApiUrl = 'http://localhost:8080/site/clientes/get'; 
const updateApiUrl = 'http://localhost:8080/site/clientes/put'; // URL para atualização

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

// Função para carregar dados do cliente (ao carregar a página)
async function carregarDadosCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    if (!id) {
        console.log("Nenhum ID capturado na URL.");
        return;
    }

    console.log("ID capturado:", id);
    localStorage.setItem('clienteId', id); // Salva o ID no localStorage
    
    const apiUrl = `${getApiUrl}/${id}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na busca: ${response.statusText}`);
        }

        const cliente = await response.json();
        preencherFormulario(cliente);
    } catch (error) {
        console.error('Erro ao carregar os dados do cliente:', error);
        alert("Erro ao carregar os dados do cliente. Tente novamente.");
    }
}


// Função para preencher o formulário com os dados do cliente
function preencherFormulario(cliente) {
    document.getElementById('nome').value = cliente.CLI_NOME || '';
    document.getElementById('genero').value = cliente.CLI_GENERO || '';
    document.getElementById('data-nascimento').value = cliente.CLI_NASCIMENTO || '';
    document.getElementById('idade').value = cliente.CLI_IDADE || '';
    document.getElementById('cpf').value = cliente.CLI_CPF || '';
    document.getElementById('email').value = cliente.CLI_EMAIL || '';
    document.getElementById('telefone').value = cliente.CLI_TELEFONE || '';
    document.getElementById('status').value = cliente.CLI_STATUS || '';
}

// Função para atualizar os dados do cliente (ao submeter o formulário)
async function atualizarCliente(event) {
    event.preventDefault();

    const id = localStorage.getItem('clienteId'); 
    if (!id) {
        alert("Erro: ID do cliente não encontrado.");
        return;
    }

    const clienteAtualizado = {
        CLI_NOME: document.getElementById('nome').value.trim(),
        CLI_GENERO: document.getElementById('genero').value.trim(),
        CLI_NASCIMENTO: document.getElementById('data-nascimento').value.trim(),
        CLI_IDADE: document.getElementById('idade').value.trim(),
        CLI_CPF: document.getElementById('cpf').value.trim(),
        CLI_EMAIL: document.getElementById('email').value.trim(),
        CLI_TELEFONE: document.getElementById('telefone').value.trim(),
        CLI_STATUS: document.getElementById('status').value.trim()
    };

    try {
        const apiUrl = `${updateApiUrl}?id=${id}`; // Certifique-se de que o ID está na URL

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteAtualizado),
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar: ${response.statusText}`);
        }

        alert("Cliente atualizado com sucesso!");
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        alert("Erro ao atualizar cliente. Tente novamente.");
    }
}

// Adiciona o evento para o formulário de atualização
document.getElementById('form-cliente').addEventListener('submit', atualizarCliente);

// Carregar dados do cliente ao carregar a página
window.addEventListener('DOMContentLoaded', carregarDadosCliente);

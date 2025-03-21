const getApiUrl = 'http://localhost:8080/site/clientes/get';


async function postclientes(event) {
    event.preventDefault(); 

   
    const nome = document.getElementById('nome').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const nascimento = document.getElementById('data-nascimento').value.trim();
    const idade = document.getElementById('idade').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();


    const filters = {
        CLI_NOME: nome,
        CLI_GENERO: genero,
        CLI_NASCIMENTO: nascimento,
        CLI_IDADE: idade,
        CLI_CPF: cpf,
        CLI_EMAIL: email,
        CLI_TELEFONE: telefone
    };

    
    const queryParams = Object.entries(filters)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    const searchUrl = queryParams.length > 0 ? `${getApiUrl}?${queryParams}` : getApiUrl;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Erro na busca: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            alert("Nenhum cliente encontrado.");
            return;
        }

        populateTable(data); 
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        alert("Erro ao buscar clientes. Tente novamente.");
    }
}

function populateTable(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    clientesAtivos = data.filter(item => item.CLI_STATUS === 'ativo');

    clientesAtivos.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.cliId);  // Adiciona o atributo data-id à linha
        row.innerHTML = `
            <td>${item.CLI_NOME || 'N/A'}</td>
            <td>${item.CLI_GENERO || 'N/A'}</td>
            <td>${item.CLI_NASCIMENTO || 'N/A'}</td>
            <td>${item.CLI_IDADE || 'N/A'}</td>
            <td>${item.CLI_CPF || 'N/A'}</td>
            <td>${item.CLI_EMAIL || 'N/A'}</td>
            <td>${item.CLI_TELEFONE || 'N/A'}</td>
            <td>
                <div class="d-flex flex-column gap-2">
                    <button class="btn btn-success btn-sm" onclick="editarCliente(${item.cliId})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirCliente(${item.cliId})">Excluir</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}



document.querySelector('form').addEventListener('submit', postclientes);

document.addEventListener('DOMContentLoaded', () => {
    postclientes(new Event('submit'));
});


function editarCliente(clienteId) {
    // Verifique se o clienteId é válido
    if (clienteId === undefined || clienteId === null) {
        console.error("ID do cliente não está definido.");
        alert("Erro: ID do cliente não encontrado.");
        return;
    }
  // Verifique o id do cliente que está sendo passado
  console.log("Redirecionando para AlterarDados.html?id=" + clienteId);

  // Redireciona para a página de edição com o id como parâmetro na URL
  window.location.href = `AlterarDados.html?id=${clienteId}`;
}

function excluirCliente(clienteId) {
    // Verifique se o clienteId é válido
    if (clienteId === undefined || clienteId === null) {
        console.error("ID do cliente não está definido.");
        alert("Erro: ID do cliente não encontrado.");
        return;
    }

    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
        return;
    }

    const deleteApiUrl = `http://localhost:8080/site/clientes/delete?id=${clienteId}`;

    fetch(deleteApiUrl, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao excluir: ${response.statusText}`);
        }

        alert("Cliente excluído com sucesso!");

        // Remover a linha da tabela diretamente
        const row = document.querySelector(`tr[data-id="${clienteId}"]`);
        if (row) {
            row.remove();  // Remove a linha da tabela
        }
    })
    .catch(error => {
        console.error('Erro ao excluir cliente:', error);
        alert("Erro ao excluir cliente. Tente novamente.");
    });
}

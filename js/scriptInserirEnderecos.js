/**
 * Redireciona para a página de cartões, mantendo o ID do cliente na URL.
 */
function passarIdCartao() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        window.location.href = `cartoes.html?id=${id}`;
    }
}

/**
 * Redireciona para a página de endereços (recarrega a página atual), mantendo o ID.
 */
function passarIdEndereco() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        window.location.href = `enderecos.html?id=${id}`;
    }
}

/**
 * Função principal para enviar os dados do endereço para a API.
 * Esta função é chamada quando o formulário é submetido.
 * @param {Event} event - O evento de submit do formulário.
 */
async function postEndereco(event) {
    // Impede o comportamento padrão do formulário (que é recarregar a página com GET)
    event.preventDefault(); 

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); 

    if (!id) {
        alert("Erro: ID do cliente não encontrado na URL. Não é possível salvar o endereço.");
        return; 
    }

    const postapiUrl = `http://localhost:8080/site/clientes/post/endereco?id=${id}`;

    console.log("ID do Cliente:", id);
    console.log("URL da Requisição:", postapiUrl);

    // Coleta os valores dos campos do formulário
    const cep = document.getElementById('cep').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const status = document.getElementById('endereco-principal').checked ? 'principal' : 'secundario';

  
   const dadosEndereco = {
    END_CEP: cep,
    END_RUA: rua, // Corrigido de 'endLogradouro' para 'END_RUA'
    END_NUMERO: numero,
    END_COMPLEMENTO: complemento,
    END_CIDADE: cidade,
    END_BAIRRO: bairro,
    END_ESTADO: estado,
    END_STATUS: status
};

    console.log('Enviando JSON para o servidor:', JSON.stringify(dadosEndereco, null, 2));

    try {
        const response = await fetch(postapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosEndereco)
        });

        if (!response.ok) {
            // Se a resposta não for OK, tenta ler o corpo do erro como texto.
            const errorText = await response.text();
            console.error('Erro na resposta do servidor:', response.status, errorText);
            alert(`Erro ao cadastrar endereço. Status: ${response.status}. Verifique o console para mais detalhes.`);
        } else {
            // Se a resposta for OK, lê o JSON retornado.
            const responseData = await response.json();
            console.log('Resposta de sucesso:', responseData);
            alert('Endereço cadastrado com sucesso!');
            // Opcional: redirecionar para outra página ou limpar o formulário.
            // window.location.href = `meus-enderecos.html?id=${id}`; 
        }
    } catch (error) {
        // Captura erros de rede (ex: servidor offline).
        console.error('Erro de rede ou na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se a aplicação está rodando e o console para mais detalhes.');
    }
}

// MUDANÇA PRINCIPAL: Adiciona o "ouvinte de eventos" ao formulário.
// Isso garante que o JavaScript intercepte o envio do formulário corretamente.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-endereco');
    if (form) {
        form.addEventListener('submit', postEndereco);
    } else {
        console.error('CRÍTICO: O elemento <form> com o ID "form-endereco" não foi encontrado no HTML.');
    }
});
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

async function postEndereco(event) {
    event.preventDefault(); 

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id'); 

    if (!id) {
        alert("Nenhum ID capturado na URL.");
        return; 
    }

    console.log("ID capturado:", id);

    const postapiUrl = `http://localhost:8080/site/clientes/post/endereco?id=${id}`;
    console.log("POST URL:", postapiUrl);

  
    const cep = document.getElementById('cep').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const status = document.getElementById('endereco-principal').checked ? 'principal' : 'secundario'; // Correção aqui

    if (!cep || !rua || !numero || !complemento || !bairro || !cidade || !estado || !status) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const data = JSON.stringify({
        END_CEP: cep,
        END_RUA: rua,
        END_NUMERO: numero,
        END_COMPLEMENTO: complemento,
        END_CIDADE: cidade,
        END_BAIRRO: bairro,
        END_ESTADO: estado,
        END_STATUS: status
    });

    console.log('Enviando dados:', data);

    try {
        const response = await fetch(postapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro:', response.status, errorText);
            alert('Erro ao cadastrar endereço.');
        } else {
            const responseData = await response.json();
            console.log('Resposta:', responseData);
            alert('Endereço cadastrado com sucesso!');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao enviar os dados. Tente novamente.');
    }
}

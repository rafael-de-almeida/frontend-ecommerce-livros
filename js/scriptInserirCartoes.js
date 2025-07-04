document.getElementById('formCartao').addEventListener('submit', async function(event) {
    event.preventDefault();  
    await postCartao(event);  
});

async function postCartao(event) {
   
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id'); 

    if (!id) {
        console.log("Nenhum ID capturado na URL."); 
        return;
    }

    console.log("ID do cliente:", id);

    const postapiUrl = `http://localhost:8080/site/clientes/post/cartao?id=${id}`;

   
    const numero = document.getElementById('numero-cartao').value;
    const bandeira = document.getElementById('bandeira').value;
    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const vencimento = document.getElementById('vencimento').value;
    const statusElement = document.getElementById('status');
    const status = statusElement ? statusElement.value : "ativo"; 

    if (!numero || !bandeira || !codigo || !nome || !vencimento) {
        alert('Preencha todos os campos.');
        return;
    }

    const data = JSON.stringify({
        CAR_NUMERO: numero,
        CAR_BANDEIRA: bandeira,
        CAR_CODIGO: codigo,
        CAR_NOME: nome,
        CAR_VENCIMENTO: vencimento,
        CAR_STATUS: status,
    });

    console.log("Dados a serem enviados:", data);

    try {
       
        const response = await fetch(postapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        });

        const responseData = await response.json(); 

       
        if (response.ok) {
            alert('Cartão cadastrado com sucesso!');
            console.log('Response:', responseData);
        } else {
            console.error('Erro:', response.status, responseData);
            alert('Erro ao cadastrar o cartão.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro inesperado. Verifique o console.');
    }
}

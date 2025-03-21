

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

async function postclientes(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id'); // Tenta pegar o ID da URL

    if (!id) {
        console.log("Nenhum ID capturado na URL."); // Se não houver ID na URL, define um valor padrão
    }

    console.log("ID capturado:", id);

    // Construindo a URL da API com o ID
    const postapiUrl = `http://localhost:8080/site/clientes/post/cartao?id=${id}`;
    console.log("POST URL:", postapiUrl);
    const numero = document.getElementById('numero-cartao').value;
    const bandeira = document.getElementById('bandeira').value;
    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const vencimento = document.getElementById('vencimento').value;
    const status = document.getElementById('status').value;

    if (!numero || !bandeira || !codigo || !nome || !vencimento || !status) {
        alert('Please fill in all fields.');
        return;
    }

    const data = JSON.stringify({
        CAR_NUMERO: numero,
        CAR_BANDEIRA: bandeira,
        CAR_CODIGO: codigo,
        CAR_NOME: nome,
        CAR_VENCIMENTO: vencimento,
        CAR_STATUS : status,
    });
    console.log('Sending data:', data);
    try {
        const response = await fetch(postapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        });

        if (response.ok) {
            const responseData = await response.json();
            alert('Client successfully posted!');
            console.log('Response:', response.json());
        } else {
            const errorText = await response.text();
            console.error('Error:', response.status, errorText);
            alert('Failed to post client. Check the console for details.');
        }
    } catch (error) {
        console.error('Error during POST request:', error);
        alert('An error occurred. Please try again.');
    }
}
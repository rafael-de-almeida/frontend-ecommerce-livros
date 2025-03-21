const postapiUrl = 'http://localhost:8080/site/clientes/post/cliente';
async function postclientes(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const genero = document.getElementById('genero').value;
    const data_de_nascimento = document.getElementById('data_de_nascimento').value;
    const idade = document.getElementById('idade').value;
    const senha = document.getElementById('senha').value;
    const confirmar_senha = document.getElementById('confirmar_senha').value;
    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    //let status = document.getElementById('status').value;
    let status = "ativo";

    if (!nome || !genero || !data_de_nascimento || !idade || !senha || !confirmar_senha || !cpf || !email || !telefone || !status) {
        alert('Please fill in all fields.');
        return;
    }
    if (senha != confirmar_senha) {
        alert('senhas diferentes.');
        return;
    }
    const data = JSON.stringify({
        CLI_NOME: nome,
        CLI_GENERO: genero,
        CLI_NASCIMENTO: data_de_nascimento,
        CLI_IDADE: idade,
        CLI_SENHA: senha,
        CLI_CPF: cpf,
        CLI_EMAIL: email,
        CLI_TELEFONE: telefone,
        CLI_STATUS: status
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
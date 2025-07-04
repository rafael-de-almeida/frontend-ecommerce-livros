const postapiUrl = 'http://localhost:8080/site/clientes/post/cliente';

document.addEventListener('DOMContentLoaded', () => {
    const senhaInput = document.getElementById('senha');
    const feedbackContainer = document.getElementById('password-feedback');

    
    senhaInput.addEventListener('focus', () => {
        feedbackContainer.style.display = 'block';
    });

    
    senhaInput.addEventListener('blur', () => {
        if (senhaInput.value === '') {
            feedbackContainer.style.display = 'none';
        }
    });

    
    senhaInput.addEventListener('input', () => {
        const senha = senhaInput.value;
        validatePassword(senha);
    });
});

function validatePassword(senha) {
    const ruleLength = document.getElementById('rule-length');
    const ruleLetter = document.getElementById('rule-letter');
    const ruleNumber = document.getElementById('rule-number');
    const ruleSpecial = document.getElementById('rule-special');


    const temNumero = /\d/;
    const temLetra = /[a-zA-Z]/;
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    
    if (senha.length >= 8) {
        ruleLength.textContent = '✅ Pelo menos 8 caracteres';
        ruleLength.style.color = 'green';
    } else {
        ruleLength.textContent = '❌ Pelo menos 8 caracteres';
        ruleLength.style.color = 'red';
    }

    if (temLetra.test(senha)) {
        ruleLetter.textContent = '✅ Pelo menos uma letra';
        ruleLetter.style.color = 'green';
    } else {
        ruleLetter.textContent = '❌ Pelo menos uma letra';
        ruleLetter.style.color = 'red';
    }


    if (temNumero.test(senha)) {
        ruleNumber.textContent = '✅ Pelo menos um número';
        ruleNumber.style.color = 'green';
    } else {
        ruleNumber.textContent = '❌ Pelo menos um número';
        ruleNumber.style.color = 'red';
    }

    
    if (temEspecial.test(senha)) {
        ruleSpecial.textContent = '✅ Pelo menos um caractere especial (@, #, $, etc.)';
        ruleSpecial.style.color = 'green';
    } else {
        ruleSpecial.textContent = '❌ Pelo menos um caractere especial (@, #, $, etc.)';
        ruleSpecial.style.color = 'red';
    }
}


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
    let status = "ativo";

    if (!nome || !genero || !data_de_nascimento || !idade || !senha || !confirmar_senha || !cpf || !email || !telefone || !status) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    if (senha !== confirmar_senha) {
        alert('As senhas não coincidem.');
        return;
    }

    
    const temNumero = /\d/;
    const temLetra = /[a-zA-Z]/;
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    if (senha.length < 8 || !temNumero.test(senha) || !temLetra.test(senha) || !temEspecial.test(senha)) {
        alert('A senha não atende a todos os requisitos de segurança.');
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
            alert('Cliente cadastrado com sucesso!');
            console.log('Response:', responseData);
        } else {
            const errorText = await response.text();
            console.error('Error:', response.status, errorText);
            alert('Falha ao cadastrar cliente. Verifique o console para detalhes.');
        }
    } catch (error) {
        console.error('Error during POST request:', error);
        alert('Ocorreu um erro. Por favor, tente novamente.');
    }
}
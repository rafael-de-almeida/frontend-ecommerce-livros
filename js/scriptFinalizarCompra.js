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

    // Carrega e exibe os livros do carrinho
    exibirResumoCarrinho();
};
function exibirResumoCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    const container = document.querySelector('.mini-products');
    const produtosResumo = document.getElementById('resumo-produtos');
    const freteResumo = document.getElementById('resumo-frete');
    const descontoResumo = document.getElementById('resumo-desconto');
    const totalResumo = document.getElementById('resumo-total');
    const quantidadeResumo = document.getElementById('resumo-quantidade');
    const freteLabel = document.getElementById('frete-label');
    const enderecoSelecionado = document.getElementById('endereco-selecionado');

    const enderecoValido = enderecoSelecionado && enderecoSelecionado.value?.trim() !== "";

    const fretePadrao = 2000;
    const desconto = typeof descontoCupom !== 'undefined' ? descontoCupom : 0;
    const limiteFreteGratis = 15000;

    let totalProdutos = 0;
    let totalQuantidadeLivros = 0;
    container.innerHTML = '';

    const livrosAgrupados = {};

    carrinho.forEach(livro => {
        const precoCentavos = Math.round((parseFloat(livro.LIV_VENDA) || 0) * 100);
        const quantidade = Number(livro.quantidade) || 0;

        if (!livrosAgrupados[livro.livTitulo]) {
            livrosAgrupados[livro.livTitulo] = {
                imagem: livro.livImagem,
                precoCentavos: precoCentavos,
                quantidade: quantidade
            };
        } else {
            livrosAgrupados[livro.livTitulo].quantidade += quantidade;
            if (livrosAgrupados[livro.livTitulo].precoCentavos !== precoCentavos) {
                livrosAgrupados[livro.livTitulo].precoCentavos = Math.round(
                    (livrosAgrupados[livro.livTitulo].precoCentavos + precoCentavos) / 2
                );
            }
        }
    });

    Object.entries(livrosAgrupados).forEach(([titulo, livro]) => {
        const subtotal = livro.precoCentavos * livro.quantidade;
        totalProdutos += subtotal;
        totalQuantidadeLivros += livro.quantidade;

        const col = document.createElement('div');
        col.className = 'col-md-3 mb-3 d-flex flex-column align-items-center';
        col.innerHTML = `
            <img src="${livro.imagem}" alt="${titulo}" class="img-thumbnail" style="max-width: 80px; max-height: 120px; object-fit: contain;">
            <small><strong>${titulo}</strong></small>
            <p>Quantidade: ${livro.quantidade}</p>
            <p>Preço unitário: R$${(livro.precoCentavos / 100).toFixed(2).replace('.', ',')}</p>
            <p><strong>Subtotal: R$${(subtotal / 100).toFixed(2).replace('.', ',')}</strong></p>
        `;
        container.appendChild(col);
    });

    let frete = 0;
    if (enderecoValido) {
        frete = totalProdutos > limiteFreteGratis ? 0 : fretePadrao;
    } else {
        frete = null;
    }

    produtosResumo.textContent = `Produtos: R$${(totalProdutos / 100).toFixed(2).replace('.', ',')}`;

    if (frete !== null) {
        const freteTexto = frete === 0 ? "Frete: Grátis" : `Frete: R$${(frete / 100).toFixed(2).replace('.', ',')}`;
        freteResumo.textContent = freteTexto;
        if (freteLabel) freteLabel.textContent = freteTexto;
    } else {
        const msg = "Frete: selecione um endereço";
        freteResumo.textContent = msg;
        if (freteLabel) freteLabel.textContent = msg;
    }

    descontoResumo.textContent = `Desconto(Cupom): R$${(desconto / 100).toFixed(2).replace('.', ',')}`;
    const totalFinal = Math.max((frete !== null ? totalProdutos + frete : totalProdutos) - desconto, 0);
    totalResumo.innerHTML = `<strong>Total: R$${(totalFinal / 100).toFixed(2).replace('.', ',')}</strong>`;
    

    quantidadeResumo.textContent = `Total de livros: ${totalQuantidadeLivros}`;
}

let descontoCupom = 0;
let cupomAplicado = null;

async function validarCupom() {
    const codigoCupom = document.getElementById("input-cupom").value.trim();
    const mensagem = document.getElementById("resumo-desconto");
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
  
    if (!codigoCupom) {
        mensagem.textContent = "Digite um código de cupom.";
        mensagem.classList.remove("text-success");
        mensagem.classList.add("text-danger");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/cupons/validar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                codigo: codigoCupom,
                clienteId: id  // certifique-se que isso está definido
            })
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.valido) {
            throw new Error(resultado.mensagem || "Cupom inválido.");
        }
        
        localStorage.setItem('cupomId', resultado.cupomId || null);

        let precoTotalTexto = document.getElementById("resumo-produtos").textContent.trim();
        // Extrai "184,70" e converte para número
        let precoTotal = parseFloat(precoTotalTexto.match(/[\d,.]+/)[0].replace(",", "."));
        
        let valorDesconto = 0;
        
        if (resultado.tipo === "PROMOCIONAL") {
            // valor é percentual. Ex: 10 (%) de R$184,70 = 18470 * 10 / 100
            const precoTotalEmCentavos = Math.round(parseFloat(precoTotalTexto.match(/[\d,.]+/)[0].replace(",", ".")) * 100);
            valorDesconto = Math.round((parseFloat(resultado.valor) / 100) * precoTotalEmCentavos); // em centavos
            descontoCupom = valorDesconto;
        } else if (resultado.tipo === "TROCA") {
            // valor fixo, já em reais, converter para centavos
            valorDesconto = Math.round(parseFloat(resultado.valor) * 100);
            descontoCupom = valorDesconto;
        }
        
        
        // Formatar o valor do desconto para 2 casas decimais
        
        
        cupomAplicado = {
            id: resultado.cupomId,
            tipo: resultado.tipo,
            valor: descontoCupom
        };

        mensagem.textContent = resultado.mensagem;
        mensagem.classList.remove("text-danger");
        mensagem.classList.add("text-success");

        exibirResumoCarrinho();
    } catch (error) {
        descontoCupom = 0;
        cupomAplicado = null;
        mensagem.textContent = error.message || "Erro ao validar o cupom.";
        mensagem.classList.remove("text-success");
        mensagem.classList.add("text-danger");

        exibirResumoCarrinho();
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const inputCupom = document.getElementById("input-cupom");

    inputCupom.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // evita enviar o formulário

            const codigo = inputCupom.value.trim();

            if (codigo === "") {
                // Cancelar cupom
                descontoCupom = 0;
                cupomAplicado = null;

                const mensagem = document.getElementById("resumo-desconto");
                mensagem.textContent = "Cupom removido.";
                mensagem.classList.remove("text-success");
                mensagem.classList.add("text-danger");

                exibirResumoCarrinho(); // atualiza o total sem desconto
            } else {
                validarCupom(); // se não estiver vazio, tenta validar o cupom
            }
        }
    });
});

// Cria um novo select de cartão (com botão cancelar)
function criarSelectCartao() {
    const cartoesSelecionados = new Set(
        selectsCartoes.map(obj => obj.select.value).filter(v => v !== "")
    );

    const cartoesRestantes = cartoesDisponiveis.filter(cartao => !cartoesSelecionados.has(String(cartao.carId)));

    if (cartoesRestantes.length === 0) return null;

    const cartaoGroup = document.createElement("div");
    cartaoGroup.className = "d-flex align-items-center mb-2 gap-2";

    const novoSelect = document.createElement("select");
    novoSelect.className = "form-select";
    novoSelect.ariaLabel = "Cartão Adicional";

    const valorInput = document.createElement("input");
    valorInput.type = "number";
    valorInput.className = "form-control";
    valorInput.placeholder = "Valor (R$)";
    valorInput.min = 10;

    selectsCartoes.push({ select: novoSelect, input: valorInput });

    novoSelect.addEventListener("change", () => {
        atualizarOpcoesCartoes();
    });

    const btnCancelar = document.createElement("button");
    btnCancelar.textContent = "Cancelar";
    btnCancelar.className = "btn btn-outline-danger btn-sm";
    btnCancelar.addEventListener("click", () => {
        selectsCartoes = selectsCartoes.filter(obj => obj.select !== novoSelect);
        cartaoGroup.remove();
        atualizarOpcoesCartoes();
    });

    cartaoGroup.appendChild(novoSelect);
    cartaoGroup.appendChild(valorInput);
    cartaoGroup.appendChild(btnCancelar);
    return cartaoGroup;
}

function atualizarOpcoesCartoes() {
    const valoresSelecionados = new Set(
        selectsCartoes.map(obj => obj.select.value).filter(v => v !== "")
    );

    selectsCartoes.forEach(({ select }) => {
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

function validarPagamentoCartoes() {
    const totalTexto = document.getElementById("resumo-total").textContent;
    const totalCentavos = Number(totalTexto.replace(/\D/g, ''));

    // VALIDAÇÃO DE ENDEREÇO
    const enderecoSelecionado = document.getElementById('endereco-selecionado');
    if (!enderecoSelecionado || enderecoSelecionado.value === "") {
        alert("Selecione um endereço antes de finalizar a compra.");
        return false;
    }

    let soma = 0;
    for (const { select, input } of selectsCartoes) {
        if (select.value === "") {
            alert("Todos os cartões devem ser selecionados.");
            return false;
        }

        const valorReais = parseFloat(input.value.replace(",", "."));
        if (isNaN(valorReais)) {
            alert("Preencha todos os valores dos cartões.");
            return false;
        }

        const valorCentavos = Math.round(valorReais * 100);
       // if (valorCentavos < 1000) {
       //     alert("Cada cartão deve pagar pelo menos R$10,00.");
       //     return false;
        //}

        soma += valorCentavos;
    }

    if (soma !== totalCentavos) {
        alert(`A soma dos valores dos cartões deve ser exatamente R$${(totalCentavos / 100).toFixed(2).replace('.', ',')}.\nValor atual: R$${(soma / 100).toFixed(2).replace('.', ',')}`);
        return false;
    }

    return true;
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
    select.innerHTML = '<option value="">Selecione um endereço</option>';

    data.enderecos.forEach(endereco => {
        const option = document.createElement("option");
        option.value = endereco.endId;
        option.textContent = `${endereco.END_RUA}, ${endereco.END_NUMERO} - ${endereco.END_BAIRRO}, ${endereco.END_CIDADE} - ${endereco.END_ESTADO}`;
        select.appendChild(option);
    });

    // Quando o usuário mudar o endereço, recalcula o resumo do carrinho com o novo frete
    select.addEventListener("change", () => {
        exibirResumoCarrinho(); // Recalcula tudo, inclusive frete com base no endereço
    });
}


function atualizarTotalComFrete(frete) {
    const produtosResumo = document.getElementById("resumo-produtos");
    const descontoResumo = document.getElementById("resumo-desconto");
    const totalResumo = document.getElementById("resumo-total");

    const totalProdutos = Number(produtosResumo.textContent.replace(/\D/g, '')) || 0;
    const desconto = Number(descontoResumo.textContent.replace(/\D/g, '')) || 0;

    const totalFinal = totalProdutos + frete - desconto;

    totalResumo.innerHTML = `<strong>Total: R$${(totalFinal / 100).toFixed(2).replace('.', ',')}</strong>`;
}


function atualizarCartoes(data) {
    cartoesDisponiveis = data.cartoes;

    const container = document.getElementById("cartoes-container");
    container.innerHTML = ""; // Limpa tudo antes de recriar

    selectsCartoes = []; // Reinicia a lista de selects

    // Cria o primeiro select (cartao1) com input e botão cancelar desabilitado
    const cartaoGroup = document.createElement("div");
    cartaoGroup.className = "d-flex align-items-center mb-2 gap-2";

    const selectPrincipal = document.createElement("select");
    selectPrincipal.className = "form-select";
    selectPrincipal.ariaLabel = "Cartão Principal";

    const valorInput = document.createElement("input");
    valorInput.type = "number";
    valorInput.className = "form-control";
    valorInput.placeholder = "Valor (R$)";
    valorInput.min = 10;

    selectsCartoes.push({ select: selectPrincipal, input: valorInput });

    selectPrincipal.addEventListener("change", () => {
        atualizarOpcoesCartoes();
    });

    // botão cancelar desabilitado para o primeiro
    const btnFake = document.createElement("button");
    btnFake.textContent = "Principal";
    btnFake.className = "btn btn-outline-secondary btn-sm";
    btnFake.disabled = true;

    cartaoGroup.appendChild(selectPrincipal);
    cartaoGroup.appendChild(valorInput);
    cartaoGroup.appendChild(btnFake);
    container.appendChild(cartaoGroup);

    // Agora atualiza opções normalmente
    atualizarOpcoesCartoes();
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
async function finalizarCompra() {
    if (!validarPagamentoCartoes()) return;

    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const enderecoSelecionado = parseInt(document.getElementById("endereco-selecionado").value);
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = parseInt(urlParams.get('id'));

    const totalTexto = document.getElementById("resumo-total").textContent;
    const precoTotalCentavos = Number(totalTexto.replace(/\D/g, ''));
    const precoTotal = parseFloat((precoTotalCentavos / 100).toFixed(2));

    const livros = carrinho.map(livro => ({
        livroId: livro.livId,
        quantidade: livro.quantidade,
        preco: parseFloat(parseFloat(livro.LIV_VENDA).toFixed(2))
    }));

    const pagamentos = selectsCartoes.map(({ select }) => ({
        cartaoId: parseInt(select.value),
        status: "EM PROCESSAMENTO"
    }));

    const dataAtual = new Date().toISOString().split("T")[0];

    const body = {
        precoTotal: precoTotal,
        status: "EM PROCESSAMENTO",
        data: dataAtual,
        clienteId: clienteId,
        enderecoId: enderecoSelecionado,
        livros: livros,
        pagamentos: pagamentos
    };

    try {
        const response = await fetch("http://localhost:8080/site/clientes/pedido/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Erro ao finalizar compra");

        await response.text(); // você não usa `result.mensagem`, então pode até remover isso

        const cupomId = localStorage.getItem("cupomId");

        if (cupomId) {
            const cupomResponse = await fetch("http://localhost:8080/api/cupons/finalizar-compra", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cupomId: cupomId })
            });

            if (!cupomResponse.ok) throw new Error("Erro ao finalizar uso do cupom");

            localStorage.removeItem("cupomId");
        }

        localStorage.removeItem("carrinho");
        mostrarModalSucesso("Compra finalizada com sucesso!");

    } catch (error) {
        console.error("Erro ao finalizar compra:", error);
        alert("Houve um problema ao finalizar a compra. Tente novamente.");
        localStorage.removeItem("cupomId"); // mesmo se der erro, limpa
    }
}

function mostrarModalSucesso(mensagem) {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
  
    fetch(`http://localhost:8080/site/clientes/pedido/get/${id}`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Descobrir o maior id
          const maiorId = Math.max(...data.map(item => item.id));
  
          // Filtrar todos os pedidos com o maior id
          const pedidosComMaiorId = data.filter(item => item.id === maiorId);
  
          // Montar a mensagem do recibo
          let recibo = `Pedido Nº ${maiorId}\n`;
          recibo += `Data: ${pedidosComMaiorId[0].data}\n`;
          recibo += `Status: ${pedidosComMaiorId[0].status}\n`;
          recibo += `\nItens:\n`;
          pedidosComMaiorId.forEach(item => {
            recibo += `- ${item.titulo} (Qtd: ${item.quantidade}) - R$ ${item.preco.toFixed(2)}\n`;
          });
  
          recibo += `\nTotal: R$ ${pedidosComMaiorId[0].precoTotal.toFixed(2)}`;
          recibo += `\n\nVeja o status da sua compra pelo historico de compras!`;
          alert(mensagem);
          alert(recibo);
        } else {
          alert("Nenhum pedido encontrado.");
        }
      })
      
      .catch(error => {
        console.error(error);
        alert("Erro ao buscar o pedido.");
      });
  }

  function passarIdHistoricoCompras() {
    window.location.href = `historicoCompras.html?id=2`;
}

function passarIdTelaInicial() {
    window.location.href = `telaInicial.html?id=2`;
}

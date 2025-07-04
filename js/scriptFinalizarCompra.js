let cartoesDisponiveis = []; 
let selectsCartoes = [];


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

    exibirResumoCarrinho();
};
function exibirResumoCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const cuponsAplicados = JSON.parse(localStorage.getItem('cuponsAplicados')) || [];

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

    let frete = enderecoValido ? (totalProdutos > limiteFreteGratis ? 0 : fretePadrao) : null;

    let desconto = cuponsAplicados.reduce((total, cupom) => total + (cupom.valor || 0), 0);

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

    if (cuponsAplicados.length > 0) {
        let html = `<strong>Descontos aplicados:</strong><br>`;
        cuponsAplicados.forEach((cupom, index) => {
            let valorReais = (cupom.valor / 100).toFixed(2).replace('.', ',');
            html += `
        <div style="margin-bottom: 16px;">
            <div><strong>Cupom ${cupom.codigo}</strong> (${cupom.tipo}): -R$${valorReais}</div>
            <button class="btn btn-sm btn-danger mt-1" onclick="removerCupom(${index})">Remover</button>
        </div>
            `;
        });
        html += `<br><strong>Total desconto: R$${(desconto / 100).toFixed(2).replace('.', ',')}</strong>`;
        descontoResumo.innerHTML = html;
    } else {
        descontoResumo.textContent = "Desconto(Cupom): R$0,00";
    }

    const totalFinal = Math.max((frete !== null ? totalProdutos + frete : totalProdutos) - desconto, 0);
    totalResumo.innerHTML = `<strong>Total: R$${(totalFinal / 100).toFixed(2).replace('.', ',')}</strong>`;
    quantidadeResumo.textContent = `Total de livros: ${totalQuantidadeLivros}`;
}

function removerCupom(index) {
    const cupons = JSON.parse(localStorage.getItem('cuponsAplicados')) || [];
    cupons.splice(index, 1);
    localStorage.setItem('cuponsAplicados', JSON.stringify(cupons));
    exibirResumoCarrinho();
}
let cuponsAplicados = [];
let descontoCupom = 0;

async function validarCupom() {
    const codigoCupom = document.getElementById("input-cupom").value.trim();
    const mensagem = document.getElementById("resumo-desconto");
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id')); 

    if (!codigoCupom) {
        mensagem.textContent = "Digite um código de cupom.";
        mensagem.classList.remove("text-success");
        mensagem.classList.add("text-danger");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/cupons/validar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo: codigoCupom, clienteId: id })
        });

        const resultado = await response.json();
        if (!response.ok || !resultado.valido) {
            throw new Error(resultado.mensagem || "Cupom inválido.");
        }

        const precoTotalTexto = document.getElementById("resumo-produtos").textContent.trim();
        const precoTotal = Math.round(parseFloat(precoTotalTexto.match(/[\d,.]+/)[0].replace(",", ".")) * 100);

        let cuponsAplicados = JSON.parse(localStorage.getItem('cuponsAplicados')) || [];
        const valorTotalAntes = cuponsAplicados.reduce((soma, cupom) => soma + cupom.valor, 0);

        if (valorTotalAntes >= precoTotal) {
            const erroMsg = "O valor da compra já foi coberto. Não é possível adicionar mais cupons.";
            alert(erroMsg);
            mensagem.textContent = erroMsg;
            mensagem.classList.remove("text-success");
            mensagem.classList.add("text-danger");
            return;
        }
        
        if (cuponsAplicados.some(c => c.codigo === codigoCupom)) {
            mensagem.textContent = `O cupom "${codigoCupom}" já foi aplicado.`;
            mensagem.classList.remove("text-success");
            mensagem.classList.add("text-danger");
            return;
        }

        if (resultado.tipo === "PROMOCIONAL" && cuponsAplicados.some(c => c.tipo === "PROMOCIONAL")) {
            mensagem.textContent = "Você só pode aplicar um cupom promocional por compra.";
            mensagem.classList.remove("text-success");
            mensagem.classList.add("text-danger");
            return;
        }

        let novoValorCupom = 0;
        if (resultado.tipo === "PROMOCIONAL") {
           
            novoValorCupom = Math.round((parseFloat(resultado.valor) / 100) * precoTotal);
        } else if (resultado.tipo === "TROCA") {
            
            novoValorCupom = Math.round(parseFloat(resultado.valor) * 100);
        }

     
        cuponsAplicados.push({
            id: resultado.cupomId,
            tipo: resultado.tipo,
            valor: novoValorCupom,
            codigo: codigoCupom
        });
        localStorage.setItem('cuponsAplicados', JSON.stringify(cuponsAplicados));
        
     
        const valorTotalDepois = valorTotalAntes + novoValorCupom;

        if (valorTotalAntes < precoTotal && valorTotalDepois > precoTotal) {
            const valorTrocoEmCentavos = valorTotalDepois - precoTotal;
            
     
            await gerarCupomDeTroco(id, valorTrocoEmCentavos);
        }

        mensagem.textContent = "Cupom aplicado com sucesso!";
        mensagem.classList.remove("text-danger");
        mensagem.classList.add("text-success");

        exibirResumoCarrinho();

    } catch (error) {
        mensagem.textContent = error.message || "Erro ao validar o cupom.";
        mensagem.classList.remove("text-success");
        mensagem.classList.add("text-danger");
        exibirResumoCarrinho();
    }
}
/**
 * 
 * @param {number} clienteId 
 * @param {number} valorTrocoEmCentavos 
 */
async function gerarCupomDeTroco(clienteId, valorTrocoEmCentavos) {
    
    const valorEmReais = valorTrocoEmCentavos / 100;

    try {
        const response = await fetch("http://localhost:8080/api/cupons/gerar-troco", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clienteId: clienteId,
                valor: valorEmReais
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || "Falha ao gerar o cupom de troco.");
        }

        const novoCupom = await response.json();
        const valorFormatado = novoCupom.valor.toFixed(2).replace('.', ',');
        
        // Informa o usuário sobre o novo cupom gerado.
        alert(
            `O valor do seu cupom excedeu o total da compra.\n\n` +
            `Um novo cupom de troca foi gerado para sua conta:\n` +
            `Código: ${novoCupom.codigo}\n` +
            `Valor: R$ ${valorFormatado}`
        );

    } catch (error) {
        console.error("Erro ao gerar cupom de troco:", error);
        alert("Houve um problema ao gerar seu cupom de troco. Por favor, entre em contato com o suporte.");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const inputCupom = document.getElementById("input-cupom");

    inputCupom.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();

            const codigo = inputCupom.value.trim();

            if (codigo === "") {
                const mensagem = document.getElementById("resumo-desconto");
                mensagem.textContent = "Digite um código de cupom.";
                mensagem.classList.remove("text-success", "text-danger");
                exibirResumoCarrinho();
            } else {
                validarCupom();
            }
        }
    });
});

let id = 2;
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
    novoSelect.id = "cartao" + id++;
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


    if (totalCentavos === 0) {
        return true; 
    }

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
        if (isNaN(valorReais) || valorReais <= 0) { 
            alert("Preencha todos os valores dos cartões com um número positivo.");
            return false;
        }

        const valorCentavos = Math.round(valorReais * 100);
        soma += valorCentavos;
    }

    if (soma !== totalCentavos) {
        alert(`A soma dos valores dos cartões deve ser exatamente R$${(totalCentavos / 100).toFixed(2).replace('.', ',')}.\nValor atual: R$${(soma / 100).toFixed(2).replace('.', ',')}`);
        return false;
    }

    return true;
}
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
    select.addEventListener("change", () => {
        exibirResumoCarrinho();
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
    container.innerHTML = "";

    selectsCartoes = []; 

    const cartaoGroup = document.createElement("div");
    cartaoGroup.className = "d-flex align-items-center mb-2 gap-2";

    const selectPrincipal = document.createElement("select");
    selectPrincipal.className = "form-select";
    selectPrincipal.ariaLabel = "Cartão Principal";
    selectPrincipal.id = "cartao1";
    const valorInput = document.createElement("input");
    valorInput.type = "number";
    valorInput.className = "form-control";
    valorInput.placeholder = "Valor (R$)";
    valorInput.min = 10;

    selectsCartoes.push({ select: selectPrincipal, input: valorInput });

    selectPrincipal.addEventListener("change", () => {
        atualizarOpcoesCartoes();
    });

    const btnFake = document.createElement("button");
    btnFake.textContent = "Principal";
    btnFake.className = "btn btn-outline-secondary btn-sm";
    btnFake.disabled = true;

    cartaoGroup.appendChild(selectPrincipal);
    cartaoGroup.appendChild(valorInput);
    cartaoGroup.appendChild(btnFake);
    container.appendChild(cartaoGroup);
    atualizarOpcoesCartoes();
}

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

    
    let pagamentos = []; 
    let statusPedido = "PAGAMENTO APROVADO"; 

    if (precoTotalCentavos > 0) {
        statusPedido = "EM PROCESSAMENTO"; 
        pagamentos = selectsCartoes.map(({ select, input }) => ({
            cartaoId: parseInt(select.value),
            status: "EM PROCESSAMENTO",
            valor: parseFloat(input.value)
        }));
    }
    
    const dataAtual = new Date().toISOString().split("T")[0];

    const body = {
        precoTotal: precoTotal,
        status: statusPedido, 
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

        await response.text(); 

        const cuponsAplicados = JSON.parse(localStorage.getItem("cuponsAplicados")) || [];
        const cuponsIds = cuponsAplicados.map(cupom => cupom.id).filter(id => id !== undefined);

        if (cuponsIds.length > 0) {
            const cupomResponse = await fetch("http://localhost:8080/api/cupons/finalizar-compra", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuponsIds: cuponsIds })
            });

            if (!cupomResponse.ok) throw new Error("Erro ao finalizar uso dos cupons");
        }

        localStorage.removeItem("carrinho");
        localStorage.removeItem("cuponsAplicados");
        mostrarModalSucesso("Compra finalizada com sucesso!");

    } catch (error) {
        console.error("Erro ao finalizar compra:", error);
        alert("Houve um problema ao finalizar a compra. Tente novamente.");
        localStorage.removeItem("cuponsAplicados");
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
          const maiorId = Math.max(...data.map(item => item.ordemId));
          const pedidosComMaiorId = data.filter(item => item.ordemId === maiorId);
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

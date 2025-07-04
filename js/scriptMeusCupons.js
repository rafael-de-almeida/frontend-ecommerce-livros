
const urlParams = new URLSearchParams(window.location.search);
const clienteId = urlParams.get('id');


document.addEventListener("DOMContentLoaded", () => {
  
  const container = document.getElementById("cupons-container");

  
  if (!clienteId) {
    container.innerHTML = '<h2 class="mb-4">Meus Cupons de Troca</h2><div class="alert alert-danger">ID do cliente não encontrado. Por favor, faça login novamente.</div>';
    return;
  }

  
  fetch(`http://localhost:8080/api/cupons/cliente/${clienteId}/troca`)
    .then(response => {
      if (!response.ok) {
      
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      return response.json();
    })
    .then(cupons => {
      console.log("Cupons recebidos:", cupons);

      if (cupons.length === 0) {
        container.innerHTML += '<div class="alert alert-info">Você não possui cupons de troca ativos no momento.</div>';
        return;
      }

      cupons.forEach(cupom => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3", "coupon-card"); 

        
        const dataValidade = cupom.validade ? new Date(cupom.validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem data de validade';

       
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${cupom.descricao}</h5>
            <p class="card-text">
              Use o código abaixo para fazer uma compra:
            </p>
            <div class="d-flex align-items-center">
              <span class="coupon-code">${cupom.codigo}</span>
              <button class="btn btn-outline-primary ms-3" onclick="copiarCodigo('${cupom.codigo}', this)">
                Copiar Código
              </button>
            </div>
            <p class="card-text mt-3">
              <small class="text-muted">Válido até: ${dataValidade}</small>
            </p>
          </div>
        `;

      
        container.appendChild(card);
      });
    })
    .catch(error => {
    
      console.error("Erro ao carregar cupons:", error);
      container.innerHTML += `<div class="alert alert-danger">Não foi possível carregar seus cupons. Tente novamente mais tarde.</div>`;
    });
});

function copiarCodigo(codigo, botao) {
  navigator.clipboard.writeText(codigo).then(() => {
 
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = 'Copiado!';
    botao.classList.remove('btn-outline-primary');
    botao.classList.add('btn-success');

   
    setTimeout(() => {
      botao.innerHTML = textoOriginal;
      botao.classList.remove('btn-success');
      botao.classList.add('btn-outline-primary');
    }, 2000);
  }).catch(err => {
    console.error('Erro ao copiar código: ', err);
    alert('Não foi possível copiar o código.');
  });
}


function passarIdCartao() {
  window.location.href = `cartoes.html?id=${clienteId}`;
}
function passarIdHistoricoCompras() {
  window.location.href = `historicoCompras.html?id=${clienteId}`;
}
function passarIdEndereco() {
  window.location.href = `enderecos.html?id=${clienteId}`;
}
function passarIdTelaInicial() {
  window.location.href = `telaInicial.html?id=${clienteId}`;
}

function passarIdMeusCupons() {
    window.location.href = `meusCupons.html?id=${clienteId}`;
}
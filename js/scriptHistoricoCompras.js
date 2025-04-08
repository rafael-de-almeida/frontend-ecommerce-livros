document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
  
    // Simula o ID do cliente (pode vir do localStorage, sessão, ou backend)
    const clienteId = 1;
  
    fetch(`http://localhost:8080/site/clientes/pedido/get/${clienteId}`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar pedidos.");
        return response.json();
      })
      .then(pedidos => {
        if (!Array.isArray(pedidos)) {
          throw new Error("Resposta inválida do servidor");
        }
  
        pedidos.forEach(pedido => {
          const card = document.createElement("div");
          card.classList.add("card", "mb-3");
  
          const livrosHtml = pedido.livros && pedido.livros.length > 0
            ? pedido.livros.map(livro =>
                `<li>Livro: ${livro.titulo} - R$ ${livro.preco.toFixed(2)} (Qtd: ${livro.quantidade})</li>`
              ).join("")
            : "<li><em>Sem livros neste pedido</em></li>";
  
          const statusFormatado = pedido.status.charAt(0) + pedido.status.slice(1).toLowerCase();
          const badgeClass = statusCor(pedido.status);
  
          // Só exibe o botão de troca se o status for ENTREGUE
          const botaoTroca = pedido.status === "ENTREGUE"
            ? `<button class="btn btn-danger mt-2" onclick="pedirDevolucao(${pedido.ordemId})">Pedir Troca</button>`
            : "";
  
          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">Pedido #${pedido.ordemId}</h5>
              <p class="card-text">Data: ${pedido.data}</p>
              <p class="card-text">Valor Total: R$ ${pedido.valorTotal.toFixed(2)}</p>
              <span class="badge ${badgeClass}">${statusFormatado}</span>
              <ul class="mt-3">
                ${livrosHtml}
              </ul>
              ${botaoTroca}
            </div>
          `;
  
          container.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Erro ao carregar pedidos:", error);
        container.innerHTML += `<p class="text-danger">Não foi possível carregar o histórico de pedidos.</p>`;
      });
  });
  
  // Define a cor da badge de status
  function statusCor(status) {
    switch (status) {
      case "ENTREGUE":
        return "bg-success";
      case "EM TROCA":
        return "bg-danger";
      case "TROCA AUTORIZADA":
        return "bg-primary";
      case "EM TRANSITO":
        return "bg-info";
      case "EM PROCESSAMENTO":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  }
  
  // Função de troca (exemplo)
  function pedirDevolucao(pedidoId) {
    alert(`Solicitação de troca para o pedido #${pedidoId} enviada.`);
  }
  
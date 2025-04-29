const urlParams = new URLSearchParams(window.location.search);
let clienteId = urlParams.get('id'); // pega o id da URL

 document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");

  
  fetch(`http://localhost:8080/site/clientes/pedido/get/${clienteId}`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar pedidos.");
      return response.json();
    })
    .then(livros => {
      if (!Array.isArray(livros)) {
        throw new Error("Resposta inválida do servidor");
      }

      // 1. Agrupa livros pelo ID do pedido
      const pedidosMap = new Map();

      livros.forEach(livro => {
        if (!pedidosMap.has(livro.id)) {
          pedidosMap.set(livro.id, {
            id: livro.id,
            data: livro.data,
            status: livro.status,
            precoTotal: livro.precoTotal,
            livros: []
          });
        }
        pedidosMap.get(livro.id).livros.push(livro);
      });

      // 2. Cria cards para cada pedido agrupado
      pedidosMap.forEach(pedido => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3");

        const livrosHtml = pedido.livros.map(livro =>
          `<li>Livro: ${livro.titulo} - R$ ${livro.preco.toFixed(2)} (Qtd: ${livro.quantidade})</li>`
        ).join("");

        const statusFormatado = pedido.status.charAt(0) + pedido.status.slice(1).toLowerCase();
        const badgeClass = statusCor(pedido.status);

        const botaoTroca = pedido.status === "ENTREGUE"
          ? `<button class="btn btn-danger mt-2" onclick="pedirDevolucao(${pedido.id})">Pedir Troca</button>`
          : "";

        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Pedido #${pedido.id}</h5>
            <p class="card-text">Data: ${pedido.data}</p>
            <p class="card-text">Valor Total: R$ ${pedido.precoTotal.toFixed(2)}</p>
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

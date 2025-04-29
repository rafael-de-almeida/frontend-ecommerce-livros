async function buscarOrdens() {
  const nome = document.getElementById("nome").value;
  const status = document.getElementById("status").value;
  const dataInicio = document.getElementById("startDate").value;
  const dataFim = document.getElementById("endDate").value;
  const tituloLivro = document.getElementById("produtos")?.value; // Se o campo existir
  const valor = parseFloat(document.getElementById("valor").value); // Pega o valor do campo de input "valor"
  const numero_pedido = document.getElementById("numero-pedido").value;

  let url = "http://localhost:8080/site/ordens/resumo";
  const params = []; // ← DECLARAR ANTES DE USAR!

  if (nome) params.push(`nomeCliente=${encodeURIComponent(nome)}`);
  if (tituloLivro) params.push(`tituloLivro=${encodeURIComponent(tituloLivro)}`);
  if (status) params.push(`status=${encodeURIComponent(status)}`);
  if (dataInicio) params.push(`dataInicio=${encodeURIComponent(dataInicio)}`);
  if (dataFim) params.push(`dataFim=${encodeURIComponent(dataFim)}`);
  if (!isNaN(valor)) params.push(`valorTotal=${valor}`); // Adiciona o valor se preenchido
  if (numero_pedido) params.push(`numeroPedido=${encodeURIComponent(numero_pedido)}`);
  if (params.length > 0) url += "?" + params.join("&");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar ordens");

    const ordens = await response.json();
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    ordens.forEach(ordem => {
      const tr = document.createElement("tr");

      const statusBadge = gerarBadgeStatus(ordem.status);

      const statusOptions = `
        <select class="form-select form-select-sm status-select" data-id="${ordem.numeroPedido}">
          <option value="EM PROCESSAMENTO" ${ordem.status === "EM PROCESSAMENTO" ? "selected" : ""}>EM PROCESSAMENTO</option>
          <option value="EM TRANSITO" ${ordem.status === "EM TRANSITO" ? "selected" : ""}>EM TRANSITO</option>
          <option value="ENTREGUE" ${ordem.status === "ENTREGUE" ? "selected" : ""}>ENTREGUE</option>
          <option value="EM TROCA" ${ordem.status === "EM TROCA" ? "selected" : ""}>EM TROCA</option>
          <option value="TROCA AUTORIZADA" ${ordem.status === "TROCA AUTORIZADA" ? "selected" : ""}>TROCA AUTORIZADA</option>
        </select>
      `;

      tr.innerHTML = `
        <td>${ordem.nomeCliente}</td>
        <td>${ordem.livros.join(", ")}</td>
        <td>R$ ${(ordem.valorTotal ?? 0).toFixed(2).replace(".", ",")}</td>
        <td>${ordem.data}</td>
        <td>${ordem.numeroPedido}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="d-flex gap-2">
            ${statusOptions}
            <button class="btn btn-success btn-sm salvar-status" data-id="${ordem.numeroPedido}">Salvar</button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Eventos dos botões "Salvar"
    document.querySelectorAll(".salvar-status").forEach(botao => {
      botao.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const select = document.querySelector(`.status-select[data-id="${id}"]`);
        const novoStatus = select.value;

        try {
          const resp = await fetch(`http://localhost:8080/site/ordens/${id}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: novoStatus })
          });

          if (!resp.ok) throw new Error("Erro ao alterar status");

          alert("Status alterado com sucesso!");
          buscarOrdens();
        } catch (err) {
          console.error(err);
          alert("Erro ao salvar status.");
        }
      });
    });

  } catch (error) {
    console.error(error);
    alert("Erro ao carregar as vendas.");
  }
}

document.getElementById("form-cliente").addEventListener("submit", function (e) {
  e.preventDefault();
  buscarOrdens();
});

window.addEventListener("DOMContentLoaded", buscarOrdens);


function gerarBadgeStatus(status) {
  const statusLower = status.toLowerCase();
  if (statusLower === "entregue" || statusLower === "pago") {
    return `<span class="badge bg-success">${status}</span>`;
  } else if (statusLower === "pendente" || statusLower === "em processamento") {
    return `<span class="badge bg-warning">${status}</span>`;
  } else if (statusLower === "cancelado") {
    return `<span class="badge bg-danger">${status}</span>`;
  } else {
    return `<span class="badge bg-secondary">${status}</span>`;
  }
}

document.getElementById("form-cliente").addEventListener("submit", function (e) {
  e.preventDefault();
  buscarOrdens();
});

window.addEventListener("DOMContentLoaded", buscarOrdens);

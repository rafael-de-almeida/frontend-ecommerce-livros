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
      
      // Usando a função para gerar o badge conforme o status atual
      const statusBadge = gerarBadgeStatus(ordem.status);

      // Criando as opções do select com os badges correspondentes
      const statusOptions = `
        <select class="form-select form-select-sm status-select" data-id="${ordem.numeroPedido}">
          <option value="EM PROCESSAMENTO" ${ordem.status === "EM PROCESSAMENTO" ? "selected" : ""}>
            EM PROCESSAMENTO
          </option>
          <option value="EM TRANSITO" ${ordem.status === "EM TRANSITO" ? "selected" : ""}>
            EM TRANSITO
          </option>
          <option value="ENTREGUE" ${ordem.status === "ENTREGUE" ? "selected" : ""}>
            ENTREGUE
          </option>
          <option value="EM TROCA" ${ordem.status === "EM TROCA" ? "selected" : ""}>
            EM TROCA
          </option>
          <option value="TROCA SOLICITADA" ${ordem.status === "TROCA SOLICITADA" ? "selected" : ""}>
            TROCA SOLICITADA
          </option>
          <option value="TROCA AUTORIZADA" ${ordem.status === "TROCA AUTORIZADA" ? "selected" : ""}>
            TROCA AUTORIZADA
          </option>
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

    // Aplicando os badges aos options após renderizar a tabela
    aplicarBadgesAosSelects();

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

// Função para aplicar os badges aos options do select usando select2
function aplicarBadgesAosSelects() {
  document.querySelectorAll('.status-select').forEach(select => {
    // Aplicar classes específicas para cada opção
    const options = select.querySelectorAll('option');
    options.forEach(option => {
      // Adicionar atributo de dados para identificar o tipo de status
      option.setAttribute('data-status', option.value);
      
      // Verificar se a biblioteca select2 está disponível (código opcional para melhorar a aparência)
      if (typeof $ !== 'undefined' && $.fn.select2) {
        $(select).select2({
          templateResult: formatStateResult,
          templateSelection: formatStateSelection
        });
      } else {
        // Alternativa caso não tenha select2 - aplicar estilos diretamente
        option.style.backgroundColor = getBadgeColorForStatus(option.value);
        option.style.color = 'white';
        option.style.padding = '2px 5px';
        option.style.borderRadius = '3px';
      }
    });
  });
}

// Função para formatar a exibição dos itens no dropdown do select2
function formatStateResult(state) {
  if (!state.id) return state.text;
  
  const status = state.element.value;
  const $badge = $(`<span class="badge ${getBadgeClassForStatus(status)}">${state.text}</span>`);
  return $badge;
}

// Função para formatar a seleção no select2
function formatStateSelection(state) {
  if (!state.id) return state.text;
  
  const status = state.element.value;
  return $(`<span class="badge ${getBadgeClassForStatus(status)}">${state.text}</span>`);
}

// Função para obter a classe do badge baseado no status
function getBadgeClassForStatus(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "entregue") {
    return "bg-success";
  } else if (statusLower === "em processamento") {
    return "bg-warning";
  } else if (statusLower === "em transito") {
    return "bg-info";
  } else if (statusLower === "em troca") {
    return "bg-danger";
  } else if (statusLower === "troca solicitada") {
    return "bg-secondary";
  } else if (statusLower === "troca autorizada") {
    return "bg-primary";
  } else {
    return "bg-dark";
  }
}

// Função para obter a cor do badge baseado no status (para uso sem select2)
function getBadgeColorForStatus(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "entregue") {
    return "#198754"; // verde
  } else if (statusLower === "em processamento") {
    return "#ffc107"; // amarelo
  } else if (statusLower === "em transito") {
    return "#0dcaf0"; // azul claro
  } else if (statusLower === "em troca") {
    return "#dc3545"; // vermelho
  } else if (statusLower === "troca solicitada") {
    return "#6c757d"; // cinza
  } else if (statusLower === "troca autorizada") {
    return "#0d6efd"; // azul
  } else {
    return "#212529"; // preto
  }
}

// Função para gerar o badge HTML baseado no status atual
function gerarBadgeStatus(status) {
  return `<span class="badge ${getBadgeClassForStatus(status)}">${status}</span>`;
}

document.getElementById("form-cliente").addEventListener("submit", function (e) {
  e.preventDefault();
  buscarOrdens();
});

window.addEventListener("DOMContentLoaded", () => {
  buscarOrdens();
  
  // Adicionar listeners para mudança de select que atualizem visualmente o badge
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('status-select')) {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const statusCell = e.target.closest('tr').querySelector('td:nth-child(6)');
      if (statusCell) {
        statusCell.innerHTML = gerarBadgeStatus(selectedOption.value);
      }
    }
  });
});
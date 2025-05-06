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
          ? `<button class="btn btn-danger mt-2" onclick="pedirDevolucao(${clienteId}, ${pedido.id})">Pedir Troca</button>`
          : "";
        
          if (pedido.status === "TROCA AUTORIZADA") {
            pegarcodigocupom(pedido.id).then(codigoCupom => {
              card.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title">Pedido #${pedido.id}</h5>
                  <p class="card-text">Data: ${pedido.data}</p>
                  <p class="card-text">Valor Total: R$ ${pedido.precoTotal.toFixed(2)}</p>
                  <p class="card-text">Código do cupom: ${codigoCupom}</p>
                  <span class="badge ${badgeClass}">${statusFormatado}</span>
                  <ul class="mt-3">
                    ${livrosHtml}
                  </ul>
                  ${botaoTroca}
                </div>
              `;
              container.appendChild(card);
            }).catch(error => {
              console.error("Erro ao buscar código do cupom:", error);
            });  
          }
          else{
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
        }
      });
    })
    .catch(error => {
      console.error("Erro ao carregar pedidos:", error);
      container.innerHTML += `<p class="text-danger">Não foi possível carregar o histórico de pedidos.</p>`;
    });
});
function pegarcodigocupom(pedidoId) {
return fetch(`http://localhost:8080/api/cupons/buscar-por-origem-troca/${pedidoId}`)
.then(response => {
  if (!response.ok) throw new Error("Erro ao buscar cupom.");
  return response.json();
})
.then(data => {
  const codigo = data.codigo;
  console.log(codigo);
  return codigo;
});
  
}
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

function pedirDevolucao(clienteId, pedidoId) {
  const modalTroca = document.getElementById('modalTroca');
  const modalCorpoTroca = document.getElementById('modalCorpoTroca');
  const modalTituloTroca = document.getElementById('modalTituloTroca');
  
  modalTituloTroca.textContent = `Solicitar Troca - Pedido #${pedidoId}`;
  modalCorpoTroca.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
  
  const modal = new bootstrap.Modal(modalTroca);
  modal.show();

  fetch(`http://localhost:8080/site/ordens-livros/${pedidoId}`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar livros do pedido.");
      return response.json();
    })
    .then(livros => {
      console.log("Livros recebidos:", livros);

      if (!Array.isArray(livros) || livros.length === 0) {
        modalCorpoTroca.innerHTML = '<div class="alert alert-warning">Este pedido não possui livros disponíveis para troca.</div>';
        return;
      }

      // Ordenar livros por título (livroTitulo)
      livros.sort((a, b) => a.livroTitulo.localeCompare(b.livroTitulo));

      // Preencher o corpo do modal com os livros
      modalCorpoTroca.innerHTML = livros.map((livro, index) => `
        <div class="form-check mb-2">
          <input class="form-check-input me-2" type="checkbox" id="livroCheck${index}" 
                 data-livro-id="${livro.livroId}" data-max="${livro.quantidade}">
          <label class="form-check-label" for="livroCheck${index}">
            ${livro.livroTitulo} - R$ ${livro.preco.toFixed(2)} (Qtd disponível: ${livro.quantidade})
          </label>
          <input type="number" class="form-control mt-1 ms-4 w-25" id="qtdLivro${index}" 
                 value="1" min="1" max="${livro.quantidade}" disabled>
        </div>
      `).join("");

      // Ativar/desativar campos de quantidade conforme checkbox
      setTimeout(() => {
        livros.forEach((_, index) => {
          const cb = document.getElementById(`livroCheck${index}`);
          const inputQtd = document.getElementById(`qtdLivro${index}`);
          if (cb && inputQtd) {
            cb.addEventListener("change", () => {
              inputQtd.disabled = !cb.checked;
              if (cb.checked) {
                inputQtd.focus();
              } else {
                inputQtd.value = "1";
              }
            });
          }
        });
      }, 0);

      // Preparar o envio
      const formTroca = document.getElementById("formTroca");
      const clonedForm = formTroca.cloneNode(true);
      formTroca.parentNode.replaceChild(clonedForm, formTroca);

      clonedForm.addEventListener("submit", function (e) {
        e.preventDefault();
        try {
          const livrosSelecionados = livros.map((livro, index) => {
            const cb = document.getElementById(`livroCheck${index}`);
            if (cb && cb.checked) {
              const livroId = parseInt(cb.dataset.livroId);
              const qtd = parseInt(document.getElementById(`qtdLivro${index}`).value);
              const qtdMax = parseInt(cb.dataset.max);
              if (qtd < 1 || qtd > qtdMax) throw new Error(`Quantidade inválida para o livro ID ${livroId}`);
              return {
                livroId: livroId,
                quantidade: qtd
              };
            }
            return null;
          }).filter(item => item !== null);

          if (livrosSelecionados.length === 0) {
            alert("Selecione ao menos um livro para troca.");
            return;
          }

          const trocaDTO = {
            ordemOriginalId: pedidoId,
            livrosParaTroca: livrosSelecionados
          };

          fetch(`http://localhost:8080/site/clientes/pedido/troca`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trocaDTO)
          })
            .then(res => {
              if (!res.ok) throw new Error("Erro ao enviar solicitação de troca.");
              return res.text();
            })
            .then(msg => {
              alert(msg);
              modal.hide();
              window.location.reload();
            })
            .catch(err => {
              alert("Erro: " + err.message);
            });
        } catch (err) {
          alert(err.message);
        }
      });
    })
    .catch(err => {
      modalCorpoTroca.innerHTML = `<div class="alert alert-danger">Erro ao carregar itens do pedido: ${err.message}</div>`;
    });
}
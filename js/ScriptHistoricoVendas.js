let pedidosEntreguesGlobal = [];

async function carregarDados() {
  try {
    const resposta = await fetch('http://localhost:8080/site/ordens/resumo');
    const dados = await resposta.json();

    // Filtrar apenas pedidos com status ENTREGUE
    pedidosEntreguesGlobal = dados.filter(pedido => pedido.status === "ENTREGUE");

    mostrarGrafico(pedidosEntreguesGlobal);
  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

function mostrarGrafico(pedidos) {
  const datas = pedidos.map(pedido => pedido.data);
  const valores = pedidos.map(pedido => pedido.valorTotal);

  const trace = {
    x: datas,
    y: valores,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'rgb(58, 71, 80)' },
    line: { shape: 'linear', color: 'rgb(58, 71, 80)' },
    name: 'Pedidos Entregues'
  };

  const layout = {
    title: 'Histórico de Vendas - Pedidos Entregues',
    xaxis: { title: 'Data', type: 'date', fixedrange: true },
    yaxis: { title: 'Valor Total (R$)', rangemode: 'tozero', fixedrange: true },
    dragmode: false
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  Plotly.newPlot('graficoVendas', [trace], layout, config);

  var grafico = document.getElementById('graficoVendas');
  grafico.on('plotly_click', function(data){
    var ponto = data.points[0];
    var dataSelecionada = ponto.x;
    var valorSelecionado = ponto.y;

    const pedidoSelecionado = pedidos.find(pedido =>
      pedido.data === dataSelecionada || new Date(pedido.data).toLocaleDateString() === new Date(dataSelecionada).toLocaleDateString()
    );

    document.getElementById('dataSelecionada').textContent = new Date(dataSelecionada).toLocaleDateString('pt-BR');
    document.getElementById('valorSelecionado').textContent = valorSelecionado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (pedidoSelecionado) {
      if (pedidoSelecionado.livros.length > 0) {
        document.getElementById('livrosSelecionados').textContent = pedidoSelecionado.livros.join(', ');
      } else {
        document.getElementById('livrosSelecionados').textContent = 'Nenhum livro listado';
      }
    } else {
      document.getElementById('livrosSelecionados').textContent = 'Pedido não encontrado';
    }
  });
}

function filtrarPorData() {
  const dataInicio = document.getElementById('dataInicio').value; // ex: "2025-06-01"
  const dataFim = document.getElementById('dataFim').value;       // ex: "2025-06-30"

  if (!dataInicio && !dataFim) {
    mostrarGrafico(pedidosEntreguesGlobal);
    return;
  }

  const dataInicioObj = dataInicio ? new Date(dataInicio) : null;
  const dataFimObj = dataFim ? new Date(dataFim) : null;

  const pedidosFiltrados = pedidosEntreguesGlobal.filter(pedido => {
    const dataPedido = new Date(pedido.data);

    if (dataInicioObj && dataPedido < dataInicioObj) return false;
    if (dataFimObj && dataPedido > dataFimObj) return false;

    return true;
  });

  mostrarGrafico(pedidosFiltrados);
}

// Evento do botão filtrar
document.getElementById('btnFiltrar').addEventListener('click', filtrarPorData);

carregarDados();

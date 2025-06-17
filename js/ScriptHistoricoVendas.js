let pedidosEntreguesGlobal = [];

async function carregarDados() {
  try {
    const resposta = await fetch('http://localhost:8080/site/ordens/resumo');
    const dados = await resposta.json();

    pedidosEntreguesGlobal = dados.filter(pedido => pedido.status === "ENTREGUE");
    mostrarGrafico(pedidosEntreguesGlobal);
  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

function mostrarGrafico(pedidos) {
  const datas = pedidos.map(pedido => pedido.data);
  const valores = pedidos.map(pedido => pedido.valorTotal);
  const numeros = pedidos.map(pedido => pedido.numeroPedido); 

  const trace = {
    x: datas,
    y: valores,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'rgb(58, 71, 80)' },
    line: { shape: 'linear', color: 'rgb(58, 71, 80)' },
    name: 'Pedidos Entregues',
    customdata: numeros 
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

  const grafico = document.getElementById('graficoVendas');
  grafico.on('plotly_click', function(data) {
    const ponto = data.points[0];
    const dataSelecionada = ponto.x;
    const valorSelecionado = ponto.y;
    const numeroSelecionado = ponto.customdata; 

    const pedidoSelecionado = pedidos.find(pedido => pedido.numeroPedido === numeroSelecionado);

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
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const categoriaSelecionada = document.getElementById('categoria').value;

  if (!dataInicio && !dataFim && !categoriaSelecionada) {
    mostrarGrafico(pedidosEntreguesGlobal);
    return;
  }

  const dataInicioObj = dataInicio ? new Date(dataInicio) : null;
  const dataFimObj = dataFim ? new Date(dataFim) : null;

  const pedidosFiltrados = pedidosEntreguesGlobal.filter(pedido => {
    const dataPedido = new Date(pedido.data);

    const dentroDoIntervalo =
      (!dataInicioObj || dataPedido >= dataInicioObj) &&
      (!dataFimObj || dataPedido <= dataFimObj);

    const contemCategoria =
      !categoriaSelecionada ||
      (pedido.categorias && pedido.categorias.includes(categoriaSelecionada));

    return dentroDoIntervalo && contemCategoria;
  });

  mostrarGrafico(pedidosFiltrados);
}

document.getElementById('btnFiltrar').addEventListener('click', filtrarPorData);

carregarDados();

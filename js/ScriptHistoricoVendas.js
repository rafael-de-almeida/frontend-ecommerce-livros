let pedidosEntreguesGlobal = [];

async function carregarDados() {
  try {
    const resposta = await fetch('http://localhost:8080/site/ordens/resumo');
    const dados = await resposta.json();

    pedidosEntreguesGlobal = dados.filter(pedido => pedido.status === "ENTREGUE");
    mostrarGrafico(pedidosEntreguesGlobal);
    console.log('Dados recebidos da API:', dados);
    console.log('Pedidos ENTREGUE:', pedidosEntreguesGlobal);
  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

function mostrarGrafico(pedidos) {
  const categoriasPorData = {};

  pedidos.forEach(pedido => {
    const data = new Date(pedido.data).toISOString().split('T')[0];

    pedido.livros.forEach(livro => {
      livro.categorias.forEach(categoria => {
        if (!categoriasPorData[categoria]) {
          categoriasPorData[categoria] = {};
        }
        if (!categoriasPorData[categoria][data]) {
          categoriasPorData[categoria][data] = 0;
        }
        categoriasPorData[categoria][data] += livro.quantidade;
      });
    });
  });

  const traces = Object.entries(categoriasPorData).map(([categoria, valoresPorData]) => {
    const datas = Object.keys(valoresPorData).sort();
    const valores = datas.map(data => valoresPorData[data]);

    return {
      x: datas,
      y: valores,
      type: 'scatter',
      mode: 'lines+markers',
      name: categoria,
      line: { shape: 'linear' },
      text: valores.map(v => `${v.toFixed(0)} itens`),
      textposition: 'top center',
      hoverinfo: 'x+y+text'
    };
  });

  const layout = {
    title: { text: 'Itens Vendidos por Categoria', x: 0.5 },
    margin: { l: 50, r: 30, b: 70, t: 50 },
    xaxis: {
      title: 'Data',
      type: 'date',
      tickformat: '%d/%m',
      tickangle: -45,
      fixedrange: true
    },
    yaxis: {
      title: 'Quantidade de Itens',
      rangemode: 'tozero',
      fixedrange: true,
      autorange: true
    },
    dragmode: false,
    plot_bgcolor: '#fff',
    paper_bgcolor: '#fff'
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot('graficoVendas', traces, layout, config);
}






function filtrarPorData() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const categoriaSelecionada = document.getElementById('categoria').value;

  if (!dataInicio && !dataFim && (!categoriaSelecionada || categoriaSelecionada === 'todas')) {
    mostrarGrafico(pedidosEntreguesGlobal);
    return;
  }

  // Formatar as datas do filtro no mesmo formato do banco: YYYY-MM-DD
  const dataInicioStr = dataInicio ? dataInicio.replace(/-/g, '/') : null;
  const dataFimStr = dataFim ? dataFim.replace(/-/g, '/') : null;

  const pedidosFiltrados = pedidosEntreguesGlobal.filter(pedido => {
    const dataPedidoStr = pedido.data; // já vem como "YYYY/MM/DD"

    const dentroDoIntervalo =
      (!dataInicioStr || dataPedidoStr >= dataInicioStr) &&
      (!dataFimStr || dataPedidoStr <= dataFimStr);

    const contemCategoria =
      categoriaSelecionada === 'todas' ||
      (pedido.categorias && pedido.categorias.includes(categoriaSelecionada));

    return dentroDoIntervalo && contemCategoria;
  });

  mostrarGrafico(pedidosFiltrados);
}



document.getElementById('btnFiltrar').addEventListener('click', filtrarPorData);

carregarDados();

let pedidosEntreguesGlobal = [];

async function carregarDados() {
  try {
    const resposta = await fetch('http://localhost:8080/site/resumo');
    const dados = await resposta.json();

    pedidosEntreguesGlobal = dados.filter(pedido => pedido.status === "ENTREGUE");
    mostrarGrafico(pedidosEntreguesGlobal);
    console.log('Dados recebidos da API:', dados);
    console.log('Pedidos ENTREGUE:', pedidosEntreguesGlobal);
  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

function mostrarGrafico(pedidos, categoriaFiltro = 'todas') {
  const categoriasPorData = {};

  pedidos.forEach(pedido => {
    const data = new Date(pedido.data).toISOString().split('T')[0];

    pedido.livros.forEach(livro => {
      livro.categorias.forEach(categoria => {
        // Se categoriaFiltro for diferente de 'todas', só inclui a categoria selecionada
        if (categoriaFiltro !== 'todas' && categoria !== categoriaFiltro) {
          return; // pula categorias diferentes
        }

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
    selectdirection: false,
    clickmode: 'none',
    legend: {
      itemclick: false,
      itemdoubleclick: false
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
    mostrarGrafico(pedidosEntreguesGlobal, 'todas');
    return;
  }

  const pedidosFiltrados = pedidosEntreguesGlobal.filter(pedido => {
    const dataPedidoStr = pedido.data.split('T')[0];

    const dentroDoIntervalo =
      (!dataInicio || dataPedidoStr >= dataInicio) &&
      (!dataFim || dataPedidoStr <= dataFim);

    const contemCategoria =
      categoriaSelecionada === 'todas' ||
      pedido.livros.some(livro => livro.categorias.includes(categoriaSelecionada));

    return dentroDoIntervalo && contemCategoria;
  });

  mostrarGrafico(pedidosFiltrados, categoriaSelecionada);
}







document.getElementById('btnFiltrar').addEventListener('click', filtrarPorData);

carregarDados();

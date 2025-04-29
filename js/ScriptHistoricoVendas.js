
async function carregarDados() {
  try {
    const resposta = await fetch('http://localhost:8080/site/ordens/resumo');
    const dados = await resposta.json();

    // Filtrar apenas pedidos com status ENTREGUE
    const pedidosEntregues = dados.filter(pedido => pedido.status === "ENTREGUE");

    if (pedidosEntregues.length === 0) {
      console.error("Nenhum pedido entregue encontrado.");
      return;
    }

    // Mapear dados para o gráfico
    const datas = pedidosEntregues.map(pedido => pedido.data);
    const valores = pedidosEntregues.map(pedido => pedido.valorTotal);

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
      displayModeBar: false, // <-- mostrei a barra de opções do Plotly
    };

    Plotly.newPlot('graficoVendas', [trace], layout, config);

    // Atualizar Cards ao clicar
    var grafico = document.getElementById('graficoVendas');
    grafico.on('plotly_click', function(data){
      var ponto = data.points[0];
      var dataSelecionada = ponto.x;
      var valorSelecionado = ponto.y;

      // Procurar o pedido relacionado para mostrar os livros
      const pedidoSelecionado = pedidosEntregues.find(pedido =>
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

  } catch (erro) {
    console.error('Erro ao carregar dados da API:', erro);
  }
}

carregarDados();
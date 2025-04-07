document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const livroId = urlParams.get("id");

    if (!livroId) {
        alert("Livro não encontrado.");
        window.location.href = "telaInicial.html";
        return;
    }

    fetch(`http://localhost:8080/site/livros/${livroId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao buscar dados do livro.");
            }
            return response.json();
        })
        .then(livro => {
            // Exibir os dados do livro na página
            document.getElementById("livroImagem").src = livro.livImagem;
            document.getElementById("livroTitulo").textContent = livro.livTitulo;
            document.getElementById("livroAutor").textContent = livro.LIV_AUTOR;
            document.getElementById("livroAno").textContent = livro.LIV_ANO;
            document.getElementById("livroEditora").textContent = livro.LIV_EDITORA;
            document.getElementById("livroEdicao").textContent = livro.LIV_EDICAO;
            document.getElementById("livroISBN").textContent = livro.LIV_ISBN;
            document.getElementById("livroPaginas").textContent = livro.LIV_QTD_PAGINAS;
            document.getElementById("livroDimensao").textContent = livro.LIV_DIMENSAO;
            document.getElementById("livroSinopse").textContent = livro.LIV_SINOPSE;

            const valorVenda = parseFloat(livro.LIV_VENDA);
            document.getElementById("livroPreco").textContent = !isNaN(valorVenda)
                ? `R$ ${valorVenda.toFixed(2).replace('.', ',')}`
                : "Preço indisponível";
        })
        .catch(error => {
            console.error(error);
            alert("Erro ao carregar informações do livro.");
        });
});

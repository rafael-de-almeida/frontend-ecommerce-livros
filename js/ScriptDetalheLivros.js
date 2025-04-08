document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const livroId = urlParams.get("liv_id");
    const userId = urlParams.get("id");

    if (!livroId) {
        alert("Livro não encontrado.");
        window.location.href = userId ? `telaInicial.html?id=${userId}` : "telaInicial.html";
        return;
    }

    fetch(`http://localhost:8080/site/livros/${livroId}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar dados do livro.");
            return response.json();
        })
        .then(livro => {
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
            document.getElementById("livroPreco").textContent = 
                livro.LIV_VENDA ? `R$ ${parseFloat(livro.LIV_VENDA).toFixed(2).replace('.', ',')}` : "Preço indisponível";

            // Botões programados
            const btnComprarAgora = document.querySelector(".btn.btn-success");
            const btnAdicionarCarrinho = document.querySelector(".btn.btn-outline-primary");

            btnComprarAgora.addEventListener("click", (e) => {
                e.preventDefault();
                adicionarAoCarrinho(livro);
                window.location.href = `Carrinho.html?id=${userId}`;
            });

            btnAdicionarCarrinho.addEventListener("click", (e) => {
                e.preventDefault();
                adicionarAoCarrinho(livro);
            });
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao carregar informações do livro.");
        });

    if (userId) {
        document.querySelectorAll("a").forEach(link => {
            if (link.href && !link.href.includes("logout")) {
                const url = new URL(link.href, window.location.origin);
                url.searchParams.set("id", userId);
                link.href = url.toString();
            }
        });
    }

    atualizarBadgeCarrinho();
});

function adicionarAoCarrinho(livro) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const itemExistente = carrinho.find(item => item.livId === livro.livId);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ ...livro, quantidade: 1 });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
    mostrarMensagemSucesso();
}

function atualizarBadgeCarrinho() {
    const badge = document.querySelector(".navbar .badge");
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    if (badge) badge.textContent = totalItens;
}
function mostrarMensagemSucesso() {
    const msg = document.getElementById("mensagemSucesso");
    msg.style.display = "block";

    
    setTimeout(() => {
        msg.style.display = "none";
    }, 3000);
}

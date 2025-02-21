document.addEventListener("DOMContentLoaded", function () {
    const formProduto = document.getElementById("form-produto");
    const tabelaProdutos = document.getElementById("tabela-produtos");
    const estoqueBaixoLista = document.getElementById("estoque-baixo");

    // Função para carregar produtos na tabela
    function carregarProdutos() {
        fetch("/produtos")
            .then(response => response.json())
            .then(produtos => {
                tabelaProdutos.innerHTML = "";
                produtos.forEach(produto => {
                    let linha = `<tr>
                        <td>${produto[0]}</td>
                        <td>${produto[1]}</td>
                        <td>R$ ${produto[2].toFixed(2)}</td>
                        <td>${produto[3]}</td>
                        <td>${produto[4] || "-"}</td>
                        <td><button onclick="venderProduto(${produto[0]})">Vender</button></td>
                    </tr>`;
                    tabelaProdutos.innerHTML += linha;
                });
            });
    }

    // Função para adicionar um produto
    formProduto.addEventListener("submit", function (event) {
        event.preventDefault();
        const produto = {
            nome: document.getElementById("nome").value,
            preco: parseFloat(document.getElementById("preco").value),
            quantidade: parseInt(document.getElementById("quantidade").value),
            categoria: document.getElementById("categoria").value
        };
        
        fetch("/produtos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto)
        }).then(response => response.json())
          .then(() => {
              formProduto.reset();
              carregarProdutos();
          });
    });

    // Função para vender um produto
    window.venderProduto = function (id) {
        fetch(`/vender/${id}`, { method: "POST" })
            .then(response => response.json())
            .then(() => carregarProdutos())
            .catch(error => console.error("Erro ao vender produto:", error));
    };

    // Função para carregar estoque baixo
    window.carregarEstoqueBaixo = function () {
        fetch("/estoque_baixo")
            .then(response => response.json())
            .then(produtos => {
                estoqueBaixoLista.innerHTML = "";
                produtos.forEach(produto => {
                    let item = `<li>${produto[1]} - Apenas ${produto[3]} unidades!</li>`;
                    estoqueBaixoLista.innerHTML += item;
                });
            });
    };

    // Carregar produtos ao iniciar a página
    carregarProdutos();
});

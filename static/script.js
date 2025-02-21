document.addEventListener("DOMContentLoaded", function () {
    const formProduto = document.getElementById("form-produto");
    const tabelaProdutos = document.getElementById("tabela-produtos");
    const estoqueBaixoLista = document.getElementById("estoque-baixo");
    const historicoVendas = document.getElementById("historico-vendas");

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

    // Função modificada para vender produto com data e hora
    window.venderProduto = function (id) {
        const dataVenda = new Date().toISOString();
        const venda = {
            produtoId: id,
            dataHora: dataVenda
        };
        
        fetch(`/vender/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venda)
        })
        .then(response => response.json())
        .then(() => {
            carregarProdutos();
            carregarHistoricoVendas();
        })
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

    // Nova função para carregar histórico de vendas
    function carregarHistoricoVendas() {
        fetch("/historico_vendas")
            .then(response => response.json())
            .then(vendas => {
                historicoVendas.innerHTML = "";
                vendas.forEach(venda => {
                    const data = new Date(venda.dataHora).toLocaleString();
                    let linha = `<tr>
                        <td>${venda.produto}</td>
                        <td>${data}</td>
                        <td>R$ ${venda.preco.toFixed(2)}</td>
                        <td>${venda.categoria}</td>
                    </tr>`;
                    historicoVendas.innerHTML += linha;
                });
            });
    }
    // Função para excluir um produto
    function deleteProduto(produtoId) {
        fetch(`/produtos/${produtoId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir o produto');
            }
            return response.json();
        })
        .then(data => {
            alert(data.mensagem);
            carregarProdutos(); // Recarrega a lista de produtos após a exclusão
        })
        .catch(error => {
            alert(error.message);
        });
    }
    // Carregar produtos ao iniciar a página
    carregarProdutos();
    carregarHistoricoVendas();
});

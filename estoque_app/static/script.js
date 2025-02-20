document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();

    document.getElementById("produtoForm").addEventListener("submit", function (e) {
        e.preventDefault();
        adicionarProduto();
    });
});

function carregarProdutos() {
    fetch("/produtos")
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById("produtoLista");
            lista.innerHTML = "";
            data.forEach(produto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${produto[0]}</td>
                    <td>${produto[1]}</td>
                    <td>R$ ${produto[2].toFixed(2)}</td>
                    <td>${produto[3]}</td>
                    <td>${produto[4]}</td>
                    <td><button onclick="deletarProduto(${produto[0]})">Excluir</button></td>
                `;
                lista.appendChild(row);
            });
        });
}

function adicionarProduto() {
    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const categoria = document.getElementById("categoria").value;

    fetch("/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco, quantidade, categoria })
    })
    .then(response => response.json())
    .then(() => {
        carregarProdutos();
        document.getElementById("produtoForm").reset();
    });
}

function deletarProduto(id) {
    fetch(`/produtos/${id}`, { method: "DELETE" })
    .then(response => response.json())
    .then(() => carregarProdutos());
}

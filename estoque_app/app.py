from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

def criar_tabela():
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            quantidade INTEGER NOT NULL,
            categoria TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/produtos", methods=["POST"])
def adicionar_produto():
    data = request.json
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO produtos (nome, preco, quantidade, categoria) VALUES (?, ?, ?, ?)",
                   (data["nome"], data["preco"], data["quantidade"], data.get("categoria", "")))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Produto adicionado com sucesso!"}), 201

@app.route("/produtos", methods=["GET"])
def listar_produtos():
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    conn.close()
    return jsonify(produtos)

@app.route("/produtos/<int:id>", methods=["DELETE"])
def deletar_produto(id):
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM produtos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Produto removido com sucesso!"})

if __name__ == "__main__":
    criar_tabela()
    app.run(debug=True)

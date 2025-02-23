from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

# Criar tabela se não existir
def init_db():
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS produtos (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      nome TEXT NOT NULL,
                      preco REAL NOT NULL,
                      quantidade INTEGER NOT NULL,
                      categoria TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Rota para exibir a página inicial
@app.route('/')
def index():
    return render_template("index.html")

# Rota para obter lista de produtos
@app.route('/produtos', methods=['GET'])
def get_produtos():
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    conn.close()
    return jsonify(produtos)

# Rota para adicionar um produto
@app.route('/produtos', methods=['POST'])
def add_produto():
    data = request.json
    nome = data.get("nome")
    preco = data.get("preco")
    quantidade = data.get("quantidade")
    categoria = data.get("categoria")

    if not nome or not isinstance(preco, (int, float)) or not isinstance(quantidade, int):
        return jsonify({"erro": "Dados inválidos!"}), 400

    try:
        conn = sqlite3.connect("estoque.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO produtos (nome, preco, quantidade, categoria) VALUES (?, ?, ?, ?)",
                       (nome, preco, quantidade, categoria))
        conn.commit()
    except sqlite3.Error as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"mensagem": "Produto adicionado com sucesso!"})

# Rota para vender um produto (diminuir a quantidade)
@app.route('/vender/<int:produto_id>', methods=['POST'])
def vender_produto(produto_id):
    try:
        conn = sqlite3.connect("estoque.db")
        cursor = conn.cursor()
        cursor.execute("SELECT quantidade FROM produtos WHERE id = ?", (produto_id,))
        produto = cursor.fetchone()

        if produto and produto[0] > 0:
            nova_quantidade = produto[0] - 1
            cursor.execute("UPDATE produtos SET quantidade = ? WHERE id = ?", (nova_quantidade, produto_id))
            conn.commit()
            return jsonify({"mensagem": "Venda realizada com sucesso!", "quantidade_restante": nova_quantidade})

        return jsonify({"erro": "Estoque insuficiente!"}), 400
    except sqlite3.Error as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()

# Rota para obter relatório de estoque baixo
@app.route('/estoque_baixo', methods=['GET'])
def estoque_baixo():
    conn = sqlite3.connect("estoque.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM produtos WHERE quantidade < 5")
    produtos = cursor.fetchall()
    conn.close()
    return render_template("estoque_baixo.html", produtos=produtos)

# Rota para excluir um produto
@app.route('/produtos/<int:produto_id>', methods=['DELETE'])
def delete_produto(produto_id):
    try:
        conn = sqlite3.connect("estoque.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM produtos WHERE id = ?", (produto_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Produto não encontrado!"}), 404
        
        return jsonify({"mensagem": "Produto excluído com sucesso!"}), 200
    except sqlite3.Error as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
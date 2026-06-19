/* 
==================================
1 PARTE - CONFIGURAÇÃO DO SERVIDOR
==================================
*/

require("dotenv").config(); // carrega as variáveis do arquivo .env
const pool = require("./db.js"); // importa a conexão com o banco de dados
const bcrypt = require("bcrypt"); // para criptografar e comparar senhas

// 1 - Importa o Express
const express = require("express");

// 2 - Importa o CORS
const cors = require("cors");

// 3 - Cria o servidor
const app = express();

// 4 - Ativa o CORS
app.use(cors());

// 5 - Ativa o leitor de JSON
app.use(express.json());


/* 
==================================
2 PARTE - ROTAS
==================================
*/

// ── Contato ──
app.post("/contatos", async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ mensagem: "Preencha todos os campos" });
        }

        await pool.execute(
            "INSERT INTO contatos(nome, email, mensagem) VALUES(?, ?, ?)",
            [nome, email, mensagem]
        );

        return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
    }
});


// ── Cadastro ──
app.post("/auth/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Preencha todos os campos" });
        }

        // Verifica se o e-mail já está cadastrado
        const [rows] = await pool.execute(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(409).json({ mensagem: "E-mail já cadastrado." });
        }

        // Criptografa a senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.execute(
            "INSERT INTO usuarios(nome, email, senha) VALUES(?, ?, ?)",
            [nome, email, senhaCriptografada]
        );

        return res.status(201).json({ mensagem: "Conta criada com sucesso!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
    }
});


// ── Login ──
app.post("/auth/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha e-mail e senha" });
        }

        const [rows] = await pool.execute(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }

        // Retorna os dados do usuário (sem a senha)
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
    }
});


// 9. Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
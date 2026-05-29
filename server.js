/* 
==================================
1 PARTE - CONFIGURAÇÃO DO SERVIDOR
==================================
*/

require("dotenv").config(); // carrega as variáveis do arquivo .env
const pool = require("./db.js"); // importa a conexão com o banco de dados

// 1 - Inporta o Express - ele cria e gerencia o nosso servidor
const express = require("express");

// 2 - Importa o CORS - permite que o navegador "converse" com o servidor (frontend - backend)
const cors = require("cors");

// 3 - Importa o bcrypt para criptografar senhas
const bcrypt = require("bcrypt");

// 4 - Cria o servidor (como ligar um computador)
const app = express();

// 5 - Ativa o CORS - libera a comunicação entre o front-end e o back-end
app.use(cors());

// 6 - Ativa o leitor de JSON - permite entender os dados recebidos
// sem isso, o servidor não consegue ler o que o formulário envia
app.use(express.json());


/* 
==================================
2 PARTE - CRIAÇÃO DAS ROTAS E INÍCIO
==================================
*/

// ─── POST /contatos ────────────────────────────────────────
// Recebe mensagens do formulário de contato e salva no banco
app.post("/contatos", async (req, res) => {
    try {
        const nome = req.body.nome;
        const email = req.body.email;
        const mensagem = req.body.mensagem;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ mensagem: "Preencha todos os campos" });
        }

        // ✅ await garante que o INSERT termine antes de responder
        await pool.execute(
            "INSERT INTO contatos(nome, email, mensagem) VALUES(?, ?, ?)",
            [nome, email, mensagem]
        );

        // ✅ Apenas UMA resposta
        return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });

    } catch (error) {
        console.error(error);
        // ✅ Informa o cliente que algo deu errado
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
    }
});


// ─── POST /auth/cadastro ───────────────────────────────────
// Cria uma nova conta de usuário com senha criptografada
app.post("/auth/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Valida se todos os campos foram enviados
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Preencha todos os campos." });
        }

        // Valida tamanho mínimo da senha
        if (senha.length < 6) {
            return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
        }

        // Verifica se o e-mail já está cadastrado
        const [existente] = await pool.execute(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );
        if (existente.length > 0) {
            return res.status(409).json({ erro: "E-mail já cadastrado." });
        }

        // Criptografa a senha antes de salvar no banco (nunca salve senha pura!)
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere o novo usuário no banco
        await pool.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, senhaHash]
        );

        return res.status(201).json({ mensagem: "Conta criada com sucesso!" });

    } catch (error) {
        console.error("[Cadastro]", error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});


// ─── POST /auth/login ──────────────────────────────────────
// Verifica as credenciais e retorna os dados do usuário
app.post("/auth/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Valida se os campos foram enviados
        if (!email || !senha) {
            return res.status(400).json({ erro: "Preencha e-mail e senha." });
        }

        // Busca o usuário pelo e-mail
        const [rows] = await pool.execute(
            "SELECT id, nome, senha FROM usuarios WHERE email = ?",
            [email]
        );

        // Se não encontrou nenhum usuário com esse e-mail
        if (rows.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const usuario = rows[0];

        // Compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        // Login bem-sucedido — retorna os dados públicos do usuário
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: { id: usuario.id, nome: usuario.nome }
        });

    } catch (error) {
        console.error("[Login]", error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});


// ─── Inicia o servidor na porta 3000 ──────────────────────
// Depois disso, o servidor fica "ouvindo" por novas mensagens
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
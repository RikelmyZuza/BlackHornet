/* ═══════════════════════════════════════════════════════════
   login.js — Black Hornet Coffee
   Responsável por:
     1. Alternar entre os painéis de Login e Cadastro
     2. Validar os campos no front-end antes de enviar
     3. Chamar a API real do servidor Express
     4. Exibir o resultado (sucesso ou mensagem de erro)
   ═══════════════════════════════════════════════════════════ */


/* ─── Configuração da API ─── */

// Altere aqui caso a URL do servidor mude
const API_BASE = 'http://localhost:3000';


/* ════════════════════════════════════════
   ALTERNÂNCIA DE ABAS
   Troca entre os painéis Login e Cadastro
   ════════════════════════════════════════ */

/**
 * Ativa o painel indicado ('login' ou 'cadastro') e
 * atualiza título, subtítulo e estado das abas.
 * @param {'login'|'cadastro'} aba
 */
function mudarAba(aba) {
    const tabLogin       = document.getElementById('tabLogin');
    const tabCadastro    = document.getElementById('tabCadastro');
    const painelLogin    = document.getElementById('painelLogin');
    const painelCadastro = document.getElementById('painelCadastro');
    const titulo         = document.getElementById('formTitulo');
    const subtitulo      = document.getElementById('formSubtitulo');

    // Limpa qualquer feedback visível ao trocar de aba
    ocultarFeedback('feedbackLogin');
    ocultarFeedback('feedbackCadastro');

    if (aba === 'login') {
        tabLogin.classList.add('ativo');
        tabLogin.setAttribute('aria-selected', 'true');
        tabCadastro.classList.remove('ativo');
        tabCadastro.setAttribute('aria-selected', 'false');

        painelLogin.classList.add('ativo');
        painelCadastro.classList.remove('ativo');

        titulo.textContent    = 'Bem‑vindo de volta';
        subtitulo.textContent = 'Acesse sua conta para continuar';

    } else {
        tabCadastro.classList.add('ativo');
        tabCadastro.setAttribute('aria-selected', 'true');
        tabLogin.classList.remove('ativo');
        tabLogin.setAttribute('aria-selected', 'false');

        painelCadastro.classList.add('ativo');
        painelLogin.classList.remove('ativo');

        titulo.textContent    = 'Crie sua conta';
        subtitulo.textContent = 'Junte-se à comunidade Black Hornet';
    }
}


/* ════════════════════════════════════════
   LOGIN
   Valida os campos e envia para POST /auth/login.
   O servidor deve retornar:
     • 200 { mensagem, usuario } → sucesso
     • 401                       → credenciais erradas
     • 500                       → erro interno
   ════════════════════════════════════════ */
async function fazerLogin() {
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;

    // ── Validações no front-end (evitam requisição desnecessária) ──
    if (!email || !senha) {
        mostrarFeedback('feedbackLogin', 'erro', 'Preencha e-mail e senha antes de continuar.');
        return;
    }

    if (!validarEmail(email)) {
        mostrarFeedback('feedbackLogin', 'erro', 'Insira um e-mail válido.');
        return;
    }

    // Desabilita o botão para evitar cliques duplos durante a requisição
    setBotaoCarregando('painelLogin', true);

    try {
        const resposta = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        // Tenta ler o corpo da resposta como JSON
        // (o servidor deve sempre devolver JSON, mesmo em erro)
        const dados = await resposta.json();

        if (resposta.ok) {
            // Salva o token na sessão se o servidor retornar
            if (dados.token) {
                sessionStorage.setItem('token', dados.token);
            }

            // TODO: descomentar quando o back estiver pronto
            // mostrarFeedback('feedbackLogin', 'sucesso', '✓ Login realizado! Redirecionando…');
            // setTimeout(() => { window.location.href = '../index.html'; }, 1200);


        } else {
            // ── Erro vindo do servidor (401, 404, etc.) ──
            // Usa a mensagem do servidor se existir, senão exibe um padrão
            const mensagemErro = dados.erro || dados.mensagem || 'E-mail ou senha incorretos.';
            mostrarFeedback('feedbackLogin', 'erro', `✗ ${mensagemErro}`);
        }

    } catch (erro) {
        // ── Erro de rede: servidor offline ou sem conexão ──
        mostrarFeedback('feedbackLogin', 'erro', '✗ Não foi possível conectar ao servidor. Tente novamente.');
        console.error('[Login] Erro de rede:', erro);

    } finally {
        // Reabilita o botão independentemente do resultado
        setBotaoCarregando('painelLogin', false);
    }
}


/* ════════════════════════════════════════
   CADASTRO
   Valida os campos e envia para POST /auth/cadastro.
   O servidor deve retornar:
     • 201 { mensagem, usuario } → conta criada
     • 409                       → e-mail já cadastrado
     • 500                       → erro interno
   ════════════════════════════════════════ */
async function fazerCadastro() {
    const nome  = document.getElementById('nomeCadastro').value.trim();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

    // ── Validações no front-end ──
    if (!nome || !email || !senha) {
        mostrarFeedback('feedbackCadastro', 'erro', 'Preencha todos os campos.');
        return;
    }

    if (!validarEmail(email)) {
        mostrarFeedback('feedbackCadastro', 'erro', 'Insira um e-mail válido.');
        return;
    }

    if (senha.length < 6) {
        mostrarFeedback('feedbackCadastro', 'erro', 'A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setBotaoCarregando('painelCadastro', true);

    try {
        const resposta = await fetch(`${API_BASE}/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.status === 201) {
            // Limpa os campos após cadastro bem-sucedido
            document.getElementById('nomeCadastro').value  = '';
            document.getElementById('emailCadastro').value = '';
            document.getElementById('senhaCadastro').value = '';

            // TODO: descomentar quando o back estiver pronto
            // mostrarFeedback('feedbackCadastro', 'sucesso', '✓ Conta criada com sucesso! Faça login para continuar.');
            // setTimeout(() => mudarAba('login'), 1800);

        } else {
            // ── Erro vindo do servidor (409 e-mail duplicado, 500, etc.) ──
            const mensagemErro = dados.erro || dados.mensagem || 'Não foi possível criar a conta.';
            mostrarFeedback('feedbackCadastro', 'erro', `✗ ${mensagemErro}`);
        }

    } catch (erro) {
        // ── Erro de rede ──
        mostrarFeedback('feedbackCadastro', 'erro', '✗ Não foi possível conectar ao servidor. Tente novamente.');
        console.error('[Cadastro] Erro de rede:', erro);

    } finally {
        setBotaoCarregando('painelCadastro', false);
    }
}


/* ════════════════════════════════════════
   LOGIN COM GOOGLE
   ════════════════════════════════════════ */
function loginGoogle() {
    // Integre seu fluxo OAuth aqui quando estiver pronto.
    console.info('[Black Hornet] Login com Google ainda não configurado.');
}


/* ════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════ */

/** Valida formato de e-mail com expressão regular simples */
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Exibe uma mensagem de feedback colorida abaixo do formulário.
 * @param {string} id     - id do elemento de feedback no HTML
 * @param {'sucesso'|'erro'} tipo
 * @param {string} mensagem
 */
function mostrarFeedback(id, tipo, mensagem) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = mensagem;
    el.className   = `form-feedback ${tipo} visivel`;
}

/** Oculta o elemento de feedback (remove as classes visuais) */
function ocultarFeedback(id) {
    const el = document.getElementById(id);
    if (el) el.className = 'form-feedback';
}

/**
 * Desabilita ou reabilita o botão .btn-login dentro de um painel,
 * trocando o texto para indicar carregamento.
 * @param {string}  painelId  - id do painel (ex: 'painelLogin')
 * @param {boolean} carregando
 */
function setBotaoCarregando(painelId, carregando) {
    const painel = document.getElementById(painelId);
    if (!painel) return;
    const botao = painel.querySelector('.btn-login');
    if (!botao) return;

    botao.disabled = carregando;
    botao.textContent = carregando ? 'Aguarde…' : (
        painelId === 'painelLogin' ? 'Entrar na conta' : 'Criar minha conta'
    );
}


/* ════════════════════════════════════════
   ENVIO POR TECLA ENTER
   ════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const painelLogin    = document.getElementById('painelLogin');
    const painelCadastro = document.getElementById('painelCadastro');
    if (painelLogin    && painelLogin.classList.contains('ativo'))    fazerLogin();
    if (painelCadastro && painelCadastro.classList.contains('ativo')) fazerCadastro();
});
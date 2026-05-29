/* ═══════════════════════════════════════════════════════════
   login.js — Black Hornet Coffee
   Responsável por:
     1. Alternar entre os painéis de Login e Cadastro
     2. Validar os campos no front-end antes de enviar
     3. Chamar a API real do servidor Express
     4. Salvar o usuário no localStorage após login
     5. Redirecionar para perfil.html após login/cadastro
   ═══════════════════════════════════════════════════════════ */


/* ─── Configuração da API ─── */
const API_BASE = 'http://localhost:3000';


/* ════════════════════════════════════════
   VERIFICAÇÃO INICIAL
   Se já está logado, vai direto para o perfil
   ════════════════════════════════════════ */
if (localStorage.getItem('usuario')) {
    window.location.href = 'perfil.html';
}


/* ════════════════════════════════════════
   ALTERNÂNCIA DE ABAS
   ════════════════════════════════════════ */
function mudarAba(aba) {
    const tabLogin       = document.getElementById('tabLogin');
    const tabCadastro    = document.getElementById('tabCadastro');
    const painelLogin    = document.getElementById('painelLogin');
    const painelCadastro = document.getElementById('painelCadastro');
    const titulo         = document.getElementById('formTitulo');
    const subtitulo      = document.getElementById('formSubtitulo');

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
   ════════════════════════════════════════ */
async function fazerLogin() {
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;

    if (!email || !senha) {
        mostrarFeedback('feedbackLogin', 'erro', 'Preencha e-mail e senha antes de continuar.');
        return;
    }

    if (!validarEmail(email)) {
        mostrarFeedback('feedbackLogin', 'erro', 'Insira um e-mail válido.');
        return;
    }

    setBotaoCarregando('painelLogin', true);

    try {
        const resposta = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // Salva os dados do usuário e a data de login no localStorage
            localStorage.setItem('usuario', JSON.stringify({
                id:    dados.usuario.id,
                nome:  dados.usuario.nome,
                email: email
            }));
            localStorage.setItem('loginEm', new Date().toISOString());

            mostrarFeedback('feedbackLogin', 'sucesso', '✓ Login realizado! Redirecionando…');
            setTimeout(() => { window.location.href = 'perfil.html'; }, 1000);

        } else {
            const mensagemErro = dados.erro || dados.mensagem || 'E-mail ou senha incorretos.';
            mostrarFeedback('feedbackLogin', 'erro', `✗ ${mensagemErro}`);
        }

    } catch (erro) {
        mostrarFeedback('feedbackLogin', 'erro', '✗ Não foi possível conectar ao servidor. Tente novamente.');
        console.error('[Login] Erro de rede:', erro);

    } finally {
        setBotaoCarregando('painelLogin', false);
    }
}


/* ════════════════════════════════════════
   CADASTRO
   ════════════════════════════════════════ */
async function fazerCadastro() {
    const nome  = document.getElementById('nomeCadastro').value.trim();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

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
            document.getElementById('nomeCadastro').value  = '';
            document.getElementById('emailCadastro').value = '';
            document.getElementById('senhaCadastro').value = '';

            mostrarFeedback('feedbackCadastro', 'sucesso', '✓ Conta criada! Faça login para continuar.');
            setTimeout(() => mudarAba('login'), 1800);

        } else {
            const mensagemErro = dados.erro || dados.mensagem || 'Não foi possível criar a conta.';
            mostrarFeedback('feedbackCadastro', 'erro', `✗ ${mensagemErro}`);
        }

    } catch (erro) {
        mostrarFeedback('feedbackCadastro', 'erro', '✗ Não foi possível conectar ao servidor. Tente novamente.');
        console.error('[Cadastro] Erro de rede:', erro);

    } finally {
        setBotaoCarregando('painelCadastro', false);
    }
}


/* ════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════ */
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarFeedback(id, tipo, mensagem) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = mensagem;
    el.className   = `form-feedback ${tipo} visivel`;
}

function ocultarFeedback(id) {
    const el = document.getElementById(id);
    if (el) el.className = 'form-feedback';
}

function setBotaoCarregando(painelId, carregando) {
    const painel = document.getElementById(painelId);
    if (!painel) return;
    const botao = painel.querySelector('.btn-login');
    if (!botao) return;
    botao.disabled    = carregando;
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
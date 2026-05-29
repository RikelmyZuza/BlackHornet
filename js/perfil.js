/* ═══════════════════════════════════════════════════════════
   perfil.js — Black Hornet Coffee
   Responsável por:
     1. Verificar se o usuário está logado (localStorage)
     2. Preencher nome, e-mail e avatar com as iniciais
     3. Redirecionar para login se não estiver autenticado
     4. Função de logout
   ═══════════════════════════════════════════════════════════ */

/* ─── Carrega os dados salvos no localStorage ─── */
const usuarioSalvo = localStorage.getItem('usuario');

// Se não há usuário logado, redireciona para o login
if (!usuarioSalvo) {
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioSalvo);

/* ─── Preenche o avatar com as iniciais do nome ─── */
function gerarIniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/* ─── Gera uma cor de fundo baseada no nome (sempre consistente) ─── */
function gerarCorAvatar(nome) {
    const cores = [
        '#c8923a', '#9e7028', '#a0522d', '#8b6914',
        '#b8860b', '#cd853f', '#d2691e', '#c46f1a'
    ];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
        hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
}

/* ─── Preenche a página com os dados do usuário ─── */
function preencherPerfil() {
    const nome  = usuario.nome  || 'Usuário';
    const email = usuario.email || '—';

    // Avatar
    const avatarEl = document.getElementById('perfilAvatar');
    avatarEl.textContent       = gerarIniciais(nome);
    avatarEl.style.background  = `linear-gradient(135deg, ${gerarCorAvatar(nome)}, #9e7028)`;

    // Cabeçalho
    document.getElementById('perfilNome').textContent  = nome;
    document.getElementById('perfilEmail').textContent = email;

    // Detalhes
    document.getElementById('detalheNome').textContent  = nome;
    document.getElementById('detalheEmail').textContent = email;

    // Data de entrada — salva no localStorage no momento do login
    const dataEntrada = localStorage.getItem('loginEm');
    if (dataEntrada) {
        const data = new Date(dataEntrada);
        document.getElementById('detalheMembro').textContent =
            data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } else {
        document.getElementById('detalheMembro').textContent = 'Hoje';
    }
}

/* ─── Logout ─── */
function sairDaConta() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('loginEm');
    window.location.href = 'login.html';
}

/* ─── Inicializa ─── */
preencherPerfil();
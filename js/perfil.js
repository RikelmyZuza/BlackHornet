/* ═══════════════════════════════════════════════════════════
   perfil.js — Black Hornet Coffee
   Depende de auth.js (carregado antes no HTML).
   ═══════════════════════════════════════════════════════════ */

/* ─── Protege a página ─── */
exigirLogin('login.html');

const usuario = getUsuarioLogado();

/* ─── Gera iniciais do nome ─── */
function gerarIniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/* ─── Cor de fundo do avatar baseada no nome ─── */
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

/* ─── Preenche a página ─── */
function preencherPerfil() {
    const nome  = usuario.nome  || 'Usuário';
    const email = usuario.email || '—';

    const avatarEl = document.getElementById('perfilAvatar');
    avatarEl.textContent      = gerarIniciais(nome);
    avatarEl.style.background = `linear-gradient(135deg, ${gerarCorAvatar(nome)}, #9e7028)`;

    document.getElementById('perfilNome').textContent  = nome;
    document.getElementById('perfilEmail').textContent = email;
    document.getElementById('detalheNome').textContent  = nome;
    document.getElementById('detalheEmail').textContent = email;

    const dataEntrada = localStorage.getItem('loginEm');
    if (dataEntrada) {
        const data = new Date(dataEntrada);
        document.getElementById('detalheMembro').textContent =
            data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } else {
        document.getElementById('detalheMembro').textContent = 'Hoje';
    }
}

preencherPerfil();

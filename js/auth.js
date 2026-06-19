/* ═══════════════════════════════════════════════════════════
   auth.js — Black Hornet Coffee
   ═══════════════════════════════════════════════════════════ */

function getUsuarioLogado() {
    const salvo = localStorage.getItem('usuario');
    if (!salvo) return null;
    try { return JSON.parse(salvo); } catch { return null; }
}

function estaLogado() {
    return getUsuarioLogado() !== null;
}

function atualizarHeader() {
    const iconeFav = document.querySelector('.icone-favoritos');
    if (iconeFav) {
        iconeFav.style.display = estaLogado() ? 'flex' : 'none';
    }
    const iconeLoginLink = document.querySelector('.icone-login')?.closest('a');
    if (iconeLoginLink && estaLogado()) {
        const href = iconeLoginLink.getAttribute('href') || '';
        if (href.includes('login.html')) {
            iconeLoginLink.setAttribute('href', href.replace('login.html', 'perfil.html'));
        }
    }
}

function exigirLogin(loginUrl = 'login.html') {
    if (!estaLogado()) {
        window.location.href = loginUrl;
    }
}

function sairDaConta(destino = '../index.html') {
    localStorage.removeItem('usuario');
    localStorage.removeItem('loginEm');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = destino;
}

document.addEventListener('DOMContentLoaded', atualizarHeader);
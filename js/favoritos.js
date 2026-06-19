/* ═══════════════════════════════════════════════════════════
   favoritos.js — Black Hornet Coffee
   Responsável por:
     1. Proteger a página (exige login)
     2. Carregar e exibir os favoritos do usuário
     3. Permitir remover um favorito
   ═══════════════════════════════════════════════════════════ */

/* ─── Protege a página — redireciona se não estiver logado ─── */
exigirLogin('login.html');

/* ─── Chave no localStorage onde os favoritos ficam salvos ─── */
const CHAVE_FAVORITOS = 'blackhornet_favoritos';

/**
 * Retorna o array de receitas favoritas salvas.
 */
function getFavoritos() {
    const salvo = localStorage.getItem(CHAVE_FAVORITOS);
    if (!salvo) return [];
    try { return JSON.parse(salvo); } catch { return []; }
}

/**
 * Salva o array de favoritos no localStorage.
 */
function salvarFavoritos(lista) {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
}

/**
 * Remove uma receita dos favoritos pelo id.
 */
function removerFavorito(id) {
    const lista = getFavoritos().filter(f => f.id !== id);
    salvarFavoritos(lista);
    renderizarFavoritos();
}

/**
 * Adiciona uma receita aos favoritos (chamado de receitas.html).
 */
function adicionarFavorito(receita) {
    const lista = getFavoritos();
    if (!lista.find(f => f.id === receita.id)) {
        lista.push(receita);
        salvarFavoritos(lista);
    }
}

/**
 * Gera o HTML de um card de receita favorita.
 */
function criarCardFavorito(receita) {
    const card = document.createElement('article');
    card.className = 'card-receita';
    card.innerHTML = `
        <div class="card-img-wrap">
            <img src="${receita.imagem || ''}" alt="${receita.nome}" loading="lazy">
        </div>
        <div class="card-body">
            <span class="card-tag">${receita.categoria || 'Receita'}</span>
            <h3 class="card-titulo">${receita.nome}</h3>
            <p class="card-desc">${receita.descricao || ''}</p>
            <button class="btn-desfavoritar" onclick="removerFavorito('${receita.id}')">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Remover dos favoritos
            </button>
        </div>
    `;
    return card;
}

/**
 * Renderiza todos os favoritos na grade ou mostra estado vazio.
 */
function renderizarFavoritos() {
    const grid = document.getElementById('favoritosGrid');
    const vazio = document.getElementById('favoritosVazio');
    const lista = getFavoritos();

    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.style.display = 'none';
        vazio.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        vazio.style.display = 'none';
        lista.forEach(r => grid.appendChild(criarCardFavorito(r)));
    }
}

/* ─── Inicializa ─── */
document.addEventListener('DOMContentLoaded', renderizarFavoritos);

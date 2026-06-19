// =============================================================
// main.js — O "GERENTE" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: inicializar o site na ordem certa.
//
// Esse é o único arquivo carregado pelo index.html.
// Ele não tem lógica própria — só chama funções dos outros
// arquivos no momento certo.
//
// ORDEM DE CARREGAMENTO no index.html (importante!):
//   1. api.js      → precisa estar pronto antes de todos
//   2. menu.js     → usa funções do api.js
//   3. carrinho.js → independente, mas carrega antes dos modais
//   4. modais.js   → usa addToCart() do carrinho.js
//   5. pedido.js   → usa cart e clearCart() do carrinho.js
//   6. main.js     → carregado por último, inicializa tudo
// =============================================================


document.addEventListener("DOMContentLoaded", function () {
    // DOMContentLoaded dispara quando o HTML terminou de carregar.
    // Só então é seguro buscar elementos e inicializar tudo.

    console.log("🚀 Iniciando Doce Expresso...");

    // 1. Atualiza o badge ABERTO/FECHADO no cabeçalho
    updateHeaderStatus();

    // 2. Desenha o cardápio na tela
    renderizarMenu();

    // 3. Atualiza o contador do carrinho (começa em 0)
    const cartCounter = document.getElementById("cart-count");
    if (cartCounter) cartCounter.innerHTML = 0;

    console.log("✅ Doce Expresso inicializado com sucesso!");
});


// -------------------------------------------------------------
// SINCRONIZAÇÃO ENTRE ABAS
// -------------------------------------------------------------
// O evento 'storage' dispara quando o localStorage muda em
// outra aba. Assim, quando o admin salva um produto ou muda
// o status da loja, o cardápio do cliente atualiza sozinho
// sem precisar recarregar a página.
// -------------------------------------------------------------
window.addEventListener('storage', (e) => {

    if (e.key === 'doceexpresso_menu' || e.key === 'doceexpresso_descontos') {
        console.log('🔄 Cardápio atualizado pelo admin, renderizando...');
        renderizarMenu();
    }

});
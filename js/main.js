document.addEventListener("DOMContentLoaded", async function () {
    console.log("Carregando dados do servidor...");

    await Promise.all([
        apiRefreshProdutos(),
        apiRefreshDescontos(),
        refreshStatusLoja(),
    ]);

    updateHeaderStatus();
    renderizarMenu();

    const cartCounter = document.getElementById("cart-count");
    if (cartCounter) cartCounter.innerHTML = 0;

    console.log("Doce Expresso inicializado com sucesso!");
});

// Sincroniza status da loja entre abas a cada 30s
setInterval(async () => {
    const anterior = _statusLoja;
    await refreshStatusLoja();
    if (_statusLoja !== anterior) updateHeaderStatus();
}, 30000);

window.addEventListener('storage', (e) => {
    if (e.key === 'doceexpresso_menu' || e.key === 'doceexpresso_descontos') {
        apiRefreshProdutos().then(() => {
            console.log('Cardapio atualizado, renderizando...');
            renderizarMenu();
        });
    }
});

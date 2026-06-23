document.addEventListener("DOMContentLoaded", async function () {
    console.log("Carregando dados do servidor...");

    await apiRefreshProdutos();
    await apiRefreshDescontos();

    updateHeaderStatus();
    renderizarMenu();

    const cartCounter = document.getElementById("cart-count");
    if (cartCounter) cartCounter.innerHTML = 0;

    console.log("Doce Expresso inicializado com sucesso!");
});

window.addEventListener('storage', (e) => {
    if (e.key === 'doceexpresso_menu' || e.key === 'doceexpresso_descontos') {
        apiRefreshProdutos().then(() => {
            console.log('Cardapio atualizado, renderizando...');
            renderizarMenu();
        });
    }
});

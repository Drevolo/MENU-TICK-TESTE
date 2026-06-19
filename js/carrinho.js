// =============================================================
// carrinho.js — A "CAIXINHA" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: controlar tudo que envolve o carrinho.
//   → Adicionar e remover itens
//   → Atualizar o visual do modal do carrinho
//   → Atualizar o contador do botão flutuante
//
// O que esse arquivo NÃO faz:
//   → Não envia pedido (isso é pedido.js)
//   → Não abre modal de adicionais/tamanhos (isso é modais.js)
//   → Não renderiza o menu (isso é menu.js)
// =============================================================


// -------------------------------------------------------------
// ESTADO DO CARRINHO
// -------------------------------------------------------------
// "estado" = os dados que mudam enquanto o usuário usa o site.
// O carrinho é um array de objetos, cada um assim:
//   { name: "Pote de Açaí", price: 18.00, quantity: 2 }
//
// ⚠️ Outros arquivos (modais.js, pedido.js) vão LER esse array.
//    Por isso ele fica aqui, num lugar só, e os outros importam.
// -------------------------------------------------------------
let cart = [];


// -------------------------------------------------------------
// AÇÕES DO CARRINHO
// -------------------------------------------------------------

/**
 * Adiciona um produto ao carrinho.
 * Se o produto já estiver lá, só aumenta a quantidade.
 *
 * @param {string} name  - Nome do produto (ex: "Pote de Açaí + [Granola, Banana]")
 * @param {number} price - Preço final do produto (já com desconto/tamanho)
 */
function addToCart(name, price) {
    if (!name || !price) return;

    const itemExistente = cart.find(item => item.name === name);

    if (itemExistente) {
        // Produto já está no carrinho — só aumenta a quantidade
        itemExistente.quantity += 1;
    } else {
        // Produto novo — adiciona ao array
        cart.push({ name, price, quantity: 1 });
    }

    // Atualiza o visual do carrinho após qualquer mudança
    updateCartModal();

    // Mostra um aviso verde no canto da tela (toast)
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: `"${name}" adicionado! 🛒`,
            duration: 3000,
            style: { background: "#16a34a", borderRadius: "8px", fontWeight: "500" }
        }).showToast();
    }
}

/**
 * Remove um produto do carrinho pelo nome.
 * Se a quantidade for maior que 1, só diminui.
 * Se for 1, remove o produto completamente.
 *
 * @param {string} name - Nome do produto a remover
 */
function removeItemCart(name) {
    if (!name) return;

    const index = cart.findIndex(item => item.name === name);
    if (index === -1) return; // produto não encontrado, não faz nada

    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        // splice(index, 1) remove 1 item na posição "index" do array
        cart.splice(index, 1);
    }

    updateCartModal();
}

/**
 * Esvazia o carrinho completamente.
 * Chamada pelo pedido.js após o pedido ser enviado com sucesso.
 */
function clearCart() {
    cart = [];
    updateCartModal();
}


// -------------------------------------------------------------
// VISUAL DO CARRINHO
// -------------------------------------------------------------

/**
 * Redesenha o conteúdo do modal do carrinho com os itens atuais.
 * Chamada sempre que o carrinho muda (add, remove, clear).
 */
function updateCartModal() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal          = document.getElementById("cart-total");
    const cartCounter        = document.getElementById("cart-count");

    // Atualiza o contador do botão flutuante (ex: "(3)")
    if (cartCounter) {
        const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);
        // reduce percorre o array somando as quantidades
        cartCounter.innerHTML = totalItens;
    }

    if (!cartItemsContainer) return;

    // Carrinho vazio — mostra mensagem
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="text-center text-gray-400 py-6">Seu carrinho está vazio 🛒</p>`;
        if (cartTotal) cartTotal.textContent = "R$ 0,00";
        return;
    }

    // Monta os itens do carrinho
    // Usamos o mesmo padrão do menu.js: array + join() em vez de innerHTML +=
    let total = 0;
    const itensHTML = cart.map(item => {
        total += item.price * item.quantity;

        return `
            <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                    <p class="font-medium text-gray-800">${item.name}</p>
                    <p class="text-sm text-gray-500">Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-1 text-green-700">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1
                               hover:bg-red-50 rounded transition"
                        data-name="${item.name}">
                    Remover
                </button>
            </div>`;
    }).join('');

    cartItemsContainer.innerHTML = itensHTML;

    if (cartTotal) {
        cartTotal.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
}


// -------------------------------------------------------------
// EVENT LISTENERS DO CARRINHO
// -------------------------------------------------------------
// Event listener = "ficar de olho em cliques/eventos".
// Colocamos todos aqui, num lugar só, fácil de achar.
// -------------------------------------------------------------

// Espera o HTML carregar completamente antes de buscar elementos
document.addEventListener("DOMContentLoaded", function () {

    const cartBtn            = document.getElementById("cart-btn");
    const cartModal          = document.getElementById("cart-modal");
    const cartItemsContainer = document.getElementById("cart-items");
    const closeModalBtn      = document.getElementById("close-modal-btn");

    // Botão flutuante — abre o modal do carrinho
    if (cartBtn) {
        cartBtn.addEventListener("click", function () {
            if (cartModal) cartModal.style.display = "flex";
            updateCartModal();
        });
    }

    // Clique fora do modal — fecha o modal
    if (cartModal) {
        cartModal.addEventListener("click", function (event) {
            // event.target é o elemento clicado
            // Se clicou no fundo escuro (o próprio cartModal), fecha
            if (event.target === cartModal) {
                cartModal.style.display = "none";
            }
        });
    }

    // Botão "Fechar" dentro do modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function () {
            if (cartModal) cartModal.style.display = "none";
        });
    }

    // Botões "Remover" dentro do carrinho
    // Usamos delegação: um listener no container escuta todos os botões filhos.
    // É mais eficiente que colocar um listener em cada botão individualmente.
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", function (event) {
            if (event.target.classList.contains("remove-from-cart-btn")) {
                const name = event.target.getAttribute("data-name");
                removeItemCart(name);
            }
        });
    }

});
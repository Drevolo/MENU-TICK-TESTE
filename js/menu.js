// =============================================================
// menu.js — O "PINTOR" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: buscar produtos e desenhar os cards na tela.
// Esse arquivo não sabe nada de carrinho, pedidos ou admin.
// Ele só lê produtos e monta o HTML do cardápio.
//
// Funções exportadas (usadas por outros arquivos):
//   → renderizarMenu()   chamada pelo main.js na inicialização
//   → scrollToCategory() chamada pelos links de navegação no HTML
// =============================================================


// -------------------------------------------------------------
// CONFIGURAÇÕES PADRÃO DE ADICIONAIS
// -------------------------------------------------------------
// Define quais adicionais cada categoria tem por padrão.
// O admin pode sobrescrever isso produto a produto.
// -------------------------------------------------------------
const CONFIG_ADICIONAIS = {
    potes: {
        minimo: 1,
        maximo: 5,
        opcoes: [
            { nome: "Banana",           preco: 0 },
            { nome: "Amendoim",         preco: 0 },
            { nome: "Calda de Morango", preco: 0 },
            { nome: "Cereja",           preco: 0 },
            { nome: "Chocobol",         preco: 0 },
            { nome: "Confete",          preco: 0 },
            { nome: "Creme de Ninho",   preco: 0 },
            { nome: "Creme de Avelã",   preco: 0 },
            { nome: "Creme de Paçoca",  preco: 0 },
            { nome: "Farinha Láctea",   preco: 0 },
            { nome: "Farofa de Amendoim", preco: 0 },
            { nome: "Granola",          preco: 0 },
            { nome: "Leite Condensado", preco: 0 },
            { nome: "Leite em Pó",      preco: 0 },
            { nome: "Uva",              preco: 0 }
        ]
    },
    copos: {
        minimo: 1,
        maximo: 5,
        opcoes: [
            { nome: "Banana",           preco: 0 },
            { nome: "Amendoim",         preco: 0 },
            { nome: "Calda de Morango", preco: 0 },
            { nome: "Cereja",           preco: 0 },
            { nome: "Chocobol",         preco: 0 },
            { nome: "Confete",          preco: 0 },
            { nome: "Creme de Ninho",   preco: 0 },
            { nome: "Creme de Avelã",   preco: 0 },
            { nome: "Creme de Paçoca",  preco: 0 },
            { nome: "Farinha Láctea",   preco: 0 },
            { nome: "Farofa de Amendoim", preco: 0 },
            { nome: "Granola",          preco: 0 },
            { nome: "Leite Condensado", preco: 0 },
            { nome: "Leite em Pó",      preco: 0 },
            { nome: "Uva",              preco: 0 }
        ]
    }
};

// -------------------------------------------------------------
// CONFIGURAÇÕES PADRÃO DE TAMANHOS (milkshakes)
// -------------------------------------------------------------
const CONFIG_TAMANHOS = {
    milkshakes: [
        { ml: 300, label: "300ml", acrescimo: 0    },
        { ml: 400, label: "400ml", acrescimo: 0.91 },
        { ml: 500, label: "500ml", acrescimo: 3.00 }
    ]
};

// -------------------------------------------------------------
// LABELS DAS CATEGORIAS
// -------------------------------------------------------------
// Aqui ficam os nomes "bonitos" de cada categoria.
// A ordem deste objeto é a ordem que aparece no cardápio.
// -------------------------------------------------------------
const LABELS_CATEGORIAS = {
    potes:             '🫙 Potes',
    copos:             '🧉 Copos',
    milkshakes:        '🥤 Milkshakes 300-500ml',
    milkshakesespecial:'🥤 Milkshakes Especial',
    picoles:           '🍦 Picolés',
};


// -------------------------------------------------------------
// UTILITÁRIOS LOCAIS
// -------------------------------------------------------------

/**
 * Escapa caracteres especiais de HTML para evitar bugs visuais
 * e problemas de segurança (XSS) ao exibir texto do usuário.
 *
 * Exemplo: "Sorvete <especial>" → "Sorvete &lt;especial&gt;"
 */
function _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Verifica se existe um desconto ativo hoje para uma categoria.
 *
 * @param {string} categoria - ex: "potes", "milkshakes"
 * @returns {Object|undefined} O desconto ativo, ou undefined se não houver
 */
function _getDescontoAtivo(categoria) {
    const hoje = new Date().toISOString().split('T')[0];
    // toISOString() retorna "2025-06-01T14:00:00Z", o split('T')[0] pega só "2025-06-01"

    return apiGetDescontos().find(d => {
        if (!d.active) return false;
        if (hoje < d.startDate || hoje > d.endDate) return false;
        return d.applyTo === 'all' || d.applyTo === `category:${categoria}`;
    });
}

/**
 * Calcula o preço final de um produto aplicando o desconto.
 *
 * @param {number} price    - Preço original
 * @param {Object} desconto - Objeto do desconto (pode ser undefined)
 * @returns {number} Preço final
 */
function _calcularPrecoFinal(price, desconto) {
    if (!desconto) return price;
    if (desconto.type === 'percent') {
        return price * (1 - desconto.value / 100);
    }
    return Math.max(0, price - desconto.value);
    // Math.max(0, ...) garante que o preço nunca fique negativo
}


// -------------------------------------------------------------
// CONSTRUÇÃO DOS CARDS
// -------------------------------------------------------------

/**
 * Cria o HTML de um card de produto.
 * Separamos em função própria para ficar mais fácil de editar
 * o visual de um card sem mexer na lógica do menu.
 *
 * @param {Object} p         - Produto
 * @param {Object} desconto  - Desconto ativo (pode ser undefined)
 * @returns {string} HTML do card
 */
function _criarCardProduto(p, desconto) {
    const precoFinal = _calcularPrecoFinal(p.price, desconto);
    const temDesconto = desconto && precoFinal < p.price;

    // Badge de desconto (só aparece se houver desconto)
    const badgeDesconto = temDesconto ? `
        <span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -${desconto.type === 'percent' ? desconto.value + '%' : 'R$' + desconto.value}
        </span>` : '';

    // Preço riscado (só aparece se houver desconto)
    const precoOriginal = temDesconto ? `
        <p class="text-xs text-gray-400 line-through">R$ ${p.price.toFixed(2)}</p>` : '';

    return `
        <div class="bg-white flex gap-2 p-2 rounded-lg border-l-4 border-yellow-300 shadow-lg hover:shadow-2xl transition-shadow duration-300 relative group">
            ${badgeDesconto}

            <img src="${p.imagem || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect fill=%27%23f3f4f6%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2760%27 text-anchor=%27middle%27 font-size=%2740%27 fill=%27%239ca3af%27%3E🍽%3C/text%3E%3C/svg%3E'}"
                 alt="${p.nome}"
                 class="w-24 h-24 sm:w-28 sm:h-28 rounded-md hover:scale-110 hover:-rotate-2 duration-300 object-cover">

            <div class="flex flex-col justify-between flex-grow">
                <div>
                    <p class="font-extrabold text-gray-800">${p.nome}</p>
                    <p class="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                        ${p.descricao ? _escapeHtml(p.descricao) : 'Sem descrição'}
                    </p>
                </div>

                <div class="flex items-center gap-2 justify-between mt-2">
                    <div class="flex flex-col">
                        ${precoOriginal}
                        <p class="font-extrabold text-xl ${temDesconto ? 'text-red-600' : 'text-green-700'}">
                            R$ ${precoFinal.toFixed(2)}
                        </p>
                    </div>

                    <button class="add-to-cart-btn bg-gray-900 hover:bg-gray-800 text-white border-l-4 border-b-4 border-orange-500 px-5 py-2 rounded-lg
                                   transition-all duration-300 hover:scale-110 active:scale-95 shadow-md"
                        data-name="${p.nome}"
                        data-price="${precoFinal}"
                        data-original="${p.price}"
                        data-categoria="${p.categoria}"
                        data-adicionais='${JSON.stringify(p.adicionais || null)}'
                        data-tamanhos='${JSON.stringify(p.tamanhos || null)}'>
                        <i class="fa fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>`;
}


// -------------------------------------------------------------
// FUNÇÃO PRINCIPAL
// -------------------------------------------------------------

/**
 * Lê os produtos do localStorage (via api.js) e desenha
 * todo o cardápio na tela, agrupado por categoria.
 *
 * Chamada pelo main.js na inicialização e sempre que o
 * localStorage for atualizado pelo admin.
 */
function renderizarMenu() {
    const menuContainer = document.getElementById("menu-container");

    if (!menuContainer) {
        console.warn('⚠️ Elemento #menu-container não encontrado no HTML');
        return;
    }

    // Pega só os produtos ativos
    const produtos = apiGetProdutos().filter(p => p.active);

    // Nenhum produto cadastrado ainda
    if (!produtos.length) {
        menuContainer.innerHTML = `
            <div class="text-center py-16 px-4">
                <div class="text-6xl mb-4">🥤</div>
                <p class="text-gray-500 text-lg">Cardápio em atualização</p>
                <p class="text-gray-400 text-sm mt-2">Volte em breve para ver nossas delícias!</p>
            </div>`;
        return;
    }

    // Agrupa produtos por categoria
    // Resultado: { potes: [...], copos: [...], milkshakes: [...] }
    const categorias = {};
    produtos.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    // Monta o esqueleto do HTML (seções e grids vazios)
    // Na ordem definida em LABELS_CATEGORIAS
    let html = '';
    Object.keys(LABELS_CATEGORIAS).forEach(cat => {
        if (!categorias[cat]) return; // pula categoria sem produtos

        html += `
            <div class="mx-auto max-w-7xl px-2 my-6" id="${cat}-section">
                <h2 class="inline-block font-bold text-xl md:text-2xl bg-gray-900 text-white px-6 py-3 border-l-4 border-orange-500 border-b-4 rounded-full shadow-lg">
                    ${LABELS_CATEGORIAS[cat]}
                </h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-2 mb-16" id="${cat}-grid"></div>`;
    });

    menuContainer.innerHTML = html;

    // Agora preenche cada grid com os cards
    // ✅ CORREÇÃO: usamos um array e join() em vez de innerHTML +=
    // innerHTML += redesenha a tela inteira a cada produto — lento e ruim.
    // Com array + join(), montamos tudo de uma vez e inserimos uma só vez.
    Object.keys(categorias).forEach(cat => {
        const grid = document.getElementById(`${cat}-grid`);
        if (!grid) return;

        const desconto = _getDescontoAtivo(cat);

        // Cria um array de HTMLs e junta tudo numa string só
        const cardsHTML = categorias[cat].map(p => _criarCardProduto(p, desconto)).join('');

        // Insere no DOM uma única vez por categoria ✅
        grid.innerHTML = cardsHTML;
    });

    console.log(`✅ Menu renderizado: ${produtos.length} produto(s)`);
}


// -------------------------------------------------------------
// NAVEGAÇÃO
// -------------------------------------------------------------

/**
 * Rola a página suavemente até a seção de uma categoria.
 * Chamada pelos links do <nav> no index.html.
 *
 * @param {string} categoria - ex: "potes", "milkshakes"
 */
function scrollToCategory(categoria) {
    const section = document.getElementById(`${categoria}-section`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Expõe ao HTML (os onclick= nas tags <a> precisam disso)
window.scrollToCategory = scrollToCategory;
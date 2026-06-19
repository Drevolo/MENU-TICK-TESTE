// =============================================================
// modais.js — As "JANELAS" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: controlar os modais de escolha do cliente.
//   → Modal de adicionais (potes e copos)
//   → Modal de tamanhos (milkshakes)
//
// Fluxo de uso:
//   1. Cliente clica em "adicionar" num produto
//   2. menu.js detecta o clique e chama openAdicionaisModal()
//      ou openTamanhoModal() dependendo da categoria
//   3. Cliente faz a escolha e confirma
//   4. modais.js chama addToCart() do carrinho.js
//
// O que esse arquivo NÃO faz:
//   → Não renderiza o menu (menu.js)
//   → Não gerencia o carrinho (carrinho.js)
//   → Não envia pedidos (pedido.js)
// =============================================================


// -------------------------------------------------------------
// ESTADO DOS MODAIS
// -------------------------------------------------------------
// Essas variáveis guardam o produto e as escolhas do cliente
// enquanto o modal está aberto.
// Quando o modal fecha, elas voltam para null/[].
// -------------------------------------------------------------
let produtoAtual         = null; // produto que o cliente está configurando
let adicionaisSelecionados = [];   // lista dos adicionais escolhidos
let tamanhoSelecionado   = null; // tamanho escolhido (milkshakes)


// =============================================================
// MODAL DE ADICIONAIS (Potes e Copos)
// =============================================================

/**
 * Abre o modal de adicionais para um produto.
 * Chamada pelo listener do menu (configurado no main.js).
 *
 * @param {Object} produto - Produto clicado, com: nome, price, categoria, adicionais
 */
function openAdicionaisModal(produto) {
    const adicionaisModal   = document.getElementById("adicionais-modal");
    const adicionaisList    = document.getElementById("adicionais-list");
    const adicionaisError   = document.getElementById("adicionais-error");
    const adicionaisConfirm = document.getElementById("adicionais-confirm");

    if (!adicionaisModal) return;

    // Guarda o produto atual para usar na confirmação
    produtoAtual = produto;
    adicionaisSelecionados = [];

    // Pega as opções do produto ou usa as opções padrão da categoria
    const config = CONFIG_ADICIONAIS[produto.categoria] || CONFIG_ADICIONAIS.potes;
    const opcoes  = produto.adicionais?.opcoes  || config.opcoes;
    const minimo  = produto.adicionais?.minimo  ?? config.minimo ?? 1;
    const maximo  = produto.adicionais?.maximo  ?? config.maximo ?? 5;
    // O operador "??" significa: "use o valor da esquerda, a não ser que seja null ou undefined"
    // É diferente de "||" que também substitui 0 e "" (string vazia)

    // Monta a lista de checkboxes
    adicionaisList.innerHTML = opcoes.map((adicional, index) => `
        <label class="adicional-item" data-index="${index}">
            <input type="checkbox" class="checkbox-adicional w-4 h-4" value="${index}">
            <div class="flex-1 pointer-events-none">
                <span class="font-medium">${adicional.nome}</span>
                <span class="text-sm text-gray-500 ml-2">
                    ${adicional.preco > 0 ? '+ R$ ' + adicional.preco.toFixed(2) : 'grátis'}
                </span>
            </div>
        </label>
    `).join('');

    // Reseta o contador e desabilita o botão confirmar
    _atualizarContadorAdicionais(0, minimo, maximo);
    if (adicionaisError)   adicionaisError.classList.add('hidden');
    if (adicionaisConfirm) adicionaisConfirm.disabled = true;

    // Adiciona listeners nos checkboxes recém-criados
    adicionaisList.querySelectorAll('.checkbox-adicional').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            // Marca/desmarca o estilo visual do item
            e.target.closest('.adicional-item')?.classList.toggle('selected', e.target.checked);
            _atualizarSelecaoAdicionais(minimo, maximo);
        });
    });

    // Permite clicar na linha inteira (não só no checkbox)
    adicionaisList.querySelectorAll('.adicional-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('checkbox-adicional')) return;
            const checkbox = item.querySelector('.checkbox-adicional');
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    });

    adicionaisModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // trava o scroll da página
}

/**
 * Fecha o modal de adicionais e reseta o estado.
 */
function closeAdicionaisModal() {
    const adicionaisModal = document.getElementById("adicionais-modal");
    if (!adicionaisModal) return;

    adicionaisModal.classList.add('hidden');
    document.body.style.overflow = ''; // libera o scroll da página

    // Desmarca todos os checkboxes visualmente
    adicionaisModal.querySelectorAll('.checkbox-adicional').forEach(cb => {
        cb.checked = false;
        cb.closest('.adicional-item')?.classList.remove('selected');
    });

    // Reseta o estado
    produtoAtual           = null;
    adicionaisSelecionados = [];
}

/**
 * Atualiza a lista de adicionais selecionados e o visual do contador.
 * Chamada toda vez que um checkbox muda.
 *
 * @param {number} minimo - Mínimo de adicionais exigido
 * @param {number} maximo - Máximo de adicionais permitido
 */
function _atualizarSelecaoAdicionais(minimo, maximo) {
    if (!produtoAtual) return;

    const adicionaisList    = document.getElementById("adicionais-list");
    const adicionaisError   = document.getElementById("adicionais-error");
    const adicionaisConfirm = document.getElementById("adicionais-confirm");

    // Lê os checkboxes marcados e monta o array de adicionais selecionados
    const config = CONFIG_ADICIONAIS[produtoAtual.categoria] || CONFIG_ADICIONAIS.potes;
    const opcoes = produtoAtual.adicionais?.opcoes || config.opcoes;

    adicionaisSelecionados = Array.from(
        adicionaisList.querySelectorAll('.checkbox-adicional:checked')
    ).map(cb => opcoes[cb.value]);
    // Array.from converte o NodeList (lista de elementos HTML) em array JS

    const qtd = adicionaisSelecionados.length;
    _atualizarContadorAdicionais(qtd, minimo, maximo);

    const dentroDoLimite = qtd >= minimo && qtd <= maximo;

    if (adicionaisConfirm) adicionaisConfirm.disabled = !dentroDoLimite;

    if (adicionaisError) {
        if (dentroDoLimite) {
            adicionaisError.classList.add('hidden');
        } else {
            adicionaisError.textContent = qtd < minimo
                ? `⚠️ Selecione pelo menos ${minimo} adicional!`
                : `⚠️ Máximo de ${maximo} adicionais permitido!`;
            adicionaisError.classList.remove('hidden');
        }
    }
}

/**
 * Atualiza o texto e a cor do contador de seleção.
 *
 * @param {number} selecionados - Quantidade atualmente selecionada
 * @param {number} minimo
 * @param {number} maximo
 */
function _atualizarContadorAdicionais(selecionados, minimo, maximo) {
    const adicionaisCounter = document.getElementById("adicionais-counter");
    if (!adicionaisCounter) return;

    adicionaisCounter.textContent = `${selecionados} selecionados (mín. ${minimo}, máx. ${maximo})`;

    // Verde se estiver dentro do limite, vermelho se não
    const valido = selecionados >= minimo && selecionados <= maximo;
    adicionaisCounter.className = `selection-counter ${valido ? 'valid' : 'invalid'}`;
}


// =============================================================
// MODAL DE TAMANHOS (Milkshakes)
// =============================================================

/**
 * Abre o modal de tamanhos para um milkshake.
 * Chamada pelo listener do menu (configurado no main.js).
 *
 * @param {Object} produto - Produto clicado, com: nome, price, categoria, tamanhos
 */
function openTamanhoModal(produto) {
    const tamanhoModal    = document.getElementById("tamanho-modal");
    const tamanhosList    = document.getElementById("tamanhos-list");
    const tamanhoPrecoBase  = document.getElementById("tamanho-preco-base");
    const tamanhoPrecoTotal = document.getElementById("tamanho-preco-total");
    const tamanhoConfirm  = document.getElementById("tamanho-confirm");

    if (!tamanhoModal) return;

    produtoAtual     = produto;
    tamanhoSelecionado = null;

    // Pega os tamanhos do produto ou usa os padrão da categoria
    const config   = CONFIG_TAMANHOS[produto.categoria] || CONFIG_TAMANHOS.milkshakes;
    const tamanhos = produto.tamanhos || config;

    // Mostra o preço base
    if (tamanhoPrecoBase)  tamanhoPrecoBase.textContent  = `R$ ${produto.price.toFixed(2)}`;
    if (tamanhoPrecoTotal) tamanhoPrecoTotal.textContent = `R$ ${produto.price.toFixed(2)}`;

    // Monta as opções de tamanho como radio buttons
    tamanhosList.innerHTML = tamanhos.map((tamanho, index) => `
        <label class="tamanho-option" data-index="${index}">
            <input type="radio" name="tamanho-milkshake" value="${index}" class="radio-tamanho w-4 h-4">
            <div class="flex-1 pointer-events-none">
                <span class="font-bold">${tamanho.label}</span>
                <span class="text-sm text-gray-500 ml-2">
                    ${tamanho.acrescimo > 0 ? `+ R$ ${tamanho.acrescimo.toFixed(2)}` : '(preço base)'}
                </span>
            </div>
        </label>
    `).join('');

    if (tamanhoConfirm) tamanhoConfirm.disabled = true;

    // Listener nos radio buttons — atualiza o preço total ao selecionar
    tamanhosList.querySelectorAll('.radio-tamanho').forEach(radio => {
        radio.addEventListener('change', () => {
            // Remove seleção visual de todos
            tamanhosList.querySelectorAll('.tamanho-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Marca o selecionado
            radio.closest('.tamanho-option')?.classList.add('selected');
            _atualizarSelecaoTamanho(tamanhos);
        });
    });

    // Permite clicar na linha inteira
    tamanhosList.querySelectorAll('.tamanho-option').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('radio-tamanho')) return;
            const radio = item.querySelector('.radio-tamanho');
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        });
    });

    tamanhoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o modal de tamanhos e reseta o estado.
 */
function closeTamanhoModal() {
    const tamanhoModal = document.getElementById("tamanho-modal");
    if (!tamanhoModal) return;

    tamanhoModal.classList.add('hidden');
    document.body.style.overflow = '';

    tamanhoModal.querySelectorAll('.radio-tamanho').forEach(radio => {
        radio.checked = false;
        radio.closest('.tamanho-option')?.classList.remove('selected');
    });

    produtoAtual       = null;
    tamanhoSelecionado = null;
}

/**
 * Atualiza o preço total exibido conforme o tamanho escolhido.
 *
 * @param {Array} tamanhos - Lista de tamanhos disponíveis
 */
function _atualizarSelecaoTamanho(tamanhos) {
    const tamanhoConfirm    = document.getElementById("tamanho-confirm");
    const tamanhoPrecoTotal = document.getElementById("tamanho-preco-total");

    const radioSelecionado = document.querySelector('#tamanhos-list .radio-tamanho:checked');

    if (!radioSelecionado || !produtoAtual) {
        if (tamanhoConfirm) tamanhoConfirm.disabled = true;
        return;
    }

    tamanhoSelecionado = tamanhos[radioSelecionado.value];

    const total = produtoAtual.price + (tamanhoSelecionado.acrescimo || 0);
    if (tamanhoPrecoTotal) {
        tamanhoPrecoTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
    if (tamanhoConfirm) {
        tamanhoConfirm.disabled = false;
    }
}


// =============================================================
// EVENT LISTENERS DOS MODAIS
// =============================================================

document.addEventListener("DOMContentLoaded", function () {

    const adicionaisModal   = document.getElementById("adicionais-modal");
    const adicionaisCancel  = document.getElementById("adicionais-cancel");
    const adicionaisConfirm = document.getElementById("adicionais-confirm");
    const tamanhoModal      = document.getElementById("tamanho-modal");
    const tamanhoCancel     = document.getElementById("tamanho-cancel");
    const tamanhoConfirm    = document.getElementById("tamanho-confirm");
    const menuContainer     = document.getElementById("menu-container");

    // ----- Botões de cancelar -----
    if (adicionaisCancel) adicionaisCancel.addEventListener('click', closeAdicionaisModal);
    if (tamanhoCancel)    tamanhoCancel.addEventListener('click', closeTamanhoModal);

    // ----- Fechar ao clicar fora (no fundo escuro) -----
    if (adicionaisModal) {
        adicionaisModal.addEventListener('click', (e) => {
            if (e.target === adicionaisModal) closeAdicionaisModal();
        });
    }
    if (tamanhoModal) {
        tamanhoModal.addEventListener('click', (e) => {
            if (e.target === tamanhoModal) closeTamanhoModal();
        });
    }

    // ----- Confirmar adicionais → adiciona ao carrinho -----
    if (adicionaisConfirm) {
        adicionaisConfirm.addEventListener('click', () => {
            if (!produtoAtual) return;

            const config = CONFIG_ADICIONAIS[produtoAtual.categoria] || CONFIG_ADICIONAIS.potes;
            const minimo = produtoAtual.adicionais?.minimo ?? config.minimo ?? 1;
            const maximo = produtoAtual.adicionais?.maximo ?? config.maximo ?? 5;
            const qtd    = adicionaisSelecionados.length;

            if (qtd < minimo || qtd > maximo) return;

            const nomesAdicionais = adicionaisSelecionados.map(a => a.nome).join(', ');
            const precoAdicionais = adicionaisSelecionados.reduce((sum, a) => sum + a.preco, 0);
            const precoFinal      = produtoAtual.price + precoAdicionais;

            // Chama addToCart do carrinho.js com o nome completo
            addToCart(`${produtoAtual.nome} + [${nomesAdicionais}]`, precoFinal);
            closeAdicionaisModal();
        });
    }

    // ----- Confirmar tamanho → adiciona ao carrinho -----
    if (tamanhoConfirm) {
        tamanhoConfirm.addEventListener('click', () => {
            if (!tamanhoSelecionado || !produtoAtual) return;

            const precoFinal = produtoAtual.price + (tamanhoSelecionado.acrescimo || 0);
            addToCart(`${produtoAtual.nome} - ${tamanhoSelecionado.label}`, precoFinal);
            closeTamanhoModal();
        });
    }

    // ----- Listener principal dos botões "+" do menu -----
    // Fica aqui porque é o modais.js quem decide qual modal abrir
    if (menuContainer) {
        menuContainer.addEventListener("click", function (event) {
            const btn = event.target.closest(".add-to-cart-btn");
            if (!btn) return;

            const name      = btn.getAttribute("data-name");
            const price     = parseFloat(btn.getAttribute("data-price"));
            const categoria = btn.getAttribute("data-categoria");

            if (!name || isNaN(price)) return;

            const produto = {
                nome:      name,
                price:     price,
                categoria: categoria,
                adicionais: JSON.parse(btn.getAttribute("data-adicionais") || "null"),
                tamanhos:   JSON.parse(btn.getAttribute("data-tamanhos")   || "null")
            };

            // Decide qual modal abrir dependendo da categoria
            if (categoria === 'potes' || categoria === 'copos') {
                openAdicionaisModal(produto);
            } else if (categoria === 'milkshakes') {
                openTamanhoModal(produto);
            } else {
                // Milkshakes especial, picolés etc. — vai direto pro carrinho
                addToCart(name, price);
            }
        });
    }

});

// Expõe as funções de fechar para os botões onclick= no HTML
window.closeAdicionaisModal = closeAdicionaisModal;
window.closeTamanhoModal    = closeTamanhoModal;
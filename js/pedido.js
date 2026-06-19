// =============================================================
// pedido.js — O "ENTREGADOR" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: pegar o carrinho pronto e enviar o pedido.
//   → Validar os campos do formulário (nome, endereço, etc.)
//   → Montar o objeto do pedido
//   → Salvar no banco via api.js
//   → Enviar mensagem pro WhatsApp da loja
//   → Limpar o carrinho após sucesso
//
// O que esse arquivo NÃO faz:
//   → Não gerencia o carrinho (carrinho.js)
//   → Não abre modais (modais.js)
//   → Não renderiza o menu (menu.js)
// =============================================================


// -------------------------------------------------------------
// CONFIGURAÇÃO
// -------------------------------------------------------------
// Número do WhatsApp da loja — só mude aqui se trocar o número.
// Formato: código do país + DDD + número (sem espaços ou traços)
// -------------------------------------------------------------
const NUMERO_WHATSAPP = "5562985044345";


// -------------------------------------------------------------
// STATUS DA LOJA
// -------------------------------------------------------------

/**
 * Verifica se a loja está aberta agora.
 * Primeiro checa se o admin forçou um status manual.
 * Se não, usa o horário automático (14h às 23h).
 *
 * @returns {boolean} true = aberta, false = fechada
 */
function checkOpen() {
    const statusManual = localStorage.getItem("statusLoja");

    if (statusManual === "fechado") return false;
    if (statusManual === "aberto")  return true;

    // Sem status manual: usa o horário
    const hora = new Date().getHours();
    return hora >= 14 && hora < 23;
}

/**
 * Atualiza o badge de status no cabeçalho (ABERTO/FECHADO).
 * Chamada pelo main.js na inicialização e quando o admin muda o status.
 */
function updateHeaderStatus() {
    const spanHora  = document.getElementById("date-span");
    const statusText = document.getElementById("status-text");

    if (!statusText || !spanHora) return;

    const isOpen = checkOpen();

    if (isOpen) {
        spanHora.classList.remove("bg-red-500");
        spanHora.classList.add("bg-green-600");
        statusText.innerText = "ABERTO ✅";
    } else {
        spanHora.classList.remove("bg-green-600");
        spanHora.classList.add("bg-red-500");
        statusText.innerText = "FECHADO 🔒";
    }
}


// -------------------------------------------------------------
// VALIDAÇÃO DO FORMULÁRIO
// -------------------------------------------------------------

/**
 * Valida os campos do formulário dentro do modal do carrinho.
 * Mostra mensagens de erro em vermelho para cada campo inválido.
 *
 * @returns {boolean} true = tudo preenchido, false = tem erro
 */
function _validarFormulario() {
    // Lê os elementos do formulário
    const clientNameInput   = document.getElementById("client-name");
    const clientNumberInput = document.getElementById("client-number");
    const addressInput      = document.getElementById("address");
    const paymentMethodInput = document.getElementById("payment-method");

    // Lê os elementos de aviso de erro
    const nameWarn   = document.getElementById("name-warn");
    const numberWarn = document.getElementById("number-warn");
    const addressWarn = document.getElementById("address-warn");

    let temErro = false;

    // Valida nome
    if (!clientNameInput?.value.trim()) {
        nameWarn?.classList.remove("hidden");
        temErro = true;
    } else {
        nameWarn?.classList.add("hidden");
    }

    // Valida número
    if (!clientNumberInput?.value.trim()) {
        numberWarn?.classList.remove("hidden");
        temErro = true;
    } else {
        numberWarn?.classList.add("hidden");
    }

    // Valida endereço
    if (!addressInput?.value.trim()) {
        addressWarn?.classList.remove("hidden");
        temErro = true;
    } else {
        addressWarn?.classList.add("hidden");
    }

    // Valida pagamento
    if (!paymentMethodInput?.value.trim()) {
        alert("Por favor, selecione uma forma de pagamento.");
        temErro = true;
    }

    return !temErro; // retorna true se NÃO tiver erro
}


// -------------------------------------------------------------
// WHATSAPP
// -------------------------------------------------------------

/**
 * Monta a mensagem e abre o WhatsApp da loja em nova aba.
 *
 * @param {Object} pedido - Objeto com todos os dados do pedido
 */
function _enviarParaWhatsApp(pedido) {
    // Formata cada item do carrinho como "• Nome do produto (qtd)"
    const itensFormatados = pedido.itens
        .split(" | ")
        .map(item => `• ${item.trim()}`)
        .join("\n");

    // Template da mensagem — edite o texto aqui se quiser mudar
    const mensagem = `
*🛒 NOVO PEDIDO*

👤 *Cliente:* ${pedido.cliente}
📱 *Número:* ${pedido.numero}
📍 *Endereço:* ${pedido.endereco}

🥤 *Itens:*
${itensFormatados}

💰 *Total:* ${pedido.total}
⏰ *Horário:* ${pedido.hora}
💳 *Pagamento:* ${pedido.pagamento}

_Obrigado pela preferência!_ 🙌
    `.trim();

    const numeroLimpo = NUMERO_WHATSAPP.replace(/\D/g, '');
    // /\D/g é uma expressão regular que remove tudo que não for dígito
    const url = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    // encodeURIComponent transforma espaços e caracteres especiais em código de URL

    const novaAba = window.open(url, "_blank");
    if (!novaAba) {
        alert("⚠️ Pop-up bloqueado! Permita pop-ups para o site e tente novamente.");
    }
}


// -------------------------------------------------------------
// FINALIZAR PEDIDO
// -------------------------------------------------------------

/**
 * Junta tudo: valida, monta o pedido, salva no banco e envia
 * pro WhatsApp. Chamada quando o cliente clica em "Finalizar Pedido".
 */
async function finalizarPedido() {
    // 1. Loja fechada?
    if (!checkOpen()) {
        Toastify({
            text: "Ops! A loja está fechada no momento. 🔒",
            duration: 5000,
            style: { background: "#ef4444", borderRadius: "8px" }
        }).showToast();
        return;
    }

    // 2. Carrinho vazio?
    // "cart" vem do carrinho.js — um dado, um dono
    if (cart.length === 0) {
        Toastify({
            text: "Seu carrinho está vazio! 🛒",
            duration: 3000,
            style: { background: "#f59e0b", borderRadius: "8px" }
        }).showToast();
        return;
    }

    // 3. Formulário válido?
    if (!_validarFormulario()) return;

    // 4. Lê os campos preenchidos
    const clientNameInput    = document.getElementById("client-name");
    const clientNumberInput  = document.getElementById("client-number");
    const addressInput       = document.getElementById("address");
    const paymentMethodInput = document.getElementById("payment-method");
    const cartTotal          = document.getElementById("cart-total");

    // 5. Monta o objeto do pedido
    const novoPedido = {
        cliente:  clientNameInput.value.trim(),
        numero:   clientNumberInput?.value.trim() || "Não informado",
        endereco: addressInput.value.trim(),
        itens:    cart.map(item => `${item.name} (${item.quantity})`).join(" | "),
        total:    cartTotal?.textContent || "R$ 0,00",
        hora:     new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        pagamento: paymentMethodInput?.value || "Não informado",
    };

    // 6. Salva no banco via api.js
    // "await" espera a resposta do servidor antes de continuar
    const resposta = await apiFinalizarPedido({
        cliente:  novoPedido.cliente,
        numero:   novoPedido.numero,
        endereco: novoPedido.endereco,
        itens:    cart,           // manda o array completo pro banco
        pagamento: novoPedido.pagamento
    });

    if (resposta.status !== "ok") {
        // Avisa o erro mas não impede o envio pelo WhatsApp
        // (o pedido ainda chega na loja, mesmo se o banco falhar)
        console.error("❌ Erro ao salvar no banco:", resposta.mensagem);
    }

    // 7. Envia pro WhatsApp
    _enviarParaWhatsApp(novoPedido);

    // 8. Sucesso — limpa tudo
    Toastify({
        text: "✅ Pedido enviado com sucesso!",
        duration: 4000,
        style: { background: "#16a34a", borderRadius: "8px" }
    }).showToast();

    // Limpa o formulário
    if (clientNameInput)   clientNameInput.value  = "";
    if (clientNumberInput) clientNumberInput.value = "";
    if (addressInput)      addressInput.value      = "";

    // Esvazia o carrinho (função do carrinho.js)
    clearCart();

    // Fecha o modal do carrinho
    const cartModal = document.getElementById("cart-modal");
    if (cartModal) cartModal.style.display = "none";
}


// -------------------------------------------------------------
// EVENT LISTENERS
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    const checkoutBtn = document.getElementById("checkout-btn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", finalizarPedido);
    }

    // Atualiza o badge de status quando o admin muda pelo outro navegador/aba
    window.addEventListener('storage', (e) => {
        if (e.key === 'statusLoja') {
            updateHeaderStatus();
        }
    });

});
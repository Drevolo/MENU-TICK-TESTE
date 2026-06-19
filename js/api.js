// =============================================================
// api.js — O "CARTEIRO" do projeto
// -------------------------------------------------------------
// RESPONSABILIDADE: toda e qualquer comunicação com o api.php
// passa por aqui. Nenhum outro arquivo deve usar fetch().
//
// Por que isso é bom?
//   → Se o endereço do PHP mudar, você muda só aqui (linha 16)
//   → Se precisar depurar um erro de rede, sabe onde olhar
//   → Código mais fácil de ler e de dividir entre o time
// =============================================================


// -------------------------------------------------------------
// CONFIGURAÇÃO
// Mude só aqui se o api.php mudar de lugar
// -------------------------------------------------------------
const API_URL = "./api.php";


// =============================================================
// PRODUTOS (localStorage — temporário até migrar pro banco)
// =============================================================

/**
 * Retorna todos os produtos salvos no navegador.
 * Futuramente isso virará um fetch() para o PHP.
 *
 * @returns {Array} Lista de produtos
 */
function apiGetProdutos() {
    try {
        const dados = localStorage.getItem('doceexpresso_menu');
        return dados ? JSON.parse(dados) : [];
    } catch {
        console.error("❌ Erro ao ler produtos do localStorage");
        return [];
    }
}

/**
 * Retorna todos os descontos salvos no navegador.
 *
 * @returns {Array} Lista de descontos
 */
function apiGetDescontos() {
    try {
        const dados = localStorage.getItem('doceexpresso_descontos');
        return dados ? JSON.parse(dados) : [];
    } catch {
        console.error("❌ Erro ao ler descontos do localStorage");
        return [];
    }
}

/**
 * Salva a lista de produtos no navegador.
 *
 * @param {Array} produtos - Lista de produtos para salvar
 */
function apiSalvarProdutos(produtos) {
    localStorage.setItem('doceexpresso_menu', JSON.stringify(produtos));
}

/**
 * Salva a lista de descontos no navegador.
 *
 * @param {Array} descontos - Lista de descontos para salvar
 */
function apiSalvarDescontos(descontos) {
    localStorage.setItem('doceexpresso_descontos', JSON.stringify(descontos));
}


// =============================================================
// PEDIDOS (comunicação real com o banco via PHP)
// =============================================================

/**
 * Envia um pedido novo para o banco de dados via PHP.
 *
 * @param {Object} dadosPedido - Dados do pedido:
 *   - cliente   {string} nome do cliente
 *   - numero    {string} telefone
 *   - endereco  {string} endereço de entrega
 *   - itens     {Array}  carrinho com os produtos
 *   - pagamento {string} forma de pagamento escolhida
 *
 * @returns {Promise<Object>} Resposta do servidor: { status, mensagem, id }
 */
async function apiFinalizarPedido(dadosPedido) {
    // "async" significa que a função vai esperar a resposta do servidor
    // antes de continuar. Sem isso, o código seguia em frente sem os dados.
    try {
        const resposta = await fetch(API_URL + "?rota=finalizar", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPedido)
            // JSON.stringify transforma o objeto JS em texto para enviar ao PHP
        });

        const dados = await resposta.json();
        // .json() transforma o texto que o PHP devolveu de volta em objeto JS

        return dados;

    } catch (erro) {
        console.error("❌ Erro ao finalizar pedido:", erro);
        // Retornamos um objeto padrão de erro para quem chamou a função
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}

/**
 * Busca todos os pedidos do banco de dados (usado no painel admin).
 *
 * @returns {Promise<Array>} Lista de pedidos ou [] em caso de erro
 */
async function apiListarPedidos() {
    try {
        const resposta = await fetch(API_URL + "?rota=listar");
        const dados = await resposta.json();

        if (dados.status !== "ok") {
            throw new Error(dados.mensagem);
        }

        return dados.pedidos;

    } catch (erro) {
        console.error("❌ Erro ao listar pedidos:", erro);
        return [];
    }
}

/**
 * Atualiza o status de um pedido no banco de dados.
 *
 * @param {number} id     - ID do pedido no banco
 * @param {string} status - Novo status: "novo" | "preparando" | "entregue" | "cancelado"
 *
 * @returns {Promise<Object>} Resposta do servidor: { status, mensagem }
 */
async function apiAtualizarStatus(id, status) {
    try {
        const resposta = await fetch(API_URL + "?rota=atualizar_status", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });

        return await resposta.json();

    } catch (erro) {
        console.error("❌ Erro ao atualizar status:", erro);
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}
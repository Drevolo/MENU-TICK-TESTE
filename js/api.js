const API_URL = "./api.php";

let _produtosCache = null;
let _descontosCache = null;

async function apiRefreshProdutos() {
    try {
        const res = await fetch(API_URL + "?rota=listar_produtos");
        const data = await res.json();
        if (data.status === "ok") {
            _produtosCache = data.produtos;
        }
    } catch (e) {
        console.error("Erro ao carregar produtos do servidor:", e);
    }
}

async function apiRefreshDescontos() {
    try {
        const res = await fetch(API_URL + "?rota=listar_descontos");
        const data = await res.json();
        if (data.status === "ok") {
            _descontosCache = data.descontos;
        }
    } catch (e) {
        console.error("Erro ao carregar descontos do servidor:", e);
    }
}

function apiGetProdutos() {
    return _produtosCache || [];
}

function apiGetDescontos() {
    return _descontosCache || [];
}

async function apiSalvarProdutos(produtos) {
    try {
        const res = await fetch(API_URL + "?rota=salvar_produtos", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produtos })
        });
        const data = await res.json();
        if (data.status === "ok") {
            _produtosCache = produtos;
        }
        return data;
    } catch (e) {
        console.error("Erro ao salvar produtos no servidor:", e);
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}

async function apiSalvarDescontos(descontos) {
    try {
        const res = await fetch(API_URL + "?rota=salvar_descontos", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descontos })
        });
        const data = await res.json();
        if (data.status === "ok") {
            _descontosCache = descontos;
        }
        return data;
    } catch (e) {
        console.error("Erro ao salvar descontos no servidor:", e);
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}

async function apiFinalizarPedido(dadosPedido) {
    try {
        const resposta = await fetch(API_URL + "?rota=finalizar", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPedido)
        });
        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao finalizar pedido:", erro);
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}

async function apiListarPedidos() {
    try {
        const resposta = await fetch(API_URL + "?rota=listar");
        const dados = await resposta.json();
        if (dados.status !== "ok") throw new Error(dados.mensagem);
        return dados.pedidos;
    } catch (erro) {
        console.error("Erro ao listar pedidos:", erro);
        return [];
    }
}

async function apiAtualizarStatus(id, status) {
    try {
        const resposta = await fetch(API_URL + "?rota=atualizar_status", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        return { status: "erro", mensagem: "Falha na conexão com o servidor." };
    }
}

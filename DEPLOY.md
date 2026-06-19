# 🚀 GUIA DE DEPLOY — Doce Expresso

## 📦 Deploy no Render (recomendado)

1. Faça o push do código para o GitHub
2. Acesse [dashboard.render.com](https://dashboard.render.com)
3. Clique em **New + → Blueprint**
4. Conecte o repositório
5. O Render lê o `render.yaml` e configura tudo automaticamente
6. Clique em **Apply**

> O Render cria o Web Service com Docker + SQLite embutido.
> Nenhum banco externo é necessário — sem custos adicionais.

---

## 📁 Estrutura do projeto

```
/
├── index.html          ← Cardápio (cliente)
├── admin.html          ← Painel administrativo
├── api.php             ← API em PHP com SQLite
├── js/                 ← Scripts modulares
│   ├── api.js
│   ├── menu.js
│   ├── carrinho.js
│   ├── modais.js
│   ├── pedido.js
│   └── main.js
├── admin.js
├── graficos.js
├── styles/output.css   ← CSS Tailwind compilado
├── assets/             ← Imagens dos produtos
├── data/               ← Banco SQLite (criado automaticamente)
├── Dockerfile          ← Build da imagem PHP+Apache
└── render.yaml         ← Config do Render
```

---

## 🗄️ Banco de Dados

O sistema usa **SQLite** — banco em arquivo local (`data/cardapio.sqlite`).

### Vantagens
- ✅ Não precisa contratar MySQL
- ✅ Criação automática da tabela na primeira execução
- ✅ Zero configuração

### ⚠️ Atenção
- No Render, o disco persistente é garantido pelo `disk:` configurado no `render.yaml`
- Em outras hospedagens, certifique-se de que a pasta `data/` tenha permissão de escrita

---

## ✅ Testar

Após o deploy, acesse:

```
https://seu-site.onrender.com/api.php?rota=listar
```

Deve retornar:
```json
{"status":"ok","pedidos":[]}
```

---

## ❗ Problemas comuns

**Erro 500 no api.php**
→ Verifique os logs no Render Dashboard

**Imagens não aparecem**
→ Confira se a pasta `assets/` está no repositório

**Tailwind sem estilo**
→ O arquivo `styles/output.css` já está compilado e incluso

# Guia de Deploy — Doce Expresso

## Testar Localmente

### Pré-requisitos
- PHP 8.x com extensão `pdo_sqlite`
- Git

### Passos
```bash
php -S localhost:8000
```

Abrir http://localhost:8000 (cardápio) e http://localhost:8000/admin.html (admin — senha: 1234)

Para popular dados iniciais, acesse http://localhost:8000/seed.php

---

## Deploy Gratuito — InfinityFree

### 1. Criar conta
Acesse [infinityfree.com](https://infinityfree.com) e crie uma conta gratuita.

### 2. Criar site
No painel: **Accounts → Add hosting account**
- **Domain:** `seudominio.infinityfreeapp.com`
- **Admin email:** seu e-mail
- **Password:** sua senha

### 3. Conectar GitHub (deploy automático)
No repositório do GitHub: **Settings → Secrets and variables → Actions**
Adicione 3 secrets:

| Nome | Valor |
|---|---|
| `FTP_HOST` | `ftpupload.net` |
| `FTP_USER` | seu usuário (ex: `if0_xxxxx`) |
| `FTP_PASSWORD` | sua senha |

Done push na branch `main` → deploy automático via GitHub Actions.

### 4. Popular dados iniciais
```
https://seudominio.infinityfreeapp.com/seed.php
```

### 5. Pronto!
```
https://seudominio.infinityfreeapp.com            (cardápio)
https://seudominio.infinityfreeapp.com/admin.html  (admin — senha: 1234)
```

> ⚠️ A pasta `data/` precisa de permissão de escrita. Se erro 500 no `api.php`, ajuste pelo cPanel: **File Manager → data/ → Permissões → 755**.

---

## Estrutura do Projeto

```
/
├── index.html              ← Cardápio (cliente)
├── admin.html              ← Painel administrativo
├── api.php                 ← API REST com SQLite (PDO)
├── seed.php                ← Popula dados iniciais
├── start.ps1               ← Script servidor local (Windows)
├── .htaccess               ← Regras Apache (HTTPS)
├── .github/workflows/
│   └── deploy.yml          ← GitHub Actions (FTP automático)
│
├── js/                     ← Scripts do projeto
│   ├── api.js              ← Comunicação com backend
│   ├── menu.js             ← Renderização do cardápio
│   ├── carrinho.js         ← Lógica do carrinho
│   ├── modais.js           ← Modais de adicionais/tamanhos
│   ├── pedido.js           ← Finalização de pedidos
│   ├── main.js             ← Inicializador do cliente
│   ├── admin.js            ← Lógica do painel admin
│   └── graficos.js         ← Gráficos Chart.js
│
├── styles/
│   ├── style.css           ← Entrada Tailwind (compile com: npm run dev)
│   └── output.css          ← CSS compilado
│
├── assets/                 ← Imagens dos produtos
└── data/
    └── .htaccess           ← Protege o banco SQLite
```

## Banco de Dados

SQLite com PDO — arquivo local (`data/cardapio.sqlite`).

### Tabelas
- **pedidos** — Pedidos dos clientes (com retry automático em falha de rede)
- **produtos** — Cardápio (imagens comprimidas em WebP via Canvas)
- **descontos** — Promoções ativas
- **config** — Configurações (ex: status aberto/fechado)

### Verificar API
```
https://seudominio.infinityfreeapp.com/api.php?rota=listar_produtos
```

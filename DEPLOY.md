# Guia de Deploy — Doce Expresso

## Testar Localmente (desenvolvimento)

### Pré-requisitos
- PHP 8.x (com extensão SQLite)
- Git

### Passos
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo

# 2. Inicie o servidor PHP local
powershell -ExecutionPolicy Bypass -File start.ps1

# 3. Popule o banco com dados iniciais (em outro terminal)
php seed.php

# 4. Acesse no navegador
#    http://localhost:8000
#    http://localhost:8000/admin.html  (senha: 1234)
```

## Deploy Gratuito

### Opção 1: Render (recomendado — Docker + SQLite)

1. Crie um repositório no GitHub e faça push do código
2. Acesse [dashboard.render.com](https://dashboard.render.com)
3. Clique em **New + → Blueprint**
4. Conecte seu repositório
5. O Render lê automaticamente o `render.yaml` e configura tudo
6. Clique em **Apply**

> O Render cria um Web Service com Docker + disco persistente.
> O banco SQLite fica no disco persistente e não perde dados entre deploys.

### Opção 2: InfinityFree (PHP gratuito — sem Docker)

1. Faça upload de todos os arquivos via FTP para sua hospedagem InfinityFree
2. Acesse `https://seudominio.infinityfreeapp.com/seed.php` para popular os dados
3. Pronto! O site já funciona

### Opção 3: Vercel / Netlify (estático — experimental)

O site **não** funciona diretamente no Vercel/Netlify porque precisa de PHP.
Use a versão Docker + Render (recomendado) ou hospedagem PHP tradicional.

## Estrutura do Projeto

```
/
├── index.html          ← Cardápio (cliente)
├── admin.html          ← Painel administrativo
├── api.php             ← API REST com SQLite
├── seed.php            ← Popula dados iniciais
├── start.ps1           ← Script para servidor local (Windows)
├── Dockerfile          ← Build da imagem PHP+Apache
├── render.yaml         ← Config do Render
├── js/                 ← Scripts modulares
│   ├── api.js          ← Comunicação com backend
│   ├── menu.js         ← Renderização do cardápio
│   ├── carrinho.js     ← Lógica do carrinho
│   ├── modais.js       ← Modais de adicionais/tamanhos
│   ├── pedido.js       ← Finalização de pedidos
│   └── main.js         ← Inicializador
├── admin.js            ← Lógica do painel admin
├── graficos.js         ← Gráficos Chart.js
├── styles/output.css   ← CSS Tailwind compilado
├── assets/             ← Imagens
└── data/               ← Banco SQLite (criado automaticamente)
```

## Banco de Dados

O sistema usa **SQLite** — banco em arquivo local.

### Tabelas
- **pedidos** — Pedidos dos clientes
- **produtos** — Cardápio (gerenciado pelo admin)
- **descontos** — Promoções ativas

### Seed de Dados
```bash
php seed.php
```

### Verificar se a API está funcionando
```
https://seu-site.onrender.com/api.php?rota=listar_produtos
```

Deve retornar:
```json
{"status":"ok","produtos":[...]}
```

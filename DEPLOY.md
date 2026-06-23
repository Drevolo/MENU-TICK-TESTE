# Guia de Deploy — Doce Expresso

## Testar Localmente

### Pré-requisitos
- PHP 8.x com extensão `pdo_sqlite`
- Git

### Passos
```bash
# 1. Iniciar servidor PHP embutido
php -S localhost:8000

# 2. Popular dados iniciais (outro terminal)
php seed.php

# 3. Acessar
#    http://localhost:8000           (cardápio)
#    http://localhost:8000/admin.html (admin — senha: 1234)
```

Também funciona com o `start.ps1` no PowerShell:
```powershell
.\start.ps1
```

---

## Deploy Gratuito — InfinityFree (recomendado)

### Por que InfinityFree?
- PHP 8.x com SQLite nativo ✔️
- Painel cPanel fácil
- Tráfego ilimitado
- Sem propagandas obrigatórias
- Perfeito para projetos PHP + SQLite

### Passo a passo

#### 1. Criar conta
Acesse [infinityfree.com](https://infinityfree.com) e crie uma conta gratuita.

#### 2. Criar site
No painel, clique em **Accounts → Add hosting account** e preencha:
- **Domain:** escolha `seudominio.infinityfreeapp.com`
- **Admin email:** seu e-mail
- **Password:** sua senha

#### 3. Upload dos arquivos via FTP
Use FileZilla ou qualquer cliente FTP:

| Configuração | Valor |
|---|---|
| Servidor | `ftp.infinityfree.com` |
| Usuário | seu usuário (no e-mail de confirmação) |
| Senha | a que você criou |
| Pasta | `htdocs/` (é a raiz do site) |

Faça upload de **todos os arquivos do projeto** para `htdocs/`.

#### 4. Popular dados iniciais
Acesse no navegador:
```
https://seudominio.infinityfreeapp.com/seed.php
```
Deve retornar:
```json
{"status":"ok","mensagem":"Banco populado com 20 produtos!"}
```

#### 5. Pronto!
```
https://seudominio.infinityfreeapp.com            (cardápio)
https://seudominio.infinityfreeapp.com/admin.html  (admin — senha: 1234)
```

> ⚠️ A pasta `data/` precisa ter permissão de escrita. Em geral o InfinityFree já cria com as permissões corretas. Se der erro 500 no `api.php`, ajuste pelo cPanel: **File Manager → data/ → Permissões → 755**.

---

## Estrutura do Projeto

```
/
├── index.html          ← Cardápio (cliente)
├── admin.html          ← Painel administrativo
├── api.php             ← API REST com SQLite (PDO)
├── seed.php            ← Popula dados iniciais
├── start.ps1           ← Script para servidor local (Windows)
├── .htaccess           ← Regras Apache (HTTPS)
├── data/
│   └── .htaccess       ← Protege o banco SQLite
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
└── assets/             ← Imagens dos produtos
```

## Banco de Dados

O sistema usa **SQLite** com PDO — banco em arquivo local (`data/cardapio.sqlite`).

### Tabelas
- **pedidos** — Pedidos dos clientes
- **produtos** — Cardápio (gerenciado pelo admin)
- **descontos** — Promoções ativas

### Seed
```bash
php seed.php
# ou acesse no navegador: /seed.php
```

### Verificar API
```
https://seudominio.infinityfreeapp.com/api.php?rota=listar_produtos
```
Deve retornar:
```json
{"status":"ok","produtos":[...]}
```

## Alternativas gratuitas
- **000WebHost** — Mesmo esquema, upload via FTP
- **Byet.host** — Mesmo esquema
- **AwardSpace** — PHP + SQLite, 1GB de espaço

# 🚀 GUIA DE DEPLOY — Doce Expresso

## 📁 Estrutura de arquivos para enviar

```
/
├── index.html
├── admin.html
├── api.php
├── js/                   ← Scripts modulares do cardápio
│   ├── api.js
│   ├── menu.js
│   ├── carrinho.js
│   ├── modais.js
│   ├── pedido.js
│   └── main.js
├── admin.js              ← Painel administrativo
├── graficos.js           ← Gráficos e relatórios
├── styles/
│   └── output.css        ← CSS gerado pelo Tailwind (não envie style.css)
└── assets/
    ├── doceexpresso.jpg
    └── bg.png
```

---

## 🏠 Hospedagens recomendadas (PHP + MySQL)

| Hospedagem     | Plano mínimo | Observação                        |
|----------------|--------------|-----------------------------------|
| **Hostinger**  | Web Starter  | Mais barata, fácil de usar        |
| **KingHost**   | PHP Basic    | Boa para Brasil, suporte PT-BR    |
| **LocaWeb**    | Starter      | Confiável, datacenter no Brasil   |
| **Umbler**     | Basic        | Interface moderna                 |

> ✅ Qualquer hospedagem com **PHP 7.4+** e **MySQL 5.7+** funciona.

---

## 🗄️ PASSO 1 — Criar o banco de dados

1. Acesse o **phpMyAdmin** da sua hospedagem (geralmente em painel → MySQL → phpMyAdmin)
2. Clique em **"Novo"** para criar um banco
3. Dê o nome `cardapio` e clique em **Criar**
4. Com o banco selecionado, clique na aba **SQL**
5. Cole e execute o conteúdo do arquivo `instalar_banco.sql`

---

## ⚙️ PASSO 2 — Configurar credenciais no api.php

Abra o `api.php` e edite as linhas no bloco de configuração:

```php
$host     = getenv('DB_HOST')     ?: "localhost";
$user     = getenv('DB_USER')     ?: "SEU_USUARIO_MYSQL";
$password = getenv('DB_PASSWORD') ?: "SUA_SENHA_MYSQL";
$database = getenv('DB_NAME')     ?: "cardapio";
```

> ⚠️ As credenciais ficam no painel da hospedagem em:
> **MySQL → Usuários** ou **Banco de Dados → Detalhes**

---

## 📤 PASSO 3 — Enviar os arquivos

### Via Gerenciador de Arquivos (mais fácil):
1. Acesse o **cPanel / Painel de controle** da hospedagem
2. Abra o **Gerenciador de Arquivos**
3. Entre na pasta `public_html`
4. Faça upload de **todos os arquivos e pastas** do projeto

### Via FTP (alternativa):
- Use o **FileZilla** (gratuito)
- Host: `ftp.seudominio.com.br`
- Usuário e senha: fornecidos pela hospedagem
- Pasta destino: `/public_html/`

---

## 🔒 PASSO 4 — Criar arquivo .htaccess (segurança)

Crie um arquivo chamado `.htaccess` na raiz com este conteúdo:

```apache
# Bloqueia acesso direto a arquivos sensíveis
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Redireciona HTTP para HTTPS (se tiver SSL)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ✅ PASSO 5 — Testar

Após o upload, acesse:

```
https://seudominio.com.br/api.php?rota=listar
```

Deve retornar:
```json
{"status":"ok","pedidos":[]}
```

Se aparecer isso, está funcionando! Acesse o site normalmente.

---

## ❗ Problemas comuns

**Erro 500 no api.php**
→ Verifique as credenciais do banco de dados no `api.php`

**"Erro ao carregar pedidos"**
→ Verifique se o banco foi criado e o SQL executado corretamente

**Imagens não aparecem**
→ Certifique-se de que a pasta `assets/` foi enviada com as imagens

**Tailwind sem estilo**
→ Envie o arquivo `styles/output.css` — é ele que contém todo o CSS compilado

-- =============================================
-- 🗄️ INSTALAÇÃO DO BANCO DE DADOS
-- Doce Expresso — Cardápio Online
-- =============================================
-- Execute este arquivo no phpMyAdmin ou MySQL CLI

CREATE DATABASE IF NOT EXISTS cardapio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cardapio;

CREATE TABLE IF NOT EXISTS pedidos (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    cliente    VARCHAR(100)  NOT NULL,
    numero     VARCHAR(20)   NOT NULL DEFAULT 'Não informado',
    endereco   VARCHAR(255)  NOT NULL,
    itens      JSON          NOT NULL,
    total      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pagamento  VARCHAR(50)   NOT NULL DEFAULT 'Não informado',
    status     VARCHAR(20)   NOT NULL DEFAULT 'novo',
    criado_em  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Verifique se criou corretamente:
DESCRIBE pedidos;

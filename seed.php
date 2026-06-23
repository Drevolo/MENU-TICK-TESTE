<?php
header("Content-Type: application/json; charset=utf-8");

$dbDir  = __DIR__ . '/data';
$dbPath = $dbDir . '/cardapio.sqlite';

if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

try {
    $conn = new PDO("sqlite:$dbPath");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "erro", "mensagem" => "Erro ao conectar: " . $e->getMessage()]);
    exit;
}

$conn->exec("CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, cliente TEXT NOT NULL, numero TEXT NOT NULL DEFAULT 'Não informado',
    endereco TEXT NOT NULL, itens TEXT NOT NULL, total REAL NOT NULL DEFAULT 0.00,
    pagamento TEXT NOT NULL DEFAULT 'Não informado', status TEXT NOT NULL DEFAULT 'novo',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)");
$conn->exec("CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, price REAL NOT NULL DEFAULT 0,
    categoria TEXT NOT NULL, imagem TEXT DEFAULT '', descricao TEXT DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1, adicionais TEXT, tamanhos TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)");
$conn->exec("CREATE TABLE IF NOT EXISTS descontos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'percent',
    value REAL NOT NULL DEFAULT 0, applyTo TEXT NOT NULL DEFAULT 'all',
    startDate TEXT NOT NULL, endDate TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$conn->exec("DELETE FROM produtos");
$conn->exec("DELETE FROM descontos");

$adicionais = json_encode(['obrigatorios' => 5, 'opcoes' => [
    ['nome' => 'Banana', 'preco' => 0], ['nome' => 'Amendoim', 'preco' => 0],
    ['nome' => 'Calda de Morango', 'preco' => 0], ['nome' => 'Cereja', 'preco' => 0],
    ['nome' => 'Chocobol', 'preco' => 0], ['nome' => 'Confete', 'preco' => 0],
    ['nome' => 'Creme de Ninho', 'preco' => 0], ['nome' => 'Creme de Avelã', 'preco' => 0],
    ['nome' => 'Creme de Paçoca', 'preco' => 0], ['nome' => 'Farinha Láctea', 'preco' => 0],
    ['nome' => 'Farofa de Amendoim', 'preco' => 0], ['nome' => 'Granola', 'preco' => 0],
    ['nome' => 'Leite Condensado', 'preco' => 0], ['nome' => 'Leite em Pó', 'preco' => 0],
    ['nome' => 'Uva', 'preco' => 0],
]], JSON_UNESCAPED_UNICODE);

$tamanhos = json_encode([
    ['ml' => 300, 'label' => '300ml', 'acrescimo' => 0],
    ['ml' => 400, 'label' => '400ml', 'acrescimo' => 0.91],
    ['ml' => 500, 'label' => '500ml', 'acrescimo' => 3.00],
]);

$produtos = [
    ['Pote de Açaí (300ml)', 16.00, 'potes', 'assets/pote1.png', 'Açaí cremoso no pote de 300ml', $adicionais],
    ['Pote de Açaí (500ml)', 22.00, 'potes', 'assets/pote2.png', 'Açaí cremoso no pote de 500ml', $adicionais],
    ['Copo de Açaí (300ml)', 14.00, 'copos', 'assets/Copo.png', 'Açaí cremoso no copo de 300ml', $adicionais],
    ['Copo de Açaí (500ml)', 19.00, 'copos', 'assets/Copo.png', 'Açaí cremoso no copo de 500ml', $adicionais],
    ['Milkshake de Chocolate', 14.00, 'milkshakes', 'assets/mschocolate.png', 'Milkshake cremoso de chocolate', $tamanhos],
    ['Milkshake de Morango', 14.00, 'milkshakes', 'assets/msmorango.png', 'Milkshake cremoso de morango', $tamanhos],
    ['Milkshake de Banana com Nutella', 16.00, 'milkshakes', 'assets/msbanofe.png', 'Milkshake de banana com Nutella', $tamanhos],
    ['Milkshake de Ninho', 15.00, 'milkshakes', 'assets/msninho.png', 'Milkshake cremoso de leite Ninho', $tamanhos],
    ['Milkshake Ninho com Morango', 16.00, 'milkshakes', 'assets/msnmorango.png', 'Milkshake de Ninho com morango', $tamanhos],
    ['Milkshake de Oreo', 15.00, 'milkshakes', 'assets/msoreo.png', 'Milkshake cremoso com biscoito Oreo', $tamanhos],
    ['Milkshake de Paçoca', 14.00, 'milkshakes', 'assets/mspaçoca.png', 'Milkshake cremoso de paçoca', $tamanhos],
    ['Milkshake de Capuccino', 15.00, 'milkshakes', 'assets/mscapuccino.png', 'Milkshake cremoso de capuccino', $tamanhos],
    ['Milkshake de Maracujá', 14.00, 'milkshakes', 'assets/msmaracuja.png', 'Milkshake cremoso de maracujá', $tamanhos],
    ['Milkshake de Limão', 14.00, 'milkshakes', 'assets/mslimao.png', 'Milkshake cremoso de limão', $tamanhos],
    ['Milkshake de Ovomaltine', 15.00, 'milkshakes', 'assets/msovomaltine.png', 'Milkshake cremoso de Ovomaltine', $tamanhos],
    ['Milkshake Especial de Chocolate', 19.00, 'milkshakesespecial', 'assets/mschocolate.png', 'Milkshake especial de chocolate', $tamanhos],
    ['Milkshake Especial de Ninho', 20.00, 'milkshakesespecial', 'assets/msninho.png', 'Milkshake especial de Ninho', $tamanhos],
    ['Picolé de Chocolate', 5.00, 'picoles', 'assets/picole1.png', 'Picolé cremoso de chocolate', null],
    ['Picolé de Morango', 5.00, 'picoles', 'assets/picole2.png', 'Picolé cremoso de morango', null],
    ['Picolé de Creme', 5.00, 'picoles', 'assets/picole3.png', 'Picolé cremoso de creme', null],
];

$stmt = $conn->prepare("INSERT INTO produtos (nome, price, categoria, imagem, descricao, adicionais, tamanhos, active)
                        VALUES (:nome, :price, :categoria, :imagem, :descricao, :adicionais, :tamanhos, 1)");

foreach ($produtos as $p) {
    $stmt->execute([
        ':nome'       => $p[0],
        ':price'      => $p[1],
        ':categoria'  => $p[2],
        ':imagem'     => $p[3],
        ':descricao'  => $p[4],
        ':adicionais' => ($p[2] === 'potes' || $p[2] === 'copos') ? $p[5] : null,
        ':tamanhos'   => (strpos($p[2], 'milkshake') === 0) ? $p[5] : null,
    ]);
}

echo json_encode([
    "status" => "ok",
    "mensagem" => "Banco populado com " . count($produtos) . " produtos!",
], JSON_UNESCAPED_UNICODE);

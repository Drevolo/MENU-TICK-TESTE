<?php
header("Content-Type: application/json");

// ⚠️ Em produção, troque * pelo domínio real do seu site
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// =============================================
// 🗄️ CONFIGURAÇÃO SQLITE
// =============================================
// O banco fica num arquivo local — sem precisar de MySQL.
// Dados persistem enquanto o servidor não for reinstalado.
// =============================================
$dbDir  = __DIR__ . '/data';
$dbPath = $dbDir . '/cardapio.sqlite';

if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

$conn = new SQLite3($dbPath);
$conn->enableExceptions(true);

// Cria a tabela na primeira execução
$conn->exec("CREATE TABLE IF NOT EXISTS pedidos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente    TEXT    NOT NULL,
    numero     TEXT    NOT NULL DEFAULT 'Não informado',
    endereco   TEXT    NOT NULL,
    itens      TEXT    NOT NULL,
    total      REAL    NOT NULL DEFAULT 0.00,
    pagamento  TEXT    NOT NULL DEFAULT 'Não informado',
    status     TEXT    NOT NULL DEFAULT 'novo',
    criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// =============================================

$rota = $_GET['rota'] ?? '';

// ============================
// ✅ ROTA: FINALIZAR PEDIDO
// ============================
if ($rota === "finalizar") {

    $input = json_decode(file_get_contents("php://input"), true);

    $cliente   = trim($input['cliente']   ?? '');
    $numero    = trim($input['numero']    ?? 'Não informado');
    $endereco  = trim($input['endereco']  ?? '');
    $itens     = $input['itens']          ?? [];
    $pagamento = trim($input['pagamento'] ?? 'Não informado');

    if (!$cliente || !$endereco || empty($itens)) {
        echo json_encode([
            "status"   => "erro",
            "mensagem" => "Dados incompletos"
        ]);
        exit;
    }

    $itensJson = json_encode($itens, JSON_UNESCAPED_UNICODE);

    $total = 0;
    foreach ($itens as $item) {
        $total += ($item['price'] ?? 0) * ($item['quantity'] ?? 1);
    }

    $stmt = $conn->prepare("INSERT INTO pedidos (cliente, numero, endereco, itens, total, pagamento)
                            VALUES (:cliente, :numero, :endereco, :itens, :total, :pagamento)");
    $stmt->bindValue(':cliente',   $cliente,   SQLITE3_TEXT);
    $stmt->bindValue(':numero',    $numero,    SQLITE3_TEXT);
    $stmt->bindValue(':endereco',  $endereco,  SQLITE3_TEXT);
    $stmt->bindValue(':itens',     $itensJson, SQLITE3_TEXT);
    $stmt->bindValue(':total',     $total,     SQLITE3_FLOAT);
    $stmt->bindValue(':pagamento', $pagamento, SQLITE3_TEXT);
    $stmt->execute();

    echo json_encode([
        "status"   => "ok",
        "mensagem" => "Pedido salvo com sucesso",
        "id"       => $conn->lastInsertRowID()
    ]);
    exit;
}

// ============================
// 📋 ROTA: LISTAR PEDIDOS
// ============================
if ($rota === "listar") {

    $result = $conn->query("SELECT * FROM pedidos ORDER BY id DESC");

    $pedidos = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $row['itens'] = json_decode($row['itens'], true);
        $pedidos[] = $row;
    }

    echo json_encode([
        "status"  => "ok",
        "pedidos" => $pedidos
    ]);
    exit;
}

// ============================
// 🔄 ROTA: ATUALIZAR STATUS
// ============================
if ($rota === "atualizar_status") {

    $input  = json_decode(file_get_contents("php://input"), true);
    $id     = intval($input['id']     ?? 0);
    $status = trim($input['status']   ?? '');

    $statusPermitidos = ['novo', 'preparando', 'entregue', 'cancelado'];

    if (!$id || !in_array($status, $statusPermitidos)) {
        echo json_encode([
            "status"   => "erro",
            "mensagem" => "Dados inválidos"
        ]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE pedidos SET status = :status WHERE id = :id");
    $stmt->bindValue(':status', $status, SQLITE3_TEXT);
    $stmt->bindValue(':id',     $id,     SQLITE3_INTEGER);
    $stmt->execute();

    echo json_encode([
        "status"   => "ok",
        "mensagem" => "Status atualizado para: $status"
    ]);
    exit;
}

// ============================
// ❌ ROTA INVÁLIDA
// ============================
echo json_encode([
    "status"   => "erro",
    "mensagem" => "Rota inválida"
]);

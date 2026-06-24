<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbDir  = __DIR__ . '/data';
$dbPath = $dbDir . '/cardapio.sqlite';

if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

try {
    $conn = new PDO("sqlite:$dbPath");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("PRAGMA journal_mode=WAL");
} catch (PDOException $e) {
    echo json_encode(["status" => "erro", "mensagem" => "Erro ao conectar: " . $e->getMessage()]);
    exit;
}

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

$conn->exec("CREATE TABLE IF NOT EXISTS produtos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    price      REAL    NOT NULL DEFAULT 0,
    categoria  TEXT    NOT NULL,
    imagem     TEXT    DEFAULT '',
    descricao  TEXT    DEFAULT '',
    active     INTEGER NOT NULL DEFAULT 1,
    adicionais TEXT,
    tamanhos   TEXT,
    criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$conn->exec("CREATE TABLE IF NOT EXISTS descontos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    type       TEXT    NOT NULL DEFAULT 'percent',
    value      REAL    NOT NULL DEFAULT 0,
    applyTo    TEXT    NOT NULL DEFAULT 'all',
    startDate  TEXT    NOT NULL,
    endDate    TEXT    NOT NULL,
    active     INTEGER NOT NULL DEFAULT 1,
    criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$conn->exec("CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
)");

$rota = $_GET['rota'] ?? '';

if ($rota === "finalizar") {
    $input = json_decode(file_get_contents("php://input"), true);
    $cliente   = trim($input['cliente']   ?? '');
    $numero    = trim($input['numero']    ?? 'Não informado');
    $endereco  = trim($input['endereco']  ?? '');
    $itens     = $input['itens']          ?? [];
    $pagamento = trim($input['pagamento'] ?? 'Não informado');

    if (!$cliente || !$endereco || empty($itens)) {
        echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos"]);
        exit;
    }

    $itensJson = json_encode($itens, JSON_UNESCAPED_UNICODE);
    $total = 0;
    foreach ($itens as $item) {
        $total += ($item['price'] ?? 0) * ($item['quantity'] ?? 1);
    }

    try {
        $stmt = $conn->prepare("INSERT INTO pedidos (cliente, numero, endereco, itens, total, pagamento)
                                VALUES (:cliente, :numero, :endereco, :itens, :total, :pagamento)");
        $stmt->execute([
            ':cliente'   => $cliente,
            ':numero'    => $numero,
            ':endereco'  => $endereco,
            ':itens'     => $itensJson,
            ':total'     => $total,
            ':pagamento' => $pagamento,
        ]);
        echo json_encode(["status" => "ok", "mensagem" => "Pedido salvo com sucesso", "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao salvar pedido: " . $e->getMessage()]);
    }
    exit;
}

if ($rota === "listar") {
    $result = $conn->query("SELECT * FROM pedidos ORDER BY id DESC");
    $pedidos = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach ($pedidos as &$p) {
        $p['itens'] = json_decode($p['itens'], true);
    }
    echo json_encode(["status" => "ok", "pedidos" => $pedidos], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($rota === "atualizar_status") {
    $input  = json_decode(file_get_contents("php://input"), true);
    $id     = intval($input['id']     ?? 0);
    $status = trim($input['status']   ?? '');
    $statusPermitidos = ['novo', 'preparando', 'entregue', 'cancelado'];

    if (!$id || !in_array($status, $statusPermitidos)) {
        echo json_encode(["status" => "erro", "mensagem" => "Dados inválidos"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE pedidos SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $id]);

    echo json_encode(["status" => "ok", "mensagem" => "Status atualizado para: $status"]);
    exit;
}

if ($rota === "listar_produtos") {
    $result = $conn->query("SELECT * FROM produtos ORDER BY categoria, nome");
    $produtos = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach ($produtos as &$p) {
        if ($p['adicionais']) $p['adicionais'] = json_decode($p['adicionais'], true);
        if ($p['tamanhos'])   $p['tamanhos']   = json_decode($p['tamanhos'], true);
        $p['active'] = (bool)$p['active'];
    }
    echo json_encode(["status" => "ok", "produtos" => $produtos], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($rota === "salvar_produtos") {
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $produtos = $input['produtos'] ?? [];

        $conn->beginTransaction();
        $conn->exec("DELETE FROM produtos");

        $stmt = $conn->prepare("INSERT INTO produtos (id, nome, price, categoria, imagem, descricao, active, adicionais, tamanhos)
                                VALUES (:id, :nome, :price, :categoria, :imagem, :descricao, :active, :adicionais, :tamanhos)");

        foreach ($produtos as $p) {
            $stmt->execute([
                ':id'        => intval($p['id'] ?? 0),
                ':nome'      => $p['nome'] ?? '',
                ':price'     => floatval($p['price'] ?? 0),
                ':categoria' => $p['categoria'] ?? '',
                ':imagem'    => $p['imagem'] ?? '',
                ':descricao' => $p['descricao'] ?? '',
                ':active'    => isset($p['active']) ? ($p['active'] ? 1 : 0) : 1,
                ':adicionais'=> isset($p['adicionais']) ? json_encode($p['adicionais'], JSON_UNESCAPED_UNICODE) : null,
                ':tamanhos'  => isset($p['tamanhos'])   ? json_encode($p['tamanhos'],   JSON_UNESCAPED_UNICODE) : null,
            ]);
        }

        $conn->commit();
        echo json_encode(["status" => "ok"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao salvar produtos: " . $e->getMessage()]);
    }
    exit;
}

if ($rota === "listar_descontos") {
    $result = $conn->query("SELECT * FROM descontos ORDER BY id DESC");
    $descontos = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach ($descontos as &$d) {
        $d['active'] = (bool)$d['active'];
    }
    echo json_encode(["status" => "ok", "descontos" => $descontos], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($rota === "salvar_descontos") {
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $descontos = $input['descontos'] ?? [];

        $conn->beginTransaction();
        $conn->exec("DELETE FROM descontos");

        $stmt = $conn->prepare("INSERT INTO descontos (id, name, type, value, applyTo, startDate, endDate, active)
                                VALUES (:id, :name, :type, :value, :applyTo, :startDate, :endDate, :active)");

        foreach ($descontos as $d) {
            $stmt->execute([
                ':id'        => intval($d['id'] ?? 0),
                ':name'      => $d['name'] ?? '',
                ':type'      => $d['type'] ?? 'percent',
                ':value'     => floatval($d['value'] ?? 0),
                ':applyTo'   => $d['applyTo'] ?? 'all',
                ':startDate' => $d['startDate'] ?? '',
                ':endDate'   => $d['endDate'] ?? '',
                ':active'    => isset($d['active']) ? ($d['active'] ? 1 : 0) : 1,
            ]);
        }

        $conn->commit();
        echo json_encode(["status" => "ok"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao salvar descontos: " . $e->getMessage()]);
    }
    exit;
}

if ($rota === "get_config") {
    $chave = trim($_GET['chave'] ?? '');
    if (!$chave) {
        echo json_encode(["status" => "erro", "mensagem" => "Chave não informada"]);
        exit;
    }
    $stmt = $conn->prepare("SELECT valor FROM config WHERE chave = :chave");
    $stmt->execute([':chave' => $chave]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "ok", "valor" => $row ? $row['valor'] : null]);
    exit;
}

if ($rota === "set_config") {
    $input = json_decode(file_get_contents("php://input"), true);
    $chave = trim($input['chave'] ?? '');
    $valor = trim($input['valor'] ?? '');
    if (!$chave) {
        echo json_encode(["status" => "erro", "mensagem" => "Chave não informada"]);
        exit;
    }
    $stmt = $conn->prepare("INSERT OR REPLACE INTO config (chave, valor) VALUES (:chave, :valor)");
    $stmt->execute([':chave' => $chave, ':valor' => $valor]);
    echo json_encode(["status" => "ok"]);
    exit;
}

echo json_encode(["status" => "erro", "mensagem" => "Rota inválida"]);

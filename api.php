<?php
header("Content-Type: application/json");

// ⚠️ Em produção, troque * pelo domínio real do seu site
// Exemplo: header("Access-Control-Allow-Origin: https://meusite.com");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// =============================================
// 🔧 CONFIGURAÇÃO — edite conforme a hospedagem
// =============================================
// As credenciais abaixo são carregadas de variáveis de ambiente.
// Se as variáveis não existirem, usa os valores fallback.
// ⚠️ Troque os fallback antes de subir para produção!
// =============================================
$host     = getenv('DB_HOST')     ?: "localhost";
$user     = getenv('DB_USER')     ?: "admtick";
$password = getenv('DB_PASSWORD') ?: "tick@1";
$database = getenv('DB_NAME')     ?: "@T1ck@123@0";
// =============================================

session_start();

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    echo json_encode([
        "status"   => "erro",
        "mensagem" => "Erro na conexão com banco"
    ]);
    exit;
}

$conn->set_charset("utf8mb4");

if (!isset($_SESSION['itens']))  $_SESSION['itens']  = [];
if (!isset($_SESSION['parar']))  $_SESSION['parar']  = false;

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

    $query = "INSERT INTO pedidos (cliente, numero, endereco, itens, total, pagamento)
              VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssssds", $cliente, $numero, $endereco, $itensJson, $total, $pagamento);
    $stmt->execute();

    echo json_encode([
        "status"   => "ok",
        "mensagem" => "Pedido salvo com sucesso",
        "id"       => $conn->insert_id
    ]);
    exit;
}

// ============================
// 📋 ROTA: LISTAR PEDIDOS
// ============================
if ($rota === "listar") {

    $query  = "SELECT * FROM pedidos ORDER BY id DESC";
    $result = $conn->query($query);

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
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

    $query = "UPDATE pedidos SET status = ? WHERE id = ?";
    $stmt  = $conn->prepare($query);
    $stmt->bind_param("si", $status, $id);
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
<?php
// db.php - Handles plain JSON database queries

// Load .env file
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Get database credentials from .env
$db_host = $_ENV['DB_HOST'];
$db_user = $_ENV['DB_USER'];
$db_pass = $_ENV['DB_PASS'];
$db_name = $_ENV['DB_NAME'];

// Create a new mysqli connection
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check for connection errors
if ($mysqli->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit();
}

// Function to execute a query
function executeQuery($query, $params = []) {
    global $mysqli;

    $stmt = $mysqli->prepare($query);

    if ($stmt === false) {
        return ['error' => 'Prepare failed: ' . htmlspecialchars($mysqli->error)];
    }

    if (!empty($params)) {
        $types = ''; // This assumes all params are strings, adjust as needed
        foreach ($params as $param) {
            if (is_int($param)) {
                $types .= 'i';
            } elseif (is_float($param)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    $stmt->close();
    return $data;
}

// Handle incoming plain JSON payload
$input = file_get_contents('php://input');
$request_data = json_decode($input, true);

if (!$request_data || !isset($request_data['query'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid or unreadable JSON payload.']);
    exit();
}

$query = $request_data['query'];
$params = $request_data['params'] ?? [];

$response_data = executeQuery($query, $params);

header('Content-Type: application/json');
echo json_encode($response_data);
?>
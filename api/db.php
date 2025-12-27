<?php
require_once 'encryption.php'; // Includes encryption functions and loads .env

// Get database credentials from .env
$db_host = $_ENV['DB_HOST'];
$db_user = $_ENV['DB_USER'];
$db_pass = $_ENV['DB_PASS'];
$db_name = $_ENV['DB_NAME'];

// Create a new mysqli connection
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check for connection errors
if ($mysqli->connect_error) {
    // In a real application, you might want to log this error and return a generic message
    die(encryptData(['error' => 'Database connection failed.']));
}

// Function to execute a query
function executeQuery($query, $params = []) {
    global $mysqli;

    $stmt = $mysqli->prepare($query);

    if ($stmt === false) {
        return ['error' => 'Prepare failed: ' . htmlspecialchars($mysqli->error)];
    }

    if (!empty($params)) {
        // Dynamically determine types
        $types = '';
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

// Handle incoming encrypted payload
$input = file_get_contents('php://input');

// --- PHP DEBUGGING START ---
$log_file = __DIR__ . '/debug.log';
$log_message = "Timestamp: " . date('Y-m-d H:i:s') . "\n";
$log_message .= "Received Payload: " . $input . "\n";
$decrypted_payload = decryptData($input);
$log_message .= "Decryption Result: " . json_encode($decrypted_payload) . "\n---\n";
file_put_contents($log_file, $log_message, FILE_APPEND);
// --- PHP DEBUGGING END ---

$decrypted_payload = decryptData($input);

if (!$decrypted_payload || !isset($decrypted_payload['query'])) {
    header('Content-Type: application/json');
    echo encryptData(['error' => 'Invalid or unreadable encrypted payload.']);
    exit();
}

$query = $decrypted_payload['query'];
$params = $decrypted_payload['params'] ?? [];

$response_data = executeQuery($query, $params);

header('Content-Type: application/json');
echo encryptData($response_data);
?>

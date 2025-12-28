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

// Function to execute a query (now supports multiple statements)
function executeQuery($query) {
    global $mysqli;

    $data = [];

    if ($mysqli->multi_query($query)) {
        do {
            // Store first result set
            if ($result = $mysqli->store_result()) {
                if ($result->num_rows > 0) {
                    // Only collect data from the last result set that is not empty
                    $current_data = [];
                    while ($row = $result->fetch_assoc()) {
                        $current_data[] = $row;
                    }
                    $data = $current_data; // Overwrite with the latest non-empty result
                }
                $result->free();
            }
        } while ($mysqli->more_results() && $mysqli->next_result());
    }

    if ($mysqli->error) {
        return ['error' => 'Multi-query failed: ' . htmlspecialchars($mysqli->error)];
    }

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
// Parameters are not supported with multi_query in this context,
// so we ignore them. Security warning applies.
// $params = $request_data['params'] ?? [];

$response_data = executeQuery($query);

header('Content-Type: application/json');
echo json_encode($response_data);
?>
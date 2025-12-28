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

// Function to execute a standard query
function executeQuery($query) {
    global $mysqli;

    $data = [];
    $result = $mysqli->query($query);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        $result->free();
    } elseif ($mysqli->error) {
        return ['error' => 'Query failed: ' . htmlspecialchars($mysqli->error)];
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
$response_data = executeQuery($query);

// Check for aggregation flag
if (strpos($query, '/* AGGREGATE_COURSES */') !== false) {
    $categories = [];
    foreach ($response_data as $row) {
        $category_id = $row['category_id'];

        // If category is not yet in our array, add it
        if (!isset($categories[$category_id])) {
            $categories[$category_id] = [
                'category_id' => $category_id,
                'category_name' => $row['category_name'],
                'courses' => []
            ];
        }

        // If there is a course in this row, add it to the courses array
        if ($row['id'] !== null) {
            $categories[$category_id]['courses'][] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'short_description' => $row['short_description'],
                'upcoming_image_thumbnail' => $row['upcoming_image_thumbnail'],
                'price' => $row['price'],
                'level' => $row['level']
            ];
        }
    }
    // Convert the associative array to a simple indexed array for the final JSON
    $response_data = array_values($categories);
}

header('Content-Type: application/json');
echo json_encode($response_data);
?>
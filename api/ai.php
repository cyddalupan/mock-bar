<?php
// ai.php - Handles plain JSON OpenAI API calls

// Load .env file
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Get the OpenAI API key
$openai_api_key = $_ENV['OPENAI_API_KEY'];
if (empty($openai_api_key)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'OpenAI API key not set in .env file.']);
    exit();
}

// Function to call the OpenAI API
function callOpenAI($system_prompt, $history) {
    global $openai_api_key;

    $url = 'https://api.openai.com/v1/chat/completions';
    $data = [
        'model' => 'gpt-5.2',
        'messages' => array_merge([['role' => 'system', 'content' => $system_prompt]], $history)
    ];

    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n" .
                        "Authorization: Bearer " . $openai_api_key,
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];

    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);

    if ($result === false) {
        $error = error_get_last();
        return ['error' => 'Failed to connect to OpenAI API or API error: ' . ($error['message'] ?? 'Unknown error')];
    }

    return json_decode($result, true);
}

// Handle incoming plain JSON payload
$input = file_get_contents('php://input');
$request_data = json_decode($input, true);

if (!$request_data || !isset($request_data['system_prompt']) || !isset($request_data['history'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid or unreadable JSON payload, or missing system_prompt/history.']);
    exit();
}

$system_prompt = $request_data['system_prompt'];
$history = $request_data['history'];

$response = callOpenAI($system_prompt, $history);

header('Content-Type: application/json');
echo json_encode($response);
?>

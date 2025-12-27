<?php
require_once 'encryption.php'; // Includes encryption functions and loads .env

// Get the OpenAI API key
$openai_api_key = $_ENV['OPENAI_API_KEY'];
if (empty($openai_api_key)) {
    // In a real application, you might want to log this error and return a generic message
    die(encryptData(['error' => 'OpenAI API key not set in .env file.']));
}

// Function to call the OpenAI API
function callOpenAI($system_prompt, $history) {
    global $openai_api_key;

    $url = 'https://api.openai.com/v1/chat/completions';
    $data = [
        'model' => 'gpt-3.5-turbo',
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

// Handle incoming encrypted payload
$input = file_get_contents('php://input');
$decrypted_payload = decryptData($input);

if (!$decrypted_payload || !isset($decrypted_payload['system_prompt']) || !isset($decrypted_payload['history'])) {
    header('Content-Type: application/json');
    echo encryptData(['error' => 'Invalid or unreadable encrypted payload, or missing system_prompt/history.']);
    exit();
}

$system_prompt = $decrypted_payload['system_prompt'];
$history = $decrypted_payload['history'];

$response = callOpenAI($system_prompt, $history);

header('Content-Type: application/json');
echo encryptData($response);
?>
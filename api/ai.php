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

// Function to call the OpenAI API for grading
function callOpenAIGrader($userAnswer, $expectedAnswer) {
    global $openai_api_key;

    $url = 'https://api.openai.com/v1/chat/completions';
    $messages = [
        [
            "role" => "system",
            "content" => <<<EOD
Compare the user_answer to expected_answer and output only a valid JSON object with:
- "score": integer (1-100, 100 for full match, 70-95 for close match, 0-30 for mismatch).
- "feedback": string (Bootstrap-styled HTML table that evaluates the following criteria: Answer, Legal Basis, Application, Conclusion, and Legal Writing.
    - Each criterion should be graded individually (5/5 if perfect).
    - Show subtotal per criterion (max 5 points each, total 25 = 100%).
    - Provide explanations for mistakes under each criterion.
    - After the table, include an "Additional Insights" section in plain text containing:
        a) The correct expected_answer (either provided or AI-generated if missing).
        b) A section titled:
           🔎 Mistakes
           ❌ List each mistake clearly and specifically.
        c) Suggestions for improvement.
        d) If the user scored perfectly, congratulate them in this section.
EOD
        ],
        [
            "role" => "system",
            "content" => "expected_answer: " . $expectedAnswer
        ],
        [
            "role" => "user",
            "content" => "user_answer: " . $userAnswer
        ]
    ];

    $data = [
        'model' => 'gpt-4o', // Using a more capable model for grading
        'messages' => $messages,
        'response_format' => ['type' => 'json_object'] // Ensure JSON response
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

// Check for required fields for grading
if (!$request_data || !isset($request_data['user_answer']) || !isset($request_data['expected_answer'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid or unreadable JSON payload, or missing user_answer/expected_answer.']);
    exit();
}

$userAnswer = $request_data['user_answer'];
$expectedAnswer = $request_data['expected_answer'];

$response = callOpenAIGrader($userAnswer, $expectedAnswer);

header('Content-Type: application/json');
echo json_encode($response);
?>

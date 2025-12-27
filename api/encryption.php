<?php
// encryption.php - Handles encryption and decryption for API payloads

// Load the .env file if it hasn't been loaded already
if (!function_exists('loadEnv')) {
    function loadEnv($path)
    {
        if (!file_exists($path)) {
            return false;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
    loadEnv(__DIR__ . '/../.env');
}


$encryption_key = $_ENV['ENCRYPTION_KEY'];
if (empty($encryption_key)) {
    die("Encryption key not set in .env file.");
}

// Function to encrypt data
function encryptData($data) {
    global $encryption_key;
    $cipher = 'aes-256-cbc';
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $ciphertext = openssl_encrypt(json_encode($data), $cipher, $encryption_key, 0, $iv);
    return base64_encode($iv . $ciphertext);
}

// Function to decrypt data
function decryptData($encrypted_data) {
    global $encryption_key;
    $cipher = 'aes-256-cbc';
    $ivlen = openssl_cipher_iv_length($cipher);
    $decoded = base64_decode($encrypted_data);
    $iv = substr($decoded, 0, $ivlen);
    $ciphertext = substr($decoded, $ivlen);
    $plaintext = openssl_decrypt($ciphertext, $cipher, $encryption_key, 0, $iv);
    return json_decode($plaintext, true);
}
?>

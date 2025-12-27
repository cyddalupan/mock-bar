<?php
// encryption.php - Handles JWE encryption and decryption using web-token/jwt-framework

require_once __DIR__ . '/../vendor/autoload.php';

use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\KeyManagement\JWKFactory;
use Jose\Component\Encryption\Algorithm\KeyEncryption\Dir;
use Jose\Component\Encryption\Algorithm\ContentEncryption\A256CBCHS512;
use Jose\Component\Encryption\JWEBuilder;
use Jose\Component\Encryption\JWEDecrypter;
use Jose\Component\Encryption\Serializer\CompactSerializer;
use Jose\Component\Encryption\Compression\CompressionMethodManager;
use Jose\Component\Encryption\Compression\Deflate;

// Load .env file
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

$raw_key_b64 = $_ENV['ENCRYPTION_KEY'];
if (empty($raw_key_b64) || !is_string($raw_key_b64)) {
    error_log("ENCRYPTION_KEY is not set or is not a string in .env file.");
    die("Encryption key is not configured properly.");
}
$raw_key = base64_decode($raw_key_b64);
if (strlen($raw_key) !== 64) { // Expecting a 512-bit key (64 bytes)
    error_log("ENCRYPTION_KEY (decoded) is not 64 characters long. Got: " . strlen($raw_key) . " bytes.");
    die("Encryption key length is incorrect.");
}

// Create a JWK (JSON Web Key) from our raw 64-byte secret.
$jwk = JWKFactory::createFromSecret($raw_key, ['alg' => 'dir', 'use' => 'enc']);

// Function to encrypt data
function encryptData($data) {
    global $jwk;
    $keyEncryptionAlgorithmManager = new AlgorithmManager([new Dir()]);
    $contentEncryptionAlgorithmManager = new AlgorithmManager([new A256CBCHS512()]);
    $compressionMethodManager = new CompressionMethodManager([new Deflate()]);

    $jweBuilder = new JWEBuilder($keyEncryptionAlgorithmManager, $contentEncryptionAlgorithmManager, $compressionMethodManager);
    $serializer = new CompactSerializer();
    $payload = json_encode($data);

    $jwe = $jweBuilder
        ->create()
        ->withPayload($payload)
        ->withSharedProtectedHeader(['alg' => 'dir', 'enc' => 'A256CBC-HS512'])
        ->addRecipient($jwk)
        ->build();
    
    return $serializer->serialize($jwe, 0);
}

// Function to decrypt data
function decryptData($jweString) {
    global $jwk;
    $keyEncryptionAlgorithmManager = new AlgorithmManager([new Dir()]);
    $contentEncryptionAlgorithmManager = new AlgorithmManager([new A256CBCHS512()]);
    $compressionMethodManager = new CompressionMethodManager([new Deflate()]);

    $jweDecrypter = new JWEDecrypter($keyEncryptionAlgorithmManager, $contentEncryptionAlgorithmManager, $compressionMethodManager);
    $serializer = new CompactSerializer();

    try {
        $jwe = $serializer->unserialize($jweString);
        if (!$jweDecrypter->decryptUsingKey($jwe, $jwk, 0)) {
            return null;
        }
        return json_decode($jwe->getPayload(), true);
    } catch (Exception $e) {
        error_log("JWE Decryption Exception: " . $e->getMessage());
        return null;
    }
}
?>
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

$raw_key = $_ENV['ENCRYPTION_KEY'];
if (empty($raw_key) || strlen($raw_key) !== 32) {
    error_log("A 32-character ENCRYPTION_KEY is not set in .env file.");
    die("Encryption key is not configured properly.");
}

// Create a JWK (JSON Web Key) from our raw 32-byte secret.
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
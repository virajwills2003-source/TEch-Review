<?php
/**
 * TECH REVIEW — Database Connection Config
 */

// If running on Railway, it provides MYSQLHOST, MYSQLUSER, etc. automatically.
// If running locally on XAMPP, it falls back to your local settings.
define('DB_HOST',     getenv('MYSQLHOST') ?: 'localhost');
define('DB_USER',     getenv('MYSQLUSER') ?: 'root');
define('DB_PASS',     getenv('MYSQLPASSWORD') ?: '');
define('DB_NAME',     getenv('MYSQLDATABASE') ?: 'railway');
define('DB_PORT',     (int)(getenv('MYSQLPORT') ?: 3306));
define('DB_CHARSET',  'utf8mb4');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Create and return a MySQLi connection.
 */
function getDB(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit();
    }

    $conn->set_charset(DB_CHARSET);
    return $conn;
}

function respond(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function extractYouTubeId(string $input): string {
    if (empty($input)) return '';
    $trimmed = trim($input);
    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $trimmed)) {
        return $trimmed;
    }
    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i', $trimmed, $m)) {
        return $m[1];
    }
    return '';
}

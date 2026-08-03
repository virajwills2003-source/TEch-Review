<?php
/**
 * TECH REVIEW — XAMPP Database Connection Config
 * Edit the credentials below to match your XAMPP MySQL setup.
 */

define('DB_HOST',     getenv('MYSQLHOST') ?: 'maglev.proxy.rlwy.net');
define('DB_USER',     getenv('MYSQLUSER') ?: 'root');
define('DB_PASS',     getenv('MYSQLPASSWORD') ?: 'esgekfsyZuOMfifECkBJZBdbhYclkPXh');
define('DB_NAME',     getenv('MYSQLDATABASE') ?: 'railway');
define('DB_PORT',     getenv('MYSQLPORT') ?: '12001');
define('DB_CHARSET',  'utf8mb4');

// CORS headers — allow the frontend to call these PHP endpoints
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
 * Sends a JSON error and exits if connection fails.
 */
function getDB(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, (int)DB_PORT);

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

/**
 * Send a JSON response and exit.
 */
function respond(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

/**
 * Get the raw request body decoded as an array.
 */
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Extract YouTube video ID from a URL or return the raw ID if already short.
 */
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

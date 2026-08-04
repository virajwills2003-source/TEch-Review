<?php
/**
 * TECH REVIEW — Database Connection Config
 */

// Railway MySQL Environment Variable resolution with fallbacks for all common Railway/Cloud MySQL naming conventions
$dbUrl = getenv('MYSQLURL') ?: getenv('MYSQL_URL') ?: getenv('DATABASE_URL');
if (!empty($dbUrl)) {
    $parsed = parse_url($dbUrl);
    define('DB_HOST', $parsed['host'] ?? 'localhost');
    define('DB_USER', $parsed['user'] ?? 'root');
    define('DB_PASS', $parsed['pass'] ?? '');
    define('DB_NAME', ltrim($parsed['path'] ?? 'railway', '/'));
    define('DB_PORT', (int)($parsed['port'] ?? 3306));
} else {
    define('DB_HOST',    getenv('MYSQLHOST')     ?: getenv('MYSQL_HOST')     ?: getenv('DATABASE_HOST') ?: 'localhost');
    define('DB_USER',    getenv('MYSQLUSER')     ?: getenv('MYSQL_USER')     ?: getenv('DATABASE_USER') ?: 'root');
    define('DB_PASS',    getenv('MYSQLPASSWORD') ?: getenv('MYSQL_PASSWORD') ?: getenv('DATABASE_PASSWORD') ?: '');
    define('DB_NAME',    getenv('MYSQLDATABASE') ?: getenv('MYSQL_DATABASE') ?: getenv('DATABASE_NAME') ?: 'railway');
    define('DB_PORT',    (int)(getenv('MYSQLPORT') ?: getenv('MYSQL_PORT')  ?: getenv('DATABASE_PORT') ?: 3306));
}
define('DB_CHARSET', 'utf8mb4');

// Dynamic CORS configuration to support credentialed requests from GitHub Pages & local origins
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle OPTIONS preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Create and return a MySQLi connection.
 */
function getDB(): mysqli {
    // Suppress default PHP warning to return custom JSON error on failure
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error,
            'host'    => DB_HOST,
            'database' => DB_NAME
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
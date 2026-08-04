<?php
/**
 * TECH REVIEW — Root Router & Static Fallback for Railway PHP Server
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If request is for an API endpoint in /api/, pass to PHP script
if (strpos($uri, '/api/') === 0) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        require $file;
        exit();
    }
}

// Otherwise serve static files or fall back to index.html
$staticFile = __DIR__ . $uri;
if ($uri !== '/' && file_exists($staticFile) && !is_dir($staticFile)) {
    $mime = mime_content_type($staticFile);
    if (str_ends_with($uri, '.css')) $mime = 'text/css';
    if (str_ends_with($uri, '.js'))  $mime = 'application/javascript';
    if (str_ends_with($uri, '.svg')) $mime = 'image/svg+xml';
    header("Content-Type: $mime");
    readfile($staticFile);
    exit();
}

// Default fallback to index.html
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');

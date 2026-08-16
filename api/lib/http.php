<?php
declare(strict_types=1);

// Never leak stack traces or file paths to the client — log them server-side
// and always respond with clean JSON instead. This is what every endpoint
// loads first, so it covers uncaught exceptions from anywhere downstream
// (e.g. a PDOException from a query against a table that doesn't exist yet).
ini_set('display_errors', '0');
error_reporting(E_ALL);

set_exception_handler(static function (Throwable $e): void {
    error_log($e->__toString());
    json_response(['error' => 'Internal server error'], 500);
});

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

function json_response(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): never
{
    json_response(['error' => $message], $status);
}

/** @return array<string, mixed> */
function json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_error('Invalid JSON body', 400);
    }

    return $decoded;
}

function require_method(string ...$methods): void
{
    $actual = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($actual, $methods, true)) {
        json_error('Method not allowed', 405);
    }
}

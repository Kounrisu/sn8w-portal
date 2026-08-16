<?php
declare(strict_types=1);

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

<?php
declare(strict_types=1);

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['SERVER_PORT'] ?? null) === '443';

    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 14, // 14 days
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_name('sn8w_session');
    session_start();
}

function current_admin_id(): ?int
{
    start_session();
    return isset($_SESSION['admin_id']) ? (int) $_SESSION['admin_id'] : null;
}

function require_auth(): int
{
    $id = current_admin_id();
    if ($id === null) {
        json_error('Not authenticated', 401);
    }

    return $id;
}

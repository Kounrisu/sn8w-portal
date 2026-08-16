<?php
declare(strict_types=1);

// Local override for `php -S` development — never committed (see .gitignore).
// The deploy workflow generates the same file from GitHub secrets at build
// time, so this file only ever exists on disk, never in git history.
$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) {
    require $localConfig;
}

function db_config(string $key): string
{
    $env = getenv($key);
    if ($env !== false && $env !== '') {
        return $env;
    }

    $constants = [
        'DB_HOST' => defined('SN8W_DB_HOST') ? SN8W_DB_HOST : null,
        'DB_NAME' => defined('SN8W_DB_NAME') ? SN8W_DB_NAME : null,
        'DB_USER' => defined('SN8W_DB_USER') ? SN8W_DB_USER : null,
        'DB_PASSWORD' => defined('SN8W_DB_PASSWORD') ? SN8W_DB_PASSWORD : null,
    ];

    $value = $constants[$key] ?? null;
    if ($value === null) {
        json_error("Missing database configuration: $key", 500);
    }

    return $value;
}

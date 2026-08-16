<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = db_config('DB_HOST');
    $name = db_config('DB_NAME');
    $user = db_config('DB_USER');
    $password = db_config('DB_PASSWORD');

    $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        json_error('Database connection failed', 500);
    }

    return $pdo;
}

<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET');

start_session();

if (!isset($_SESSION['admin_id'])) {
    json_response(['authenticated' => false]);
}

json_response([
    'authenticated' => true,
    'username' => $_SESSION['admin_username'] ?? null,
]);

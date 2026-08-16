<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('POST');

$body = json_body();
$username = trim((string) ($body['username'] ?? ''));
$password = (string) ($body['password'] ?? '');

if ($username === '' || $password === '') {
    json_error('Username and password are required', 400);
}

$stmt = db()->prepare('SELECT id, password_hash FROM admin_users WHERE username = :username LIMIT 1');
$stmt->execute(['username' => $username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    // Constant-ish delay to blunt naive brute-force attempts.
    usleep(400_000);
    json_error('Invalid username or password', 401);
}

start_session();
session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $user['id'];
$_SESSION['admin_username'] = $username;

json_response(['authenticated' => true, 'username' => $username]);

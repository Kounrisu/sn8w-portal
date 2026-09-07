<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/project_json.php';

require_method('POST');

// Deliberately unauthenticated — any visitor looking at an inactive project
// can ask for it to be spun back up. Idempotent: a repeat click while a
// request is already pending doesn't bump the timestamp or spam the admin.
$body = json_body();
$id = (int) ($body['id'] ?? 0);
if ($id <= 0) {
    json_error('id is required', 400);
}

$stmt = db()->prepare('SELECT id, availability, activation_requested_at FROM projects WHERE id = :id');
$stmt->execute(['id' => $id]);
$row = $stmt->fetch();

if (!$row) {
    json_error('Project not found', 404);
}

if ($row['availability'] === 'active') {
    json_error('Project is already active', 409);
}

if ($row['activation_requested_at'] === null) {
    $stmt = db()->prepare('UPDATE projects SET activation_requested_at = CURRENT_TIMESTAMP WHERE id = :id');
    $stmt->execute(['id' => $id]);
}

$stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
$stmt->execute(['id' => $id]);

json_response(project_row_to_json($stmt->fetch()));

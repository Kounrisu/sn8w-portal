<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'PUT', 'DELETE');

// Messages from the contact form are personal data: admin session required for everything.
require_auth();

function contact_message_to_json(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'message' => $row['message'],
        'lang' => $row['lang'],
        'mailSent' => (bool) $row['mail_sent'],
        'read' => $row['read_at'] !== null,
        'createdAt' => $row['created_at'],
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = db()->query('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 200')->fetchAll();
    $unread = (int) db()->query('SELECT COUNT(*) FROM contact_messages WHERE read_at IS NULL')->fetchColumn();
    json_response(['messages' => array_map(contact_message_to_json(...), $rows), 'unread' => $unread]);
}

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    json_error('id query parameter is required', 400);
}

if ($method === 'PUT') {
    $body = json_body();
    if (!array_key_exists('read', $body) || !is_bool($body['read'])) {
        json_error('read must be a boolean', 422);
    }
    $sql = $body['read']
        ? 'UPDATE contact_messages SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = :id'
        : 'UPDATE contact_messages SET read_at = NULL WHERE id = :id';
    db()->prepare($sql)->execute(['id' => $id]);

    $stmt = db()->prepare('SELECT * FROM contact_messages WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if (!$row) {
        json_error('Message not found', 404);
    }
    json_response(contact_message_to_json($row));
}

// DELETE
$stmt = db()->prepare('DELETE FROM contact_messages WHERE id = :id');
$stmt->execute(['id' => $id]);
if ($stmt->rowCount() === 0) {
    json_error('Message not found', 404);
}
json_response(['deleted' => true]);

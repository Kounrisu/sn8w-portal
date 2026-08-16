<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'PUT');

require_auth();

function is_valid_date(string $date): bool
{
    $parsed = DateTime::createFromFormat('Y-m-d', $date);
    return $parsed !== false && $parsed->format('Y-m-d') === $date;
}

$method = $_SERVER['REQUEST_METHOD'];
$date = $_GET['date'] ?? null;

if ($method === 'GET') {
    if ($date !== null) {
        if (!is_valid_date($date)) {
            json_error('date must be in YYYY-MM-DD format', 400);
        }

        $stmt = db()->prepare('SELECT entry_date, notes FROM diary_entries WHERE entry_date = :date');
        $stmt->execute(['date' => $date]);
        $row = $stmt->fetch();

        json_response([
            'date' => $date,
            'notes' => $row['notes'] ?? '',
        ]);
    }

    // No date given: list every day that has a saved entry or a diary todo,
    // most recent first, so the UI can build a day list.
    $stmt = db()->query(
        'SELECT entry_date AS date FROM diary_entries
         UNION
         SELECT diary_date AS date FROM todos WHERE diary_date IS NOT NULL
         ORDER BY date DESC'
    );

    json_response(array_column($stmt->fetchAll(), 'date'));
}

if ($method === 'PUT') {
    if ($date === null || !is_valid_date($date)) {
        json_error('date query parameter must be in YYYY-MM-DD format', 400);
    }

    $body = json_body();
    $notes = (string) ($body['notes'] ?? '');

    $stmt = db()->prepare(
        'INSERT INTO diary_entries (entry_date, notes) VALUES (:date, :notes)
         ON DUPLICATE KEY UPDATE notes = VALUES(notes)'
    );
    $stmt->execute(['date' => $date, 'notes' => $notes]);

    json_response(['date' => $date, 'notes' => $notes]);
}

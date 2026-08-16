<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

const VALID_TODO_STATUSES = ['todo', 'in_progress', 'done'];

// The todo board and diary are personal tools — every operation needs a
// logged-in session, including reads.
require_auth();

function todo_row_to_json(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'status' => $row['status'],
        'diaryDate' => $row['diary_date'],
        'sortOrder' => (int) $row['sort_order'],
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $date = $_GET['date'] ?? null;

    if ($date !== null) {
        $stmt = db()->prepare('SELECT * FROM todos WHERE diary_date = :date ORDER BY sort_order, id');
        $stmt->execute(['date' => $date]);
    } else {
        $stmt = db()->query('SELECT * FROM todos WHERE diary_date IS NULL ORDER BY status, sort_order, id');
    }

    json_response(array_map(todo_row_to_json(...), $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = json_body();
    $title = trim((string) ($body['title'] ?? ''));
    if ($title === '') {
        json_error('title is required', 422);
    }

    $status = $body['status'] ?? 'todo';
    if (!in_array($status, VALID_TODO_STATUSES, true)) {
        json_error('Invalid status', 422);
    }

    $diaryDate = $body['diaryDate'] ?? null;

    $stmt = db()->prepare(
        'INSERT INTO todos (title, status, diary_date, sort_order) VALUES (:title, :status, :diary_date, :sort_order)'
    );
    $stmt->execute([
        'title' => $title,
        'status' => $status,
        'diary_date' => $diaryDate,
        'sort_order' => (int) ($body['sortOrder'] ?? 0),
    ]);

    $id = (int) db()->lastInsertId();
    $stmt = db()->prepare('SELECT * FROM todos WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(todo_row_to_json($stmt->fetch()), 201);
}

if ($method === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_error('id query parameter is required', 400);
    }

    $body = json_body();
    $fields = [];

    if (array_key_exists('title', $body)) {
        $title = trim((string) $body['title']);
        if ($title === '') {
            json_error('title cannot be empty', 422);
        }
        $fields['title'] = $title;
    }

    if (array_key_exists('status', $body)) {
        if (!in_array($body['status'], VALID_TODO_STATUSES, true)) {
            json_error('Invalid status', 422);
        }
        $fields['status'] = $body['status'];
    }

    if (array_key_exists('sortOrder', $body)) {
        $fields['sort_order'] = (int) $body['sortOrder'];
    }

    if ($fields === []) {
        json_error('No fields to update', 400);
    }

    $set = implode(', ', array_map(static fn(string $col) => "$col = :$col", array_keys($fields)));
    $fields['id'] = $id;

    $stmt = db()->prepare("UPDATE todos SET $set WHERE id = :id");
    $stmt->execute($fields);

    $stmt = db()->prepare('SELECT * FROM todos WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('Todo not found', 404);
    }

    json_response(todo_row_to_json($row));
}

if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_error('id query parameter is required', 400);
    }

    $stmt = db()->prepare('DELETE FROM todos WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Todo not found', 404);
    }

    json_response(['deleted' => true]);
}

<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

const VALID_PRIORITIES = ['low', 'medium', 'high'];

// The todo board and diary are personal tools — every operation needs a
// logged-in session, including reads.
require_auth();

function todo_row_to_json(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'status' => $row['status'],
        'priority' => $row['priority'],
        'progress' => (int) $row['progress'],
        'diaryDate' => $row['diary_date'],
        'sortOrder' => (int) $row['sort_order'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

// Status is a read model derived from progress — never accepted directly
// from a client, so the two can never disagree.
function status_from_progress(int $progress): string
{
    if ($progress <= 0) {
        return 'todo';
    }
    if ($progress >= 100) {
        return 'done';
    }
    return 'in_progress';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id !== null) {
        $stmt = db()->prepare('SELECT * FROM todos WHERE id = :id');
        $stmt->execute(['id' => (int) $id]);
        $row = $stmt->fetch();
        if (!$row) {
            json_error('Todo not found', 404);
        }
        json_response(todo_row_to_json($row));
    }

    $date = $_GET['date'] ?? null;

    if ($date !== null) {
        $stmt = db()->prepare('SELECT * FROM todos WHERE diary_date = :date ORDER BY sort_order, id');
        $stmt->execute(['date' => $date]);
    } else {
        $stmt = db()->query('SELECT * FROM todos WHERE diary_date IS NULL ORDER BY sort_order, id');
    }

    json_response(array_map(todo_row_to_json(...), $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = json_body();
    $title = trim((string) ($body['title'] ?? ''));
    if ($title === '') {
        json_error('title is required', 422);
    }

    $priority = $body['priority'] ?? 'medium';
    if (!in_array($priority, VALID_PRIORITIES, true)) {
        json_error('Invalid priority', 422);
    }

    $progress = max(0, min(100, (int) ($body['progress'] ?? 0)));
    $description = isset($body['description']) ? (string) $body['description'] : null;
    $diaryDate = $body['diaryDate'] ?? null;

    $stmt = db()->prepare(
        'INSERT INTO todos (title, description, status, priority, progress, diary_date, sort_order)
         VALUES (:title, :description, :status, :priority, :progress, :diary_date, :sort_order)'
    );
    $stmt->execute([
        'title' => $title,
        'description' => $description,
        'status' => status_from_progress($progress),
        'priority' => $priority,
        'progress' => $progress,
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

    if (array_key_exists('description', $body)) {
        $fields['description'] = $body['description'] === null ? null : (string) $body['description'];
    }

    if (array_key_exists('priority', $body)) {
        if (!in_array($body['priority'], VALID_PRIORITIES, true)) {
            json_error('Invalid priority', 422);
        }
        $fields['priority'] = $body['priority'];
    }

    if (array_key_exists('progress', $body)) {
        $progress = max(0, min(100, (int) $body['progress']));
        $fields['progress'] = $progress;
        $fields['status'] = status_from_progress($progress);
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

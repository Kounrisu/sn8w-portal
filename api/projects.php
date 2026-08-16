<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

const VALID_TIERS = ['flagship', 'ecosystem', 'lab'];
const VALID_STATUSES = ['live', 'in-development', 'concept', 'prototype'];
const VALID_MOCKUPS = ['inspector', 'dashboard', 'creative'];

function project_row_to_json(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'tier' => $row['tier'],
        'groupTitle' => $row['group_title'],
        'mockup' => $row['mockup'],
        'name' => $row['name'],
        'category' => $row['category'],
        'tagline' => $row['tagline'],
        'status' => $row['status'],
        'url' => $row['url'],
        'sortOrder' => (int) $row['sort_order'],
    ];
}

function validate_project_input(array $body, bool $partial = false): array
{
    $errors = [];
    $fields = [];

    if (!$partial || array_key_exists('tier', $body)) {
        $tier = $body['tier'] ?? null;
        if (!in_array($tier, VALID_TIERS, true)) {
            $errors[] = 'tier must be one of: ' . implode(', ', VALID_TIERS);
        }
        $fields['tier'] = $tier;
    }

    if (!$partial || array_key_exists('name', $body)) {
        $name = trim((string) ($body['name'] ?? ''));
        if ($name === '') {
            $errors[] = 'name is required';
        }
        $fields['name'] = $name;
    }

    if (!$partial || array_key_exists('category', $body)) {
        $fields['category'] = trim((string) ($body['category'] ?? ''));
    }

    if (!$partial || array_key_exists('tagline', $body)) {
        $fields['tagline'] = trim((string) ($body['tagline'] ?? ''));
    }

    if (!$partial || array_key_exists('status', $body)) {
        $status = $body['status'] ?? null;
        if (!in_array($status, VALID_STATUSES, true)) {
            $errors[] = 'status must be one of: ' . implode(', ', VALID_STATUSES);
        }
        $fields['status'] = $status;
    }

    if (!$partial || array_key_exists('groupTitle', $body)) {
        $group = $body['groupTitle'] ?? null;
        $fields['group_title'] = $group === null || $group === '' ? null : (string) $group;
    }

    if (!$partial || array_key_exists('mockup', $body)) {
        $mockup = $body['mockup'] ?? null;
        if ($mockup !== null && !in_array($mockup, VALID_MOCKUPS, true)) {
            $errors[] = 'mockup must be one of: ' . implode(', ', VALID_MOCKUPS);
        }
        $fields['mockup'] = $mockup;
    }

    if (!$partial || array_key_exists('url', $body)) {
        $url = $body['url'] ?? null;
        $fields['url'] = $url === null || $url === '' ? null : (string) $url;
    }

    if (!$partial || array_key_exists('sortOrder', $body)) {
        $fields['sort_order'] = (int) ($body['sortOrder'] ?? 0);
    }

    if ($errors !== []) {
        json_error(implode('; ', $errors), 422);
    }

    return $fields;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $tier = $_GET['tier'] ?? null;
    if ($tier !== null && !in_array($tier, VALID_TIERS, true)) {
        json_error('Invalid tier filter', 400);
    }

    if ($tier !== null) {
        $stmt = db()->prepare('SELECT * FROM projects WHERE tier = :tier ORDER BY group_title <=> NULL, group_title, sort_order, id');
        $stmt->execute(['tier' => $tier]);
    } else {
        $stmt = db()->query('SELECT * FROM projects ORDER BY FIELD(tier, "flagship", "ecosystem", "lab"), group_title <=> NULL, group_title, sort_order, id');
    }

    json_response(array_map(project_row_to_json(...), $stmt->fetchAll()));
}

// Every write operation requires an authenticated admin session.
require_auth();

if ($method === 'POST') {
    $fields = validate_project_input(json_body(), partial: false);

    $stmt = db()->prepare(
        'INSERT INTO projects (tier, group_title, mockup, name, category, tagline, status, url, sort_order)
         VALUES (:tier, :group_title, :mockup, :name, :category, :tagline, :status, :url, :sort_order)'
    );
    $stmt->execute($fields);

    $id = (int) db()->lastInsertId();
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(project_row_to_json($stmt->fetch()), 201);
}

if ($method === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_error('id query parameter is required', 400);
    }

    $fields = validate_project_input(json_body(), partial: true);
    if ($fields === []) {
        json_error('No fields to update', 400);
    }

    $set = implode(', ', array_map(static fn(string $col) => "$col = :$col", array_keys($fields)));
    $fields['id'] = $id;

    $stmt = db()->prepare("UPDATE projects SET $set WHERE id = :id");
    $stmt->execute($fields);

    $stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('Project not found', 404);
    }

    json_response(project_row_to_json($row));
}

if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_error('id query parameter is required', 400);
    }

    $stmt = db()->prepare('DELETE FROM projects WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Project not found', 404);
    }

    json_response(['deleted' => true]);
}

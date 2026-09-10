<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/project_json.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

const VALID_TIERS = ['flagship', 'ecosystem', 'lab'];
const VALID_TRANSLATION_LANGS = ['fr', 'de', 'ko', 'ja', 'es'];
const VALID_STATUSES = ['live', 'in-development', 'concept', 'prototype'];
const VALID_MOCKUPS = ['inspector', 'dashboard', 'creative'];
const VALID_AVAILABILITY = ['active', 'inactive'];

/** A bare host like "example.com" is a valid <a href> but resolves relative
 * to the current origin — silently prepend a scheme so links actually leave
 * the site. */
function normalize_url(string $url): string
{
    return preg_match('#^https?://#i', $url) === 1 ? $url : "https://{$url}";
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
        $url = trim((string) ($body['url'] ?? ''));
        $fields['url'] = $url === '' ? null : normalize_url($url);
    }

    if (!$partial || array_key_exists('repoUrl', $body)) {
        $repoUrl = trim((string) ($body['repoUrl'] ?? ''));
        $fields['repo_url'] = $repoUrl === '' ? null : normalize_url($repoUrl);
    }

    if (!$partial || array_key_exists('repoPrivate', $body)) {
        $fields['repo_private'] = !empty($body['repoPrivate']) ? 1 : 0;
    }

    if (!$partial || array_key_exists('availability', $body)) {
        $availability = $body['availability'] ?? 'active';
        if (!in_array($availability, VALID_AVAILABILITY, true)) {
            $errors[] = 'availability must be one of: ' . implode(', ', VALID_AVAILABILITY);
        }
        $fields['availability'] = $availability;
    }

    // A pending activation request can only be dismissed (set to null) from
    // here — the request itself is only ever created by the public
    // project-activate.php endpoint, never by an arbitrary client timestamp.
    if ($partial && array_key_exists('activationRequestedAt', $body) && $body['activationRequestedAt'] === null) {
        $fields['activation_requested_at'] = null;
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

    // English (the default/base language) reads straight from `projects`.
    // Any other supported language left-joins its translation row and
    // falls back to the base column when no translation exists yet for
    // that project — a project with no translations is just shown in
    // English rather than omitted or erroring.
    $lang = $_GET['lang'] ?? null;
    if ($lang !== null && !in_array($lang, VALID_TRANSLATION_LANGS, true)) {
        json_error('Invalid lang', 400);
    }

    $select = $lang === null
        ? 'p.*'
        : 'p.*, COALESCE(t.category, p.category) AS category, COALESCE(t.tagline, p.tagline) AS tagline';
    $join = $lang === null ? '' : 'LEFT JOIN project_translations t ON t.project_id = p.id AND t.lang = :lang';

    $where = $tier !== null ? 'WHERE p.tier = :tier' : '';
    $order = 'ORDER BY FIELD(p.tier, "flagship", "ecosystem", "lab"), p.group_title <=> NULL, p.group_title, p.sort_order, p.id';

    $stmt = db()->prepare("SELECT $select FROM projects p $join $where $order");
    $params = [];
    if ($lang !== null) {
        $params['lang'] = $lang;
    }
    if ($tier !== null) {
        $params['tier'] = $tier;
    }
    $stmt->execute($params);

    // Public, unauthenticated — project_row_to_json() defaults includePrivate
    // to false, so admin-only fields never reach this branch.
    json_response(array_map(project_row_to_json(...), $stmt->fetchAll()));
}

// Every write operation requires an authenticated admin session.
require_auth();

if ($method === 'POST') {
    $fields = validate_project_input(json_body(), partial: false);

    $stmt = db()->prepare(
        'INSERT INTO projects (tier, group_title, mockup, name, category, tagline, status, url, repo_url, repo_private, availability, sort_order)
         VALUES (:tier, :group_title, :mockup, :name, :category, :tagline, :status, :url, :repo_url, :repo_private, :availability, :sort_order)'
    );
    $stmt->execute($fields);

    $id = (int) db()->lastInsertId();
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(project_row_to_json($stmt->fetch(), includePrivate: true), 201);
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

    // Flipping a project back to active resolves whatever activation
    // request brought it to the admin's attention in the first place.
    if (($fields['availability'] ?? null) === 'active') {
        $fields['activation_requested_at'] = null;
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

    json_response(project_row_to_json($row, includePrivate: true));
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

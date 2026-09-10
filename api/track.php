<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';

require_method('POST');

// Public and unauthenticated by design — every visitor's browser calls
// this, fire-and-forget. Never let a malformed body fail loudly: a broken
// analytics call must not be visible to a visitor, so every field is
// defensively coerced instead of rejected.
$body = json_body();

// A follow-up "how long did they stay" ping for an existing row, sent via
// sendBeacon on page-leave: {id, durationMs}. Updating in place keeps one
// row per visit instead of a second row just for the duration.
if (isset($body['id'], $body['durationMs'])) {
    $id = (int) $body['id'];
    $durationMs = max(0, min((int) $body['durationMs'], 3 * 60 * 60 * 1000)); // clamp to 3h
    $stmt = db()->prepare('UPDATE page_views SET duration_ms = :duration WHERE id = :id AND duration_ms IS NULL');
    $stmt->execute(['duration' => $durationMs, 'id' => $id]);
    json_response(['ok' => true]);
}

$sessionId = is_string($body['sessionId'] ?? null) ? substr($body['sessionId'], 0, 36) : null;
if ($sessionId === null || $sessionId === '') {
    json_error('Missing sessionId', 400);
}

$kind = is_string($body['kind'] ?? null) && $body['kind'] !== '' ? substr($body['kind'], 0, 32) : 'pageview';
$path = is_string($body['path'] ?? null) ? substr($body['path'], 0, 255) : null;
$label = is_string($body['label'] ?? null) ? substr($body['label'], 0, 120) : null;
$referrer = is_string($body['referrer'] ?? null) ? substr($body['referrer'], 0, 255) : null;
$lang = is_string($body['lang'] ?? null) ? substr($body['lang'], 0, 5) : null;

$stmt = db()->prepare(
    'INSERT INTO page_views (session_id, kind, path, label, referrer, lang)
     VALUES (:session_id, :kind, :path, :label, :referrer, :lang)'
);
$stmt->execute([
    'session_id' => $sessionId,
    'kind' => $kind,
    'path' => $path,
    'label' => $label,
    'referrer' => $referrer,
    'lang' => $lang,
]);

json_response(['id' => (int) db()->lastInsertId()]);

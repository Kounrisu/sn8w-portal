<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET');
require_auth();

$pdo = db();

$totalViews = (int) $pdo->query("SELECT COUNT(*) FROM page_views WHERE kind = 'pageview'")->fetchColumn();
$totalVisitors = (int) $pdo->query('SELECT COUNT(DISTINCT session_id) FROM page_views')->fetchColumn();
$avgDuration = $pdo
    ->query("SELECT AVG(duration_ms) FROM page_views WHERE kind = 'pageview' AND duration_ms IS NOT NULL")
    ->fetchColumn();

$byPath = $pdo->query(
    "SELECT path, COUNT(*) AS views FROM page_views
     WHERE kind = 'pageview' AND path IS NOT NULL
     GROUP BY path ORDER BY views DESC LIMIT 20"
)->fetchAll();

// referrer stays NULL for direct traffic — the frontend supplies the
// "(direct)" label in the visitor's own language rather than baking one
// English string into the API response.
$byReferrer = $pdo->query(
    "SELECT NULLIF(referrer, '') AS referrer, COUNT(*) AS views
     FROM page_views WHERE kind = 'pageview'
     GROUP BY referrer ORDER BY views DESC LIMIT 20"
)->fetchAll();

$byDay = $pdo->query(
    "SELECT DATE(created_at) AS day, COUNT(*) AS views FROM page_views
     WHERE kind = 'pageview' AND created_at >= (NOW() - INTERVAL 30 DAY)
     GROUP BY day ORDER BY day"
)->fetchAll();

$clicks = $pdo->query(
    "SELECT kind, label, COUNT(*) AS clicks FROM page_views
     WHERE kind != 'pageview'
     GROUP BY kind, label ORDER BY clicks DESC LIMIT 30"
)->fetchAll();

json_response([
    'totalViews' => $totalViews,
    'totalVisitors' => $totalVisitors,
    'avgDurationMs' => $avgDuration !== null ? (int) round((float) $avgDuration) : null,
    'byPath' => array_map(static fn(array $r) => ['path' => $r['path'], 'views' => (int) $r['views']], $byPath),
    'byReferrer' => array_map(
        static fn(array $r) => ['referrer' => $r['referrer'], 'views' => (int) $r['views']],
        $byReferrer,
    ),
    'byDay' => array_map(static fn(array $r) => ['day' => $r['day'], 'views' => (int) $r['views']], $byDay),
    'clicks' => array_map(
        static fn(array $r) => ['kind' => $r['kind'], 'label' => $r['label'], 'clicks' => (int) $r['clicks']],
        $clicks,
    ),
]);

<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

require_method('GET', 'POST');
require_auth();

const VPS_ACTIONS = ['start', 'stop', 'uninstall', 'update', 'clean'];

/** Signed call to the VPS agent (HMAC-SHA256 over ts.METHOD.path.body). */
function agent_call(string $method, string $path, string $body = ''): array
{
    if (!function_exists('curl_init')) {
        json_error('PHP curl extension is not available on this hosting', 500);
    }
    $ts = (string) time();
    $sig = hash_hmac('sha256', "{$ts}.{$method}.{$path}.{$body}", vps_config('SECRET'));
    $ch = curl_init(rtrim(vps_config('URL'), '/') . $path);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ["X-Timestamp: {$ts}", "X-Signature: {$sig}", 'Content-Type: application/json'],
    ]);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($raw === false) {
        error_log('VPS agent unreachable: ' . curl_error($ch));
        json_error('VPS agent unreachable', 502);
    }
    $data = json_decode($raw, true);
    return [$status, is_array($data) ? $data : []];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    [$status, $data] = agent_call('GET', '/status');
    if ($status !== 200) {
        json_error('VPS agent error', 502);
    }

    // Degrade gracefully if migration 011 has not been applied to this database:
    // the panel still works, only linking VPS projects to cards is unavailable.
    $links = [];
    $linksAvailable = true;
    try {
        foreach (db()->query('SELECT vps_key, project_id FROM vps_links')->fetchAll() as $row) {
            $links[$row['vps_key']] = (int) $row['project_id'];
        }
    } catch (PDOException $e) {
        error_log('vps_links unavailable: ' . $e->getMessage());
        $linksAvailable = false;
    }

    $out = [];
    foreach ($data['projects'] ?? [] as $key => $p) {
        $projectId = $links[$key] ?? null;
        // Keep the public card honest: running => active, stopped/uninstalled => inactive.
        if ($projectId !== null && in_array($p['state'] ?? '', ['running', 'stopped', 'uninstalled'], true)
            && ($p['job']['state'] ?? '') !== 'running') {
            $avail = $p['state'] === 'running' ? 'active' : 'inactive';
            $sql = $avail === 'active'
                ? "UPDATE projects SET availability = 'active', activation_requested_at = NULL WHERE id = :id AND availability <> 'active'"
                : "UPDATE projects SET availability = 'inactive' WHERE id = :id AND availability <> 'inactive'";
            db()->prepare($sql)->execute(['id' => $projectId]);
        }
        $out[] = [
            'key' => (string) $key,
            'name' => $p['name'] ?? $key,
            'state' => $p['state'] ?? 'unknown',
            'containers' => (int) ($p['containers'] ?? 0),
            'job' => $p['job'] ?? null,
            'git' => $p['git'] ?? null,
            'manual' => $p['manual'] ?? null,
            'builds' => (bool) ($p['builds'] ?? false),
            'usage' => $p['usage'] ?? null,
            'projectId' => $projectId,
        ];
    }

    json_response(['host' => $data['host'] ?? null, 'projects' => $out, 'topContainers' => $data['topContainers'] ?? [], 'disk' => $data['disk'] ?? null, 'hostJob' => $data['hostJob'] ?? null, 'linksAvailable' => $linksAvailable]);
}

// POST: { key, action: start|stop|uninstall|link, projectId? }
$body = json_body();
$key = (string) ($body['key'] ?? '');
$action = (string) ($body['action'] ?? '');
if (preg_match('/\A[a-z0-9_-]{1,64}\z/', $key) !== 1) {
    json_error('Invalid key', 422);
}

if ($action === 'link') {
    try {
        db()->query('SELECT 1 FROM vps_links LIMIT 1');
    } catch (PDOException $e) {
        json_error('Table vps_links is missing: run migration 011_vps_links.sql in phpMyAdmin', 500);
    }
    $projectId = $body['projectId'] ?? null;
    db()->prepare('DELETE FROM vps_links WHERE vps_key = :k')->execute(['k' => $key]);
    if ($projectId !== null) {
        $projectId = (int) $projectId;
        db()->prepare('DELETE FROM vps_links WHERE project_id = :p')->execute(['p' => $projectId]);
        db()->prepare('INSERT INTO vps_links (vps_key, project_id) VALUES (:k, :p)')
            ->execute(['k' => $key, 'p' => $projectId]);
    }
    json_response(['linked' => $projectId]);
}

if ($key === '_host') {
    if ($action !== 'prune-cache') {
        json_error('Invalid action', 422);
    }
    [$status] = agent_call('POST', '/projects/_host/prune-cache');
    if ($status === 409) {
        json_error('An operation is already running', 409);
    }
    if ($status !== 202) {
        json_error('VPS agent refused the request', 502);
    }
    json_response(['accepted' => true], 202);
}

if (!in_array($action, VPS_ACTIONS, true)) {
    json_error('Invalid action', 422);
}

[$status, $data] = agent_call('POST', "/projects/{$key}/{$action}");
if ($status === 409) {
    json_error('An operation is already running for this project', 409);
}
if ($status !== 202) {
    json_error('VPS agent refused the request', 502);
}
json_response(['accepted' => true], 202);

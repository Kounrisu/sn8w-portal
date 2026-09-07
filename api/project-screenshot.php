<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/project_json.php';

require_method('POST', 'DELETE');
require_auth();

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG => 'png',
    IMAGETYPE_WEBP => 'webp',
];

function screenshot_dir(): string
{
    $dir = __DIR__ . '/uploads/screenshots';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

/** Deletes the file backing a stored screenshot path, if any. */
function delete_screenshot_file(?string $screenshot): void
{
    if ($screenshot === null) {
        return;
    }
    $path = __DIR__ . '/../' . ltrim(parse_url($screenshot, PHP_URL_PATH) ?: '', '/');
    if (is_file($path)) {
        unlink($path);
    }
}

function fetch_project(int $id): array
{
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if (!$row) {
        json_error('Project not found', 404);
    }
    return $row;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    json_error('id query parameter is required', 400);
}

if ($method === 'POST') {
    $project = fetch_project($id);

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        json_error('A valid file upload is required', 422);
    }

    $file = $_FILES['file'];
    if ($file['size'] > MAX_BYTES) {
        json_error('Image must be under 3MB', 422);
    }

    $info = getimagesize($file['tmp_name']);
    if ($info === false || !isset(ALLOWED_TYPES[$info[2]])) {
        json_error('File must be a JPEG, PNG or WebP image', 422);
    }

    $ext = ALLOWED_TYPES[$info[2]];
    $filename = "proj-{$id}-" . time() . ".{$ext}";
    $dest = screenshot_dir() . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        json_error('Could not save the uploaded file', 500);
    }

    delete_screenshot_file($project['screenshot']);

    $publicPath = '/api/uploads/screenshots/' . $filename;
    $stmt = db()->prepare('UPDATE projects SET screenshot = :screenshot WHERE id = :id');
    $stmt->execute(['screenshot' => $publicPath, 'id' => $id]);

    json_response(project_row_to_json(fetch_project($id)));
}

if ($method === 'DELETE') {
    $project = fetch_project($id);
    delete_screenshot_file($project['screenshot']);

    $stmt = db()->prepare('UPDATE projects SET screenshot = NULL WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(project_row_to_json(fetch_project($id)));
}

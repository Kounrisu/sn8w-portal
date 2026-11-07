<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';

require_method('POST');

// Public endpoint: anyone can post a message. Everything below is defensive
// accordingly — server-side validation, a honeypot, a minimum fill time, a
// per-IP and a global hourly cap, and an automatic retention purge.
const CONTACT_TO = 'kounrisu@gmail.com';
const CONTACT_FROM = 'no-reply@sn8w.com';
const CONTACT_RETENTION_DAYS = 180;
const CONTACT_MAX_PER_IP_PER_HOUR = 5;
const CONTACT_MAX_TOTAL_PER_HOUR = 60;
const CONTACT_MIN_FILL_MS = 2000;

function contact_clean(mixed $value): string
{
    if (!is_string($value)) {
        return '';
    }
    // Drop control characters (keep \n and \t) and normalise line endings.
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value) ?? '';
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return trim($value);
}

function contact_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

$body = json_body();

// Honeypot: real visitors never see this field. Pretend success, store nothing.
if (contact_clean($body['website'] ?? '') !== '') {
    json_response(['ok' => true], 201);
}

// A human takes more than a couple of seconds to fill the form.
$elapsed = (int) ($body['elapsedMs'] ?? 0);
if ($elapsed < CONTACT_MIN_FILL_MS) {
    json_response(['error' => 'too_fast'], 422);
}

$name = contact_clean($body['name'] ?? '');
$email = contact_clean($body['email'] ?? '');
$message = contact_clean($body['message'] ?? '');
$lang = ($body['lang'] ?? 'fr') === 'en' ? 'en' : 'fr';

$fields = [];
if ($name === '') {
    $fields['name'] = 'required';
} elseif (contact_len($name) > 100) {
    $fields['name'] = 'too_long';
}
if ($email === '') {
    $fields['email'] = 'required';
} elseif (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $fields['email'] = 'invalid';
}
if ($message === '') {
    $fields['message'] = 'required';
} elseif (contact_len($message) < 10) {
    $fields['message'] = 'too_short';
} elseif (contact_len($message) > 5000) {
    $fields['message'] = 'too_long';
}
if (($body['consent'] ?? false) !== true) {
    $fields['consent'] = 'required';
}
if ($fields !== []) {
    json_response(['error' => 'validation', 'fields' => $fields], 422);
}

try {
    // Retention: messages are kept 6 months, then purged (lazily, on each post).
    db()->exec('DELETE FROM contact_messages WHERE created_at < (NOW() - INTERVAL ' . CONTACT_RETENTION_DAYS . ' DAY)');

    // Rate limits. The IP is never stored — only a salted hash, enough to count.
    $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . db_config('DB_PASSWORD'));

    $stmt = db()->prepare('SELECT COUNT(*) FROM contact_messages WHERE ip_hash = :h AND created_at > (NOW() - INTERVAL 1 HOUR)');
    $stmt->execute(['h' => $ipHash]);
    if ((int) $stmt->fetchColumn() >= CONTACT_MAX_PER_IP_PER_HOUR) {
        json_response(['error' => 'rate_limited'], 429);
    }
    $total = (int) db()->query('SELECT COUNT(*) FROM contact_messages WHERE created_at > (NOW() - INTERVAL 1 HOUR)')->fetchColumn();
    if ($total >= CONTACT_MAX_TOTAL_PER_HOUR) {
        json_response(['error' => 'rate_limited'], 429);
    }

    $stmt = db()->prepare(
        'INSERT INTO contact_messages (name, email, message, lang, ip_hash) VALUES (:name, :email, :message, :lang, :ip_hash)'
    );
    $stmt->execute(['name' => $name, 'email' => $email, 'message' => $message, 'lang' => $lang, 'ip_hash' => $ipHash]);
    $id = (int) db()->lastInsertId();
} catch (PDOException $e) {
    // Typically: migration 012 not applied to this database (SQLSTATE 42S02, table not found).
    error_log('Contact storage failed: ' . $e->getMessage());
    json_response(['error' => $e->getCode() === '42S02' ? 'storage_missing' : 'storage'], 503);
}

// Email notification. The message is already stored, so a failed mail never
// loses it — it is flagged in the admin instead (mail_sent = 0).
$sent = false;
try {
    $subject = '=?UTF-8?B?' . base64_encode('Nouveau message depuis sn8w.com') . '?=';
    $text = "Nom : {$name}\nE-mail : {$email}\nLangue : {$lang}\n\n{$message}\n\n-- \n"
        . "Message n°{$id} — à lire dans l'admin : https://www.sn8w.com/messages\n";
    // $email passed FILTER_VALIDATE_EMAIL: it cannot contain a line break, so no header injection.
    $headers = implode("\r\n", [
        'From: sn8w.com <' . CONTACT_FROM . '>',
        'Reply-To: ' . $email,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $sent = mail(CONTACT_TO, $subject, $text, $headers);
} catch (Throwable $e) {
    error_log('Contact mail failed: ' . $e->getMessage());
}
if ($sent) {
    db()->prepare('UPDATE contact_messages SET mail_sent = 1 WHERE id = :id')->execute(['id' => $id]);
}

json_response(['ok' => true], 201);

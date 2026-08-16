<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/auth.php';

require_method('POST');

start_session();
$_SESSION = [];
session_destroy();

json_response(['authenticated' => false]);

<?php
declare(strict_types=1);

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
        'repoUrl' => $row['repo_url'],
        'repoPrivate' => (bool) $row['repo_private'],
        'screenshot' => $row['screenshot'],
        'availability' => $row['availability'],
        'activationRequestedAt' => $row['activation_requested_at'],
        'sortOrder' => (int) $row['sort_order'],
    ];
}

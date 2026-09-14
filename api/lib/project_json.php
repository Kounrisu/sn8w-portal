<?php
declare(strict_types=1);

/**
 * `repoPrivate` and `activationRequestedAt` are admin-workflow state, not
 * public catalog data — pass `$includePrivate = true` only from a call site
 * that has already run `require_auth()`.
 */
function project_row_to_json(array $row, bool $includePrivate = false): array
{
    $json = [
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
        'repoPrivate' => false,
        'screenshot' => $row['screenshot'],
        'screenshots' => json_decode($row['screenshots'] ?? '[]', true) ?: [],
        'screenshotCaptions' => (object) (json_decode($row['screenshot_captions'] ?? '{}', true) ?: []),
        'availability' => $row['availability'],
        'activationRequestedAt' => null,
        'sortOrder' => (int) $row['sort_order'],
    ];

    if ($includePrivate) {
        $json['repoPrivate'] = (bool) $row['repo_private'];
        $json['activationRequestedAt'] = $row['activation_requested_at'];
    }

    if (isset($row['show_in_showcase'])) {
        $json['showInShowcase'] = (bool) $row['show_in_showcase'];
    }
    if (isset($row['featured_on_home'])) $json['featuredOnHome'] = (bool) $row['featured_on_home'];
    if (isset($row['project_theme'])) $json['projectTheme'] = $row['project_theme'];
    return $json;
}

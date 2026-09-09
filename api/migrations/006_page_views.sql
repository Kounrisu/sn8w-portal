-- Lightweight, self-hosted, cookie-free visit logging: one row per SPA
-- pageview or tracked click, keyed by a random client-generated session id
-- (crypto.randomUUID(), stored in localStorage — not a cookie, no IP or
-- other PII stored). Run this once via phpMyAdmin's Import tab, utf-8
-- charset, same as the other numbered migrations in this folder.
CREATE TABLE IF NOT EXISTS page_views (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL COMMENT 'Random client-generated id, not a cookie',
  kind VARCHAR(32) NOT NULL DEFAULT 'pageview' COMMENT 'pageview, or a click event like project-visit / project-repo',
  path VARCHAR(255) NULL COMMENT 'Route path — set for pageview events',
  label VARCHAR(120) NULL COMMENT 'Extra context for click events, e.g. the project name',
  referrer VARCHAR(255) NULL,
  lang VARCHAR(5) NULL COMMENT 'Detected UI language at the time of the event',
  duration_ms INT UNSIGNED NULL COMMENT 'Filled in via sendBeacon when the visitor leaves — null until then',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind_created (kind, created_at),
  INDEX idx_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

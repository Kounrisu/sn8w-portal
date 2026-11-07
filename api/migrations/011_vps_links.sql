-- Run in phpMyAdmin BEFORE deploying the VPS panel. Idempotent.
CREATE TABLE IF NOT EXISTS vps_links (
  vps_key VARCHAR(64) NOT NULL PRIMARY KEY,
  project_id INT NOT NULL,
  UNIQUE KEY uq_vps_links_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

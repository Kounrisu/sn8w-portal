ALTER TABLE projects
  ADD COLUMN repo_url VARCHAR(255) NULL AFTER url,
  ADD COLUMN screenshot VARCHAR(255) NULL AFTER repo_url,
  ADD COLUMN availability ENUM('active', 'inactive') NOT NULL DEFAULT 'active' AFTER status,
  ADD COLUMN activation_requested_at TIMESTAMP NULL AFTER availability,
  MODIFY COLUMN tagline TEXT NOT NULL;

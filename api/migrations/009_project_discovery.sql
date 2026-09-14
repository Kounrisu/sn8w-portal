-- Import in phpMyAdmin (UTF-8) BEFORE deploying project discovery/admin changes.
-- Requires 007. Additive and rerunnable; later visibility/theme choices are preserved.
SET NAMES utf8mb4;
SET @new_featured = (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'featured_on_home');
SET @ddl = IF(@new_featured, 'ALTER TABLE projects ADD COLUMN featured_on_home TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
UPDATE projects SET featured_on_home = show_in_showcase WHERE @new_featured;

SET @new_theme = (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'project_theme');
SET @ddl = IF(@new_theme, 'ALTER TABLE projects ADD COLUMN project_theme VARCHAR(32) NOT NULL DEFAULT ''utilities''', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
UPDATE projects SET project_theme = CASE
  WHEN name IN ('Healthcorp', 'StockTracker Personal', 'Passive Income Tracker', 'Legio Portfolio', 'Executive KPI Dashboard') THEN 'finance'
  WHEN name IN ('Fighto', 'Brain Sakura') THEN 'health'
  WHEN name = 'Kanji' THEN 'learning'
  WHEN name IN ('lotoKarma', 'Lenormand', 'WoW Character Viewer', 'WoW Progress Companion', 'Monster Dex — practice', 'Kawaii Pet Companion', 'K-Pop Affinity', 'K-Pop Universe') THEN 'games'
  WHEN name IN ('Angular Fundamentals Lessons', 'Prompt Hub — Angular course', 'Bastion Angular', 'Frontend Masters — learning workspace', 'Access42 — accessibility training', 'Ultimate Courses — workspace', 'Development sandbox', 'CV redesign study') THEN 'sandbox'
  WHEN name IN ('Photo Book Scanner', 'Repo to Text — local workspace', 'RGAA Dev Assistant', 'VS Code Accessibility Helper', 'CI/CD Accessibility Pipeline', 'Tanaguru — accessibility reference', 'AI Project Planning Template', 'sn8w Portal') THEN 'developer-tools'
  ELSE 'utilities'
END WHERE @new_theme;

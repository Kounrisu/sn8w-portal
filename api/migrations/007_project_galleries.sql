-- Import using phpMyAdmin, UTF-8, before deploying the updated API.
-- Both changes are additive. Re-running preserves existing visibility choices.
SET @add_gallery = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'screenshots') = 0,
  'ALTER TABLE projects ADD COLUMN screenshots TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @add_gallery;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_visibility = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'show_in_showcase') = 0,
  'ALTER TABLE projects ADD COLUMN show_in_showcase TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
SET @first_visibility = @add_visibility <> 'SELECT 1';
PREPARE stmt FROM @add_visibility;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
UPDATE projects SET show_in_showcase = 1
WHERE @first_visibility AND tier = 'flagship' AND TRIM(tagline) <> '';

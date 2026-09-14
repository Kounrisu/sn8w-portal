-- Import in phpMyAdmin with UTF-8 BEFORE deploying editable gallery captions.
-- Additive and safe to rerun: existing captions are never overwritten.
SET NAMES utf8mb4;
SET @missing_captions = (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'screenshot_captions');
SET @ddl = IF(@missing_captions,
  'ALTER TABLE projects ADD COLUMN screenshot_captions TEXT NULL COMMENT ''JSON object keyed by image path, with en/fr captions''',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

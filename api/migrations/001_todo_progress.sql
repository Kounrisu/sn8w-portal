-- Adds description, priority and progress to an existing todos table.
-- Run this once against the live OVH database (phpMyAdmin SQL tab) —
-- api/schema.sql's CREATE TABLE IF NOT EXISTS won't touch a table that
-- already exists, so new installs get these columns from schema.sql
-- directly, but this database needs this ALTER instead.

ALTER TABLE todos
  ADD COLUMN description TEXT NULL AFTER title,
  ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER status,
  ADD COLUMN progress TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER priority;

-- Keep existing rows consistent with the new progress-drives-status rule
-- (progress = 0 always means 'todo', so an existing 'in_progress' row left
-- at the column default would immediately contradict its own status).
UPDATE todos SET progress = 100 WHERE status = 'done';
UPDATE todos SET progress = 50 WHERE status = 'in_progress';

ALTER TABLE projects
  ADD COLUMN repo_private TINYINT(1) NOT NULL DEFAULT 0 AFTER repo_url;

-- Fix any URL saved without a scheme (e.g. "lotokarma.sn8w.com"), which the
-- browser resolves as a path relative to sn8w.com instead of leaving the site.
UPDATE projects
SET url = CONCAT('https://', url)
WHERE url IS NOT NULL AND url NOT REGEXP '^https?://';

UPDATE projects
SET repo_url = CONCAT('https://', repo_url)
WHERE repo_url IS NOT NULL AND repo_url NOT REGEXP '^https?://';

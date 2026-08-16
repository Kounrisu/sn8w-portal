-- sn8w-portal database schema
-- Run this once against the MySQL database OVH gave you (phpMyAdmin: Import,
-- or the "SQL" tab). Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- After running this file, create your own login by generating a bcrypt hash
-- locally (never paste the plaintext password anywhere else):
--   node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "your-password-here"
-- then insert it yourself via phpMyAdmin:
--   INSERT INTO admin_users (username, password_hash) VALUES ('you', '<hash>');

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tier ENUM('flagship', 'ecosystem', 'lab') NOT NULL,
  group_title VARCHAR(64) NULL COMMENT 'Ecosystem column, e.g. "Finance" — null for flagship/lab',
  mockup ENUM('inspector', 'dashboard', 'creative') NULL COMMENT 'Flagship visual template — null outside flagship',
  name VARCHAR(120) NOT NULL,
  category VARCHAR(120) NOT NULL,
  tagline VARCHAR(280) NOT NULL,
  status ENUM('live', 'in-development', 'concept', 'prototype') NOT NULL DEFAULT 'concept',
  url VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tier (tier, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS todos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  diary_date DATE NULL COMMENT 'Set when this todo belongs to a diary day',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status, sort_order),
  INDEX idx_diary_date (diary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS diary_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the existing landing-page catalog so the site has real content on
-- first deploy. Safe to edit afterwards from the admin panel — this only
-- runs once since projects starts empty.
INSERT INTO projects (tier, group_title, mockup, name, category, tagline, status, url, sort_order)
SELECT * FROM (SELECT
  'flagship' AS tier, NULL AS group_title, 'inspector' AS mockup,
  'RGAA Dev Assistant' AS name, 'Developer & Accessibility Tools' AS category,
  'Live DOM inspection that turns RGAA and WCAG issues into fixes your team can actually ship.' AS tagline,
  'in-development' AS status, NULL AS url, 1 AS sort_order
UNION ALL SELECT
  'flagship', NULL, 'dashboard',
  'StockTracker Personal', 'Finance',
  'One dashboard for every account — PEA, PER, CTO — with the KPIs that matter.',
  'concept', NULL, 2
UNION ALL SELECT
  'flagship', NULL, 'creative',
  'Solis', 'Creative',
  'Pick an image, choose a style, watch it transform.',
  'concept', NULL, 3
UNION ALL SELECT
  'ecosystem', 'Developer Tools', NULL,
  'VS Code Accessibility Helper', 'Developer Tools',
  'Accessibility guidance in the editor — Angular templates, ARIA, focus order.',
  'concept', NULL, 1
UNION ALL SELECT
  'ecosystem', 'Developer Tools', NULL,
  'CI/CD Accessibility Pipeline', 'Developer Tools',
  'Axe-core and Playwright wired into pull requests, so regressions never ship.',
  'concept', NULL, 2
UNION ALL SELECT
  'ecosystem', 'Finance', NULL,
  'RiskLens', 'Finance',
  'Credit-risk rating platform.',
  'live', 'https://risklens.sn8w.com', 1
UNION ALL SELECT
  'ecosystem', 'Finance', NULL,
  'Passive Income Tracker', 'Finance',
  'Dividends and passive income, tracked against a real independence goal.',
  'concept', NULL, 2
UNION ALL SELECT
  'ecosystem', 'Finance', NULL,
  'Legio Portfolio', 'Finance',
  'Premium investment analytics with a distinctive Roman identity.',
  'concept', NULL, 3
UNION ALL SELECT
  'ecosystem', 'Finance', NULL,
  'Executive KPI Dashboard', 'Finance',
  'Modern business analytics built for the boardroom.',
  'concept', NULL, 4
UNION ALL SELECT
  'ecosystem', 'Consumer', NULL,
  'Lottery Verifier', 'Consumer',
  'Every ticket, every draw, every euro spent — tracked and verified.',
  'concept', NULL, 1
UNION ALL SELECT
  'ecosystem', 'Consumer', NULL,
  'Destroy Bad Emails', 'Consumer',
  'Swipe your way to inbox zero, with levels and streaks.',
  'concept', NULL, 2
UNION ALL SELECT
  'lab', NULL, NULL,
  'Kawaii Pet Companion', 'Lab',
  'A virtual pet with a care journal and mini-games.',
  'prototype', NULL, 1
UNION ALL SELECT
  'lab', NULL, NULL,
  'K-Pop Affinity', 'Lab',
  'Discover the artists and groups that match your taste.',
  'prototype', NULL, 2
UNION ALL SELECT
  'lab', NULL, NULL,
  'K-Pop Universe', 'Lab',
  'An encyclopedia of K-pop — timelines, groups, recommendations.',
  'prototype', NULL, 3
UNION ALL SELECT
  'lab', NULL, NULL,
  'WoW Progress Companion', 'Lab',
  'Raids, gear and weekly objectives, for every alt.',
  'prototype', NULL, 4
UNION ALL SELECT
  'lab', NULL, NULL,
  'Brain Sakura', 'Lab',
  'A gentle companion concept designed for senior users.',
  'prototype', NULL, 5
UNION ALL SELECT
  'lab', NULL, NULL,
  'Lenormand', 'Lab',
  'Mobile-first card draws and interactive readings.',
  'prototype', NULL, 6
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM projects);

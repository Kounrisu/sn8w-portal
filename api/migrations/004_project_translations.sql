-- name is deliberately not translated — a project's name is a proper noun
-- (brand name), kept identical across languages. Only category/tagline do.
CREATE TABLE IF NOT EXISTS project_translations (
  project_id INT UNSIGNED NOT NULL,
  lang ENUM('fr', 'de', 'ko', 'ja', 'es') NOT NULL,
  category VARCHAR(120) NOT NULL,
  tagline TEXT NOT NULL,
  PRIMARY KEY (project_id, lang),
  CONSTRAINT fk_project_translations_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

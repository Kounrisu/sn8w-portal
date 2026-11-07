-- Run in phpMyAdmin (database snwxodokmod1, SQL tab) BEFORE deploying the contact form.
-- Idempotent: safe to run twice. Stores the messages received through the contact form
-- (read in /messages, admin only). Rows older than 180 days are purged automatically by
-- api/contact.php; the visitor's IP is never stored, only a salted SHA-256 hash used for
-- the per-hour rate limit.
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message TEXT NOT NULL,
  lang VARCHAR(2) NOT NULL DEFAULT 'fr',
  ip_hash CHAR(64) NOT NULL,
  mail_sent TINYINT(1) NOT NULL DEFAULT 0,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_contact_ip_created (ip_hash, created_at),
  KEY idx_contact_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

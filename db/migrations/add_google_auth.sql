-- Migration: Add Google OAuth support
-- Run this against your `campus_lost_found` database

-- 1. Add google_id column (nullable -- only set for Google-authenticated users)
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER email;

-- 2. Make password nullable (Google-only users won't have a password)
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;

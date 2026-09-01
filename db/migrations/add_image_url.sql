-- Migration: Add image_url column to items and pending_items tables
ALTER TABLE items ADD COLUMN image_url VARCHAR(500) NULL AFTER description;
ALTER TABLE pending_items ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

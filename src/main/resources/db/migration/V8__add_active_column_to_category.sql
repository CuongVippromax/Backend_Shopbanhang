-- Add active column to category table
ALTER TABLE category ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

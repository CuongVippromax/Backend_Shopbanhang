-- Add author_name column if missing
ALTER TABLE article ADD COLUMN IF NOT EXISTS author_name VARCHAR(200);

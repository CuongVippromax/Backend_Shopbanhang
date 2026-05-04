-- V11: Remove unused slug column and index from article table

-- Drop index if exists (ignore error if not exists)
DO $$
BEGIN
    DROP INDEX IF EXISTS idx_article_slug;
EXCEPTION WHEN OTHERS THEN
    NULL;
END
$$;

-- Drop slug column if exists
ALTER TABLE article DROP COLUMN IF EXISTS slug;
